use axum::{response::IntoResponse};
use tokio::fs;
use std::env;

pub async fn read_info() -> impl IntoResponse {
    let mut path = env::current_dir().unwrap();
    path.push("Info.md");
    match fs::read_to_string(path).await {
        Ok(content) => (axum::http::StatusCode::OK, content).into_response(),
        Err(_) => (axum::http::StatusCode::NOT_FOUND, "Missing file").into_response(),
    }
}