use axum::{routing::get, Router};
mod managers;

#[tokio::main]
async fn main() {
    let port = "3000"; 
    let addr = format!("0.0.0.0:{}", port);

    let app = Router::new()
                        .route("/", get(|| async { "Hello, World! from session rust server !!" }))
                        .route("/info", get(managers::api::read_info));

    println!("Server listening on http://localhost:{}/", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}