use crate::types::*;
use anyhow::{anyhow, Result};
use chrono::Utc;
use futures::StreamExt;
use reqwest::{header::HeaderMap, Client};
use std::collections::HashMap;
use std::time::Instant;
use url::Url;

pub struct RelayService {
    client: Client,
}

impl RelayService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    pub async fn relay_http_request(&self, request: Request) -> Result<RelayResponse> {
        let client_start_time = Instant::now();
        let client_timestamp = Utc::now().timestamp_millis();

        match self.execute_request(request, client_start_time, client_timestamp).await {
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
        let mut parsed_url = Url::parse(&request.url)
            .map_err(|e| anyhow!("Invalid URL: {}", e))?;

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

        // Prepare headers
        let mut headers = HeaderMap::new();
        headers.insert("X-Client-Timestamp", client_timestamp.to_string().parse::<reqwest::header::HeaderValue>()?);

        for (key, value) in request.headers {
            if let serde_json::Value::String(header_value) = value {
                if let Ok(header_name) = key.parse::<reqwest::header::HeaderName>() {
                    if let Ok(header_val) = header_value.parse::<reqwest::header::HeaderValue>() {
                        headers.insert(header_name, header_val);
                    }
                }
            }
        }

        // Prepare request body
        let mut request_builder = self.client
            .request(request.method.to_reqwest_method(), parsed_url)
            .headers(headers.clone());

        // Add body for methods that support it
        let methods_without_body = ["GET", "HEAD", "OPTIONS"];
        let method_str = format!("{:?}", request.method);
        
        if !methods_without_body.contains(&method_str.as_str()) {
            if let Some(content) = request.body.content {
                if !content.is_empty() {
                    request_builder = request_builder.body(content);
                    
                    // Set content-type if provided and not already set
                    if let Some(content_type) = request.body.content_type {
                        if !headers.contains_key("content-type") {
                            request_builder = request_builder.header("content-type", content_type);
                        }
                    }
                }
            }
        }

        // Execute the request
        let response = request_builder.send().await
            .map_err(|e| anyhow!("Request failed: {}", e))?;

        let response_start_time = Instant::now();

        // Handle streaming and non-streaming responses
        let should_stream = self.is_streaming_response(&response);
        let status_code = response.status().as_u16();
        let content_type = response.headers()
            .get("content-type")
            .and_then(|ct| ct.to_str().ok())
            .map(|ct| ct.split(';').next().unwrap_or(ct).to_string());

        // Process response headers
        let mut processed_headers = HashMap::new();
        for (key, value) in response.headers() {
            let key_str = key.as_str().to_string();
            let value_str = value.to_str().unwrap_or("").to_string();
            processed_headers.insert(key_str.clone(), HeaderSchema {
                id: key_str.clone(),
                name: key_str,
                value: value_str,
            });
        }

        // Read response body
        let response_body = if should_stream {
            self.read_streaming_response(response).await?
        } else {
            response.text().await
                .map_err(|e| anyhow!("Failed to read response: {}", e))?
        };

        let response_end_time = Instant::now();

        // Calculate performance metrics
        let duration = response_end_time.duration_since(client_start_time).as_secs_f64() * 1000.0;
        let latency = response_start_time.duration_since(client_start_time).as_secs_f64() * 1000.0;
        let transfer_time = response_end_time.duration_since(response_start_time).as_secs_f64() * 1000.0;
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
                processing_time: 0.0,
                transfer_time,
                transfer_size,
                transfer_encoding,
            },
        })
    }

    async fn read_streaming_response(&self, response: reqwest::Response) -> Result<String> {
        let mut stream = response.bytes_stream();
        let mut chunks = Vec::new();

        while let Some(chunk) = stream.next().await {
            let chunk = chunk.map_err(|e| anyhow!("Stream read error: {}", e))?;
            chunks.extend_from_slice(&chunk);
        }

        String::from_utf8(chunks).map_err(|e| anyhow!("Invalid UTF-8 in response: {}", e))
    }

    fn is_streaming_response(&self, response: &reqwest::Response) -> bool {
        let headers = response.headers();
        
        let content_type = headers
            .get("content-type")
            .and_then(|ct| ct.to_str().ok())
            .unwrap_or("")
            .to_lowercase();

        let transfer_encoding = headers
            .get("transfer-encoding")
            .and_then(|te| te.to_str().ok())
            .unwrap_or("")
            .to_lowercase();

        let content_length = headers
            .get("content-length")
            .and_then(|cl| cl.to_str().ok())
            .and_then(|cl| cl.parse::<usize>().ok());

        // Explicit streaming formats
        if content_type.contains("text/event-stream")
            || content_type.contains("application/x-ndjson")
            || content_type.contains("application/jsonl")
        {
            return true;
        }

        // Chunked encoding without content-length might be streaming
        // BUT only if it's NOT a regular JSON response
        if transfer_encoding.contains("chunked") && content_length.is_none() {
            // If it's regular JSON with chunked encoding, it's probably not streaming
            if content_type == "application/json" || content_type.starts_with("application/json;") {
                return false;
            }

            // Other content types with chunked encoding might be streaming
            if content_type.contains("text/plain")
                || content_type.contains("text/")
                || content_type.contains("stream")
                || content_type.is_empty()
            {
                return true;
            }
        }

        // Large responses (>5MB) - stream to avoid memory issues
        if let Some(length) = content_length {
            if length > 5 * 1024 * 1024 {
                return true;
            }
        }

        false
    }
}

impl Default for RelayService {
    fn default() -> Self {
        Self::new()
    }
}
