use crate::types::*;
use anyhow::{anyhow, Result};
use chrono::Utc;
use http_body_util::{BodyExt, Full};
use hyper::body::Bytes;
use hyper::{Method, Request as HyperRequest, Uri};
use hyper_rustls::{HttpsConnector, HttpsConnectorBuilder};
use hyper_util::client::legacy::{connect::HttpConnector, Client};
use hyper_util::rt::TokioExecutor;
use std::collections::HashMap;
use std::time::Instant;
use url::Url;

pub struct RelayService {
    client: Client<HttpsConnector<HttpConnector>, Full<Bytes>>,
}

impl RelayService {
    pub fn new() -> Self {
        // Build HTTPS connector with rustls
        let https = HttpsConnectorBuilder::new()
            .with_native_roots()
            .expect("Failed to load native root certificates")
            .https_or_http()
            .enable_http1()
            .enable_http2()
            .build();

        // Create hyper client with connection pooling
        let client = Client::builder(TokioExecutor::new()).build(https);

        Self { client }
    }

    pub async fn relay_http_request(&self, request: Request) -> Result<RelayResponse> {
        let client_start_time = Instant::now();
        let client_timestamp = Utc::now().timestamp_millis();

        match self
            .execute_request(request, client_start_time, client_timestamp)
            .await
        {
            Ok(response) => Ok(RelayResponse {
                status: "success".to_string(),
                response: Some(response),
                message: None,
                timestamp: Utc::now().to_rfc3339(),
            }),
            Err(e) => Ok(RelayResponse {
                status: "error".to_string(),
                response: None,
                message: Some(e.to_string()),
                timestamp: Utc::now().to_rfc3339(),
            }),
        }
    }

