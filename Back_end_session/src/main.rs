use axum::{routing::get, Router, response::IntoResponse};
use tokio::fs;
use std::env;

async fn read_info() -> impl IntoResponse {
    let mut path = env::current_dir().unwrap();
    path.push("Info.md");
    match fs::read_to_string(path).await {
        Ok(content) => (axum::http::StatusCode::OK, content).into_response(),
        Err(_) => (axum::http::StatusCode::NOT_FOUND, "Missing file").into_response(),
    }
}

#[tokio::main]
async fn main() {
    let port = "3000"; 
    let addr = format!("0.0.0.0:{}", port);

    let app = Router::new()
                        .route("/", get(|| async { "Hello, World! from session rust server !!" }))
                        .route("/info", get(read_info));

    println!("Server listening on http://localhost:{}/", port);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}