use axum::{
    routing::{get, post}, 
    Router
};
use tower_http::cors::{CorsLayer, Any};
mod managers;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    let port = "3000";
    let addr = format!("0.0.0.0:{}", port);

    let chat_queue = managers::messages::ChatQueue::new();
    let mouse_chat = Arc::new(managers::mousepointers::MousePointerState::new());
    let canvas_chat = Arc::new(managers::mousepointers::MousePointerState::new());

    let app = Router::new()
        .route("/", get(|| async { "Hello, World! from session rust server !!" }))
        .route("/info", get(managers::api::read_info))
        .route("/messages/get", get(managers::messages::handle_get_messages))
        .route("/messages/send", post(managers::messages::handle_add_message))
        .with_state(chat_queue)
        .route("/websockets/mousepointers", get(managers::mousepointers::ws_handler))
        .with_state(mouse_chat)
        .route("/websockets/canvas", get(managers::mousepointers::ws_handler))
        .with_state(canvas_chat)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any) 
                .allow_headers(Any)
        );

    println!("Server listening on http://localhost:{}/", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}