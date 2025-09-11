use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterSchema {
    pub id: String,
    pub name: String,
    pub value: String,
}

pub type RequestParameters = HashMap<String, ParameterSchema>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeaderSchema {
    pub id: String,
    pub name: String,
    pub value: String,
}

pub type RequestHeaders = HashMap<String, HeaderSchema>;
pub type ResponseHeaders = HashMap<String, HeaderSchema>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestBody {
    #[serde(rename = "contentType")]
    pub content_type: Option<String>,
    pub content: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthorizationType {
    #[serde(rename = "NONE")]
    None,
    #[serde(rename = "BASIC")]
    Basic,
    #[serde(rename = "BEARER")]
    Bearer,
    #[serde(rename = "API_KEY")]
    ApiKey,
    #[serde(rename = "OAUTH2")]
    OAuth2,
    #[serde(rename = "CUSTOM")]
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Authorization {
    #[serde(rename = "NONE")]
    None,
    #[serde(rename = "BASIC")]
    Basic {
        username: String,
        password: String,
    },
    #[serde(rename = "BEARER")]
    Bearer {
        token: String,
    },
    #[serde(rename = "API_KEY")]
    ApiKey {
        key: String,
    },
    #[serde(rename = "OAUTH2")]
    OAuth2 {
        token: String,
    },
    #[serde(rename = "CUSTOM")]
    Custom {
        token: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RequestMethod {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    OPTIONS,
    HEAD,
}

impl RequestMethod {
    pub fn to_reqwest_method(&self) -> reqwest::Method {
        match self {
            RequestMethod::GET => reqwest::Method::GET,
            RequestMethod::POST => reqwest::Method::POST,
            RequestMethod::PUT => reqwest::Method::PUT,
            RequestMethod::DELETE => reqwest::Method::DELETE,
            RequestMethod::PATCH => reqwest::Method::PATCH,
            RequestMethod::OPTIONS => reqwest::Method::OPTIONS,
            RequestMethod::HEAD => reqwest::Method::HEAD,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponsePerformance {
    pub duration: f64,
    pub latency: f64,
    #[serde(rename = "processingTime")]
    pub processing_time: f64,
    #[serde(rename = "transferTime")]
    pub transfer_time: f64,
    #[serde(rename = "transferSize")]
    pub transfer_size: usize,
    #[serde(rename = "transferEncoding")]
    pub transfer_encoding: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Request {
    pub url: String,
    pub method: RequestMethod,
    pub headers: HashMap<String, serde_json::Value>,
    pub body: RequestBody,
    pub params: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub headers: ResponseHeaders,
    #[serde(rename = "contentType")]
    pub content_type: Option<String>,
    #[serde(rename = "statusCode")]
    pub status_code: u16,
    pub content: String,
    pub performance: ResponsePerformance,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelayResponse {
    pub status: String,
    pub response: Option<Response>,
    pub message: Option<String>,
    pub timestamp: String,
}