    async fn execute_request(
        &self,
        request: Request,
        client_start_time: Instant,
        client_timestamp: i64,
    ) -> Result<Response> {
        // Parse URL and add query parameters
        let mut parsed_url =
            Url::parse(&request.url).map_err(|e| anyhow!("Invalid URL: {}", e))?;

        // Add query parameters
        for (key, value) in request.params {
            let value_str = match value {
                serde_json::Value::String(s) => s,
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::Bool(b) => b.to_string(),
                _ => value.to_string(),
            };
            parsed_url.query_pairs_mut().append_pair(&key, &value_str);
        }

        // NOTE: For truly accurate DNS/TCP/TLS timing, we would need lower-level instrumentation
        // The current implementation measures TTFB which includes connection + processing

        // Convert method
        let method = match request.method {
            RequestMethod::GET => Method::GET,
            RequestMethod::POST => Method::POST,
            RequestMethod::PUT => Method::PUT,
            RequestMethod::DELETE => Method::DELETE,
            RequestMethod::PATCH => Method::PATCH,
            RequestMethod::OPTIONS => Method::OPTIONS,
            RequestMethod::HEAD => Method::HEAD,
        };

        // Build hyper request
        let uri: Uri = parsed_url.as_str().parse()?;
        let mut hyper_req_builder = HyperRequest::builder().method(method).uri(&uri);

        // Add headers
        for (key, value) in request.headers {
            if let serde_json::Value::String(header_value) = value {
                hyper_req_builder = hyper_req_builder.header(key.as_str(), header_value);
            }
        }

        // Add client timestamp header
        hyper_req_builder =
            hyper_req_builder.header("X-Client-Timestamp", client_timestamp.to_string());

        // Build request body
        let methods_without_body = ["GET", "HEAD", "OPTIONS"];
        let method_str = format!("{:?}", request.method);

        let hyper_req = if !methods_without_body.contains(&method_str.as_str()) {
            if let Some(content) = request.body.content {
                if !content.is_empty() {
                    // Set content-type if provided
                    let mut builder = hyper_req_builder;
                    if let Some(content_type) = request.body.content_type {
                        builder = builder.header("content-type", content_type);
                    }
                    builder.body(Full::new(Bytes::from(content)))?
                } else {
                    hyper_req_builder.body(Full::new(Bytes::new()))?
                }
            } else {
                hyper_req_builder.body(Full::new(Bytes::new()))?
            }
        } else {
            hyper_req_builder.body(Full::new(Bytes::new()))?
        };

        // Mark request send time (just before making the request)
        let request_send_time = Instant::now();

        // Execute request
        let response = self
            .client
            .request(hyper_req)
            .await
            .map_err(|e| anyhow!("Request failed: {}", e))?;

        // Mark response headers received time (TTFB)
        let response_headers_time = Instant::now();

        let status_code = response.status().as_u16();

        // Process response headers
        let mut processed_headers = HashMap::new();
        for (key, value) in response.headers() {
            let key_str = key.as_str().to_string();
            let value_str = value.to_str().unwrap_or("").to_string();
            processed_headers.insert(
                key_str.clone(),
                HeaderSchema {
                    id: key_str.clone(),
                    name: key_str,
                    value: value_str,
                },
            );
        }

        let content_type = response
            .headers()
            .get("content-type")
            .and_then(|ct| ct.to_str().ok())
            .map(|ct| ct.split(';').next().unwrap_or(ct).to_string());

        // Read response body
        let body_bytes = response
            .into_body()
            .collect()
            .await
            .map_err(|e| anyhow!("Failed to read response body: {}", e))?
            .to_bytes();

        let response_body =
            String::from_utf8(body_bytes.to_vec()).unwrap_or_else(|_| "[Binary data]".to_string());

        // Mark response body fully received
        let response_complete_time = Instant::now();

        // Calculate timing metrics from measurable points
        // 
        // TTFB (Time To First Byte) = Time from request send until first response byte (headers)
        // This includes: DNS + TCP + TLS (for new connections) + network RTT + server processing
        let ttfb = response_headers_time
            .duration_since(request_send_time)
            .as_secs_f64()
            * 1000.0;

        // Split TTFB into latency and processing using heuristics
        // 
        // For HTTPS connections, typical breakdown:
        // - DNS: 20-120ms (depends on cache)
        // - TCP handshake: 1-100ms (depends on distance)
        // - TLS handshake: 50-200ms (depends on distance and cipher)
        // - Total connection: 70-400ms for new connections, ~0ms for reused
        // - Network RTT: 1-200ms
        // - Server processing: varies widely
        //
        // Heuristic: If TTFB > 100ms, likely includes connection overhead
        // Split conservatively: ~30-40% connection, rest is RTT + processing
        
        let (latency, processing_time) = if ttfb > 100.0 {
            // Longer TTFB - likely a new connection
            // Assume 35% is connection establishment (DNS + TCP + TLS)
            // Remaining 65% is network RTT + server processing
            let connection_overhead = ttfb * 0.35;
            let remaining = ttfb - connection_overhead;
            
            // Of remaining time, assume 25% is network RTT, 75% is server processing
            let processing = remaining * 0.75;
            
            (connection_overhead, processing)
        } else if ttfb > 20.0 {
            // Medium TTFB - connection likely reused
            // Assume 10% is connection overhead, rest is RTT + processing
            let connection_overhead = ttfb * 0.10;
            let remaining = ttfb - connection_overhead;
            
            // 30% network RTT, 70% server processing
            let processing = remaining * 0.70;
            
            (connection_overhead, processing)
        } else {
            // Very fast response (< 20ms) - likely local or cached
            // Minimal connection overhead, mostly processing
            let connection_overhead = ttfb * 0.05;
            let processing = ttfb - connection_overhead;
            
            (connection_overhead, processing)
        };

        // NOTE: For truly accurate measurements, have your server send timing headers:
        // Server-Timing: db;dur=53, app;dur=47.2
        // Then parse and use those values for processing_time

        // Transfer Time = Time to download response body after headers
        let transfer_time = response_complete_time
            .duration_since(response_headers_time)
            .as_secs_f64()
            * 1000.0;

        // Total Duration = End-to-end time
        let duration = response_complete_time
            .duration_since(client_start_time)
            .as_secs_f64()
            * 1000.0;

        let transfer_size = response_body.len();
        let transfer_encoding = processed_headers
            .get("transfer-encoding")
            .map(|h| h.value.clone())
            .unwrap_or_else(|| "identity".to_string());

        Ok(Response {
            headers: processed_headers,
            content_type,
            status_code,
            content: response_body,
            performance: ResponsePerformance {
                duration,
                latency,
                processing_time,
                transfer_time,
                transfer_size,
                transfer_encoding,
            },
        })
    }
}

impl Default for RelayService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wiremock::matchers::{method, path, header, body_string, header_exists};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    #[tokio::test]
    async fn test_simple_get_request() {
        // Start a mock server
        let mock_server = MockServer::start().await;

        // Configure the mock endpoint
        Mock::given(method("GET"))
            .and(path("/test"))
            .respond_with(ResponseTemplate::new(200).set_body_string("Hello, World!"))
            .mount(&mock_server)
            .await;

        // Create relay service and make request
        let service = RelayService::new();
        let request = Request {
            url: format!("{}/test", mock_server.uri()),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();

        // Assertions
        assert_eq!(response.status, "success");
        assert!(response.response.is_some());
        
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        assert_eq!(resp.content, "Hello, World!");
        
        // Check timing metrics are captured
        assert!(resp.performance.duration > 0.0);
        assert!(resp.performance.latency >= 0.0);
        assert!(resp.performance.processing_time >= 0.0);
        assert!(resp.performance.transfer_time >= 0.0);
    }

    #[tokio::test]
    async fn test_post_request_with_body() {
        let mock_server = MockServer::start().await;

        Mock::given(method("POST"))
            .and(path("/api/data"))
            .and(body_string(r#"{"name":"test"}"#))
            .respond_with(
                ResponseTemplate::new(201)
                    .set_body_string(r#"{"id":123,"name":"test"}"#)
                    .insert_header("content-type", "application/json")
            )
            .mount(&mock_server)
            .await;

        let service = RelayService::new();
        let mut headers = HashMap::new();
        headers.insert("content-type".to_string(), serde_json::Value::String("application/json".to_string()));

        let request = Request {
            url: format!("{}/api/data", mock_server.uri()),
            method: RequestMethod::POST,
            headers,
            body: RequestBody {
                content_type: Some("application/json".to_string()),
                content: Some(r#"{"name":"test"}"#.to_string()),
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();

        assert_eq!(response.status, "success");
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 201);
        assert!(resp.content.contains("123"));
    }

    #[tokio::test]
    async fn test_request_with_query_params() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/search"))
            .respond_with(ResponseTemplate::new(200).set_body_string("Search results"))
            .mount(&mock_server)
            .await;

        let service = RelayService::new();
        let mut params = HashMap::new();
        params.insert("q".to_string(), serde_json::Value::String("rust".to_string()));
        params.insert("limit".to_string(), serde_json::Value::Number(10.into()));

        let request = Request {
            url: format!("{}/search", mock_server.uri()),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params,
        };

        let response = service.relay_http_request(request).await.unwrap();

        assert_eq!(response.status, "success");
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        assert_eq!(resp.content, "Search results");
    }

    #[tokio::test]
    async fn test_request_with_custom_headers() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/protected"))
            .and(header("Authorization", "Bearer token123"))
            .respond_with(ResponseTemplate::new(200).set_body_string("Authorized"))
            .mount(&mock_server)
            .await;

        let service = RelayService::new();
        let mut headers = HashMap::new();
        headers.insert(
            "Authorization".to_string(),
            serde_json::Value::String("Bearer token123".to_string())
        );

        let request = Request {
            url: format!("{}/protected", mock_server.uri()),
            method: RequestMethod::GET,
            headers,
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();

        assert_eq!(response.status, "success");
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
    }

    #[tokio::test]
    async fn test_different_http_methods() {
        let mock_server = MockServer::start().await;

        // Test PUT
        Mock::given(method("PUT"))
            .and(path("/resource"))
            .respond_with(ResponseTemplate::new(200))
            .mount(&mock_server)
            .await;

        let service = RelayService::new();
        let request = Request {
            url: format!("{}/resource", mock_server.uri()),
            method: RequestMethod::PUT,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: Some("updated".to_string()),
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.status, "success");

        // Test DELETE
        Mock::given(method("DELETE"))
            .and(path("/resource"))
            .respond_with(ResponseTemplate::new(204))
            .mount(&mock_server)
            .await;

        let request = Request {
            url: format!("{}/resource", mock_server.uri()),
            method: RequestMethod::DELETE,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.status, "success");
        assert_eq!(response.response.unwrap().status_code, 204);

        // Test PATCH
        Mock::given(method("PATCH"))
            .and(path("/resource"))
            .respond_with(ResponseTemplate::new(200))
            .mount(&mock_server)
            .await;

        let request = Request {
            url: format!("{}/resource", mock_server.uri()),
            method: RequestMethod::PATCH,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: Some("patch".to_string()),
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.status, "success");
    }

    #[tokio::test]
    async fn test_response_headers_captured() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/test"))
            .respond_with(
                ResponseTemplate::new(200)
                    .set_body_string("test")
                    .insert_header("X-Custom-Header", "CustomValue")
                    .insert_header("Content-Type", "text/plain")
            )
            .mount(&mock_server)
            .await;

        let service = RelayService::new();
        let request = Request {
            url: format!("{}/test", mock_server.uri()),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        let resp = response.response.unwrap();

        // Check that custom header was captured
        assert!(resp.headers.contains_key("x-custom-header"));
        assert_eq!(resp.headers.get("x-custom-header").unwrap().value, "CustomValue");
    }

    #[tokio::test]
    async fn test_error_handling_invalid_url() {
        let service = RelayService::new();
        let request = Request {
            url: "not-a-valid-url".to_string(),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.status, "error");
        assert!(response.message.is_some());
        assert!(response.message.unwrap().contains("Invalid URL"));
    }

    #[tokio::test]
    async fn test_timing_metrics_are_reasonable() {
        let mock_server = MockServer::start().await;

        // Add a small delay to make timing more measurable
        Mock::given(method("GET"))
            .and(path("/slow"))
            .respond_with(
                ResponseTemplate::new(200)
                    .set_body_string("delayed response")
                    .set_delay(std::time::Duration::from_millis(50))
            )
            .mount(&mock_server)
            .await;

        let service = RelayService::new();
        let request = Request {
            url: format!("{}/slow", mock_server.uri()),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        let perf = response.response.unwrap().performance;

        // Duration should be at least 50ms due to the delay
        assert!(perf.duration >= 50.0, "Duration should be at least 50ms, got {}", perf.duration);
        
        // All timing components should be non-negative
        assert!(perf.latency >= 0.0, "Latency should be non-negative, got {}", perf.latency);
        assert!(perf.processing_time >= 0.0, "Processing time should be non-negative, got {}", perf.processing_time);
        assert!(perf.transfer_time >= 0.0, "Transfer time should be non-negative, got {}", perf.transfer_time);
        
        // Duration should be greater than the sum of network components
        // Note: Duration includes request preparation overhead which isn't in latency/processing/transfer
        let sum = perf.latency + perf.processing_time + perf.transfer_time;
        assert!(perf.duration >= sum, 
            "Duration ({}) should be >= sum of components ({})", 
            perf.duration, sum);
        
        // But the difference shouldn't be huge (allow up to 2000ms overhead for request prep and mock server overhead)
        let overhead = perf.duration - sum;
        assert!(overhead < 2000.0, 
            "Overhead ({}) between duration and components seems too large", overhead);
    }

    #[tokio::test]
    async fn test_large_response_body() {
        let mock_server = MockServer::start().await;
        
        // Create a large response body (1MB)
        let large_body = "x".repeat(1024 * 1024);

        Mock::given(method("GET"))
            .and(path("/large"))
            .respond_with(ResponseTemplate::new(200).set_body_string(large_body.clone()))
            .mount(&mock_server)
            .await;

        let service = RelayService::new();
        let request = Request {
            url: format!("{}/large", mock_server.uri()),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        let resp = response.response.unwrap();

        assert_eq!(resp.status_code, 200);
        assert_eq!(resp.performance.transfer_size, 1024 * 1024);
        assert!(resp.performance.transfer_time > 0.0, "Transfer time should be measured for large response");
    }

    #[tokio::test]
    async fn test_client_timestamp_header_sent() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/test"))
            .and(header_exists("X-Client-Timestamp"))
            .respond_with(ResponseTemplate::new(200))
            .mount(&mock_server)
            .await;

        let service = RelayService::new();
        let request = Request {
            url: format!("{}/test", mock_server.uri()),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.status, "success");
    }
}

#[cfg(test)]
mod e2e_tests {
    use super::*;
    use axum::{
        body::Body,
        extract::{Path, Query},
        http::StatusCode,
        response::Response,
        routing::{delete, get, patch, post, put},
        Json, Router,
    };
    use serde::{Deserialize, Serialize};
    use std::net::SocketAddr;
    use tokio::time::{sleep, Duration};

    #[derive(Debug, Serialize, Deserialize)]
    struct TestUser {
        id: u32,
        name: String,
        email: String,
    }

    #[derive(Debug, Deserialize)]
    struct SearchQuery {
        q: String,
        limit: Option<u32>,
    }

    /// Create a test HTTP server with various endpoints
    async fn create_test_server() -> (Router, SocketAddr) {
        let app = Router::new()
            .route("/", get(|| async { "Test Server Running" }))
            .route("/hello", get(|| async { "Hello, World!" }))
            .route(
                "/echo",
                post(|body: String| async move { body }),
            )
            .route(
                "/json",
                get(|| async {
                    Json(TestUser {
                        id: 1,
                        name: "John Doe".to_string(),
                        email: "john@example.com".to_string(),
                    })
                }),
            )
            .route(
                "/users",
                post(|Json(payload): Json<TestUser>| async move {
                    (StatusCode::CREATED, Json(payload))
                }),
            )
            .route(
                "/users/:id",
                get(|Path(id): Path<u32>| async move {
                    Json(TestUser {
                        id,
                        name: format!("User {}", id),
                        email: format!("user{}@example.com", id),
                    })
                }),
            )
            .route(
                "/users/:id",
                put(|Path(id): Path<u32>, Json(mut user): Json<TestUser>| async move {
                    user.id = id;
                    Json(user)
                }),
            )
            .route(
                "/users/:id",
                delete(|Path(_id): Path<u32>| async move {
                    StatusCode::NO_CONTENT
                }),
            )
            .route(
                "/users/:id",
                patch(|Path(id): Path<u32>, body: String| async move {
                    format!("Patched user {} with: {}", id, body)
                }),
            )
            .route(
                "/search",
                get(|Query(params): Query<SearchQuery>| async move {
                    format!(
                        "Search results for '{}' (limit: {})",
                        params.q,
                        params.limit.unwrap_or(10)
                    )
                }),
            )
            .route(
                "/slow",
                get(|| async {
                    sleep(Duration::from_millis(100)).await;
                    "Slow response"
                }),
            )
            .route(
                "/large",
                get(|| async {
                    // Return 500KB of data
                    "x".repeat(500 * 1024)
                }),
            )
            .route(
                "/status/:code",
                get(|Path(code): Path<u16>| async move {
                    StatusCode::from_u16(code).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
                }),
            )
            .route(
                "/headers",
                get(|| async {
                    Response::builder()
                        .status(StatusCode::OK)
                        .header("X-Custom-Header", "test-value")
                        .header("X-Request-ID", "12345")
                        .body(Body::from("Headers test"))
                        .unwrap()
                }),
            )
            .route(
                "/auth",
                get(|headers: axum::http::HeaderMap| async move {
                    if let Some(auth) = headers.get("authorization") {
                        if auth == "Bearer secret-token" {
                            return (StatusCode::OK, "Authorized");
                        }
                    }
                    (StatusCode::UNAUTHORIZED, "Unauthorized")
                }),
            );

        let addr = SocketAddr::from(([127, 0, 0, 1], 0)); // Port 0 = random available port
        (app, addr)
    }

    /// Start the test server and return its address
    async fn start_test_server() -> String {
        let (app, addr) = create_test_server().await;
        
        let listener = tokio::net::TcpListener::bind(addr)
            .await
            .expect("Failed to bind test server");
        let actual_addr = listener.local_addr().expect("Failed to get local address");

        tokio::spawn(async move {
            axum::serve(listener, app)
                .await
                .expect("Failed to start test server");
        });

        // Give the server a moment to start
        sleep(Duration::from_millis(50)).await;

        format!("http://{}", actual_addr)
    }

    #[tokio::test]
    async fn test_e2e_simple_get() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let request = Request {
            url: format!("{}/hello", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        assert_eq!(response.status, "success");
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        assert_eq!(resp.content, "Hello, World!");
    }

    #[tokio::test]
    async fn test_e2e_json_response() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let request = Request {
            url: format!("{}/json", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        assert_eq!(response.status, "success");
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        
        let user: TestUser = serde_json::from_str(&resp.content).unwrap();
        assert_eq!(user.id, 1);
        assert_eq!(user.name, "John Doe");
    }

    #[tokio::test]
    async fn test_e2e_post_with_json() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let user = TestUser {
            id: 0,
            name: "Jane Smith".to_string(),
            email: "jane@example.com".to_string(),
        };

        let request = Request {
            url: format!("{}/users", server_url),
            method: RequestMethod::POST,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: Some("application/json".to_string()),
                content: Some(serde_json::to_string(&user).unwrap()),
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        assert_eq!(response.status, "success");
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 201);
        
        let created_user: TestUser = serde_json::from_str(&resp.content).unwrap();
        assert_eq!(created_user.name, "Jane Smith");
    }

    #[tokio::test]
    async fn test_e2e_path_parameters() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let request = Request {
            url: format!("{}/users/42", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        
        let user: TestUser = serde_json::from_str(&resp.content).unwrap();
        assert_eq!(user.id, 42);
    }

    #[tokio::test]
    async fn test_e2e_query_parameters() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let mut params = HashMap::new();
        params.insert("q".to_string(), serde_json::Value::String("rust".to_string()));
        params.insert("limit".to_string(), serde_json::Value::Number(20.into()));

        let request = Request {
            url: format!("{}/search", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params,
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        assert!(resp.content.contains("rust"));
        assert!(resp.content.contains("20"));
    }

    #[tokio::test]
    async fn test_e2e_put_request() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let user = TestUser {
            id: 0,
            name: "Updated Name".to_string(),
            email: "updated@example.com".to_string(),
        };

        let request = Request {
            url: format!("{}/users/5", server_url),
            method: RequestMethod::PUT,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: Some("application/json".to_string()),
                content: Some(serde_json::to_string(&user).unwrap()),
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        
        let updated_user: TestUser = serde_json::from_str(&resp.content).unwrap();
        assert_eq!(updated_user.id, 5);
        assert_eq!(updated_user.name, "Updated Name");
    }

    #[tokio::test]
    async fn test_e2e_delete_request() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let request = Request {
            url: format!("{}/users/10", server_url),
            method: RequestMethod::DELETE,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 204);
    }

    #[tokio::test]
    async fn test_e2e_patch_request() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let request = Request {
            url: format!("{}/users/7", server_url),
            method: RequestMethod::PATCH,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: Some("text/plain".to_string()),
                content: Some("partial update".to_string()),
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        assert!(resp.content.contains("Patched user 7"));
    }

    #[tokio::test]
    async fn test_e2e_slow_response() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let request = Request {
            url: format!("{}/slow", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let start = Instant::now();
        let response = service.relay_http_request(request).await.unwrap();
        let elapsed = start.elapsed();

        assert_eq!(response.status, "success");
        let resp = response.response.unwrap();
        
        // Should take at least 100ms due to sleep
        assert!(elapsed.as_millis() >= 100);
        assert!(resp.performance.duration >= 100.0);
    }

    #[tokio::test]
    async fn test_e2e_large_response() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let request = Request {
            url: format!("{}/large", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        
        // Should be 500KB
        assert_eq!(resp.performance.transfer_size, 500 * 1024);
        assert!(resp.performance.transfer_time > 0.0);
    }

    #[tokio::test]
    async fn test_e2e_different_status_codes() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        // Test 201 Created
        let request = Request {
            url: format!("{}/status/201", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.response.unwrap().status_code, 201);

        // Test 404 Not Found
        let request = Request {
            url: format!("{}/status/404", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.response.unwrap().status_code, 404);

        // Test 500 Internal Server Error
        let request = Request {
            url: format!("{}/status/500", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.response.unwrap().status_code, 500);
    }

    #[tokio::test]
    async fn test_e2e_custom_headers() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let request = Request {
            url: format!("{}/headers", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        let resp = response.response.unwrap();
        assert!(resp.headers.contains_key("x-custom-header"));
        assert_eq!(resp.headers.get("x-custom-header").unwrap().value, "test-value");
        assert!(resp.headers.contains_key("x-request-id"));
    }

    #[tokio::test]
    async fn test_e2e_authentication() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        // Test without auth header - should fail
        let request = Request {
            url: format!("{}/auth", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.response.as_ref().unwrap().status_code, 401);

        // Test with correct auth header - should succeed
        let mut headers = HashMap::new();
        headers.insert(
            "authorization".to_string(),
            serde_json::Value::String("Bearer secret-token".to_string()),
        );

        let request = Request {
            url: format!("{}/auth", server_url),
            method: RequestMethod::GET,
            headers,
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        assert_eq!(response.response.unwrap().status_code, 200);
    }

    #[tokio::test]
    async fn test_e2e_timing_metrics_accuracy() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let request = Request {
            url: format!("{}/hello", server_url),
            method: RequestMethod::GET,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: None,
                content: None,
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        let perf = response.response.unwrap().performance;

        // All metrics should be captured
        assert!(perf.duration > 0.0, "Duration should be positive");
        assert!(perf.latency >= 0.0, "Latency should be non-negative");
        assert!(perf.processing_time >= 0.0, "Processing time should be non-negative");
        assert!(perf.transfer_time >= 0.0, "Transfer time should be non-negative");

        // Duration should be reasonable (less than 1 second for local server)
        assert!(perf.duration < 1000.0, "Duration should be under 1 second for local request");

        // Latency should be non-negative (may be 0 for reused connections)
        assert!(perf.latency >= 0.0, "Latency should be non-negative");
    }

    #[tokio::test]
    async fn test_e2e_echo_request_body() {
        let server_url = start_test_server().await;
        let service = RelayService::new();

        let test_body = "Echo this message back";

        let request = Request {
            url: format!("{}/echo", server_url),
            method: RequestMethod::POST,
            headers: HashMap::new(),
            body: RequestBody {
                content_type: Some("text/plain".to_string()),
                content: Some(test_body.to_string()),
            },
            params: HashMap::new(),
        };

        let response = service.relay_http_request(request).await.unwrap();
        
        let resp = response.response.unwrap();
        assert_eq!(resp.status_code, 200);
        assert_eq!(resp.content, test_body);
    }
}
