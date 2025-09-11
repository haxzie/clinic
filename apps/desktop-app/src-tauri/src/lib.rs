mod types;
mod relay;

use relay::RelayService;
use types::{Request, RelayResponse};
use std::sync::Arc;
use tokio::sync::Mutex;

// Global relay service instance
static RELAY_SERVICE: once_cell::sync::Lazy<Arc<Mutex<RelayService>>> = 
    once_cell::sync::Lazy::new(|| Arc::new(Mutex::new(RelayService::new())));

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn relay_request(request: Request) -> Result<RelayResponse, String> {
    let service = RELAY_SERVICE.lock().await;
    service.relay_http_request(request).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn health_check() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "status": "ok",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            relay_request,
            health_check
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
