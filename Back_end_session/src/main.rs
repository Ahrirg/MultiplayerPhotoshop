use axum::{
    routing::{get, post}, 
    Router,
    Json
};
use serde_json::json;
use tower_http::cors::{CorsLayer, Any};
use std::time::{Duration, SystemTime, UNIX_EPOCH};mod managers;
use std::sync::Arc;
use clap::Parser;

#[derive(Parser)]
struct Args {
    #[arg(long, default_value_t = 3000)]
    port: u16,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    let addr = format!("0.0.0.0:{}", args.port);

    let now = SystemTime::now();
    let game_start = now + Duration::from_secs(30);
    let game_end = now + Duration::from_secs(10 * 60);

    let chat_queue = managers::messages::ChatQueue::new();
    let mouse_chat = Arc::new(managers::mousepointers::MousePointerState::new());
    let canvas_chat = Arc::new(managers::mousepointers::MousePointerState::new());
    let image_chat = Arc::new(managers::mousepointers::MousePointerState::new());

    let app = Router::new()
        .route("/", get(|| async { "Hello, World! from session rust server !!" }))
        .route("/status", get(move || async move {
            Json(json!({
                "up": "Server is up",
                "status": "midgame",
                "game_start": game_start.duration_since(UNIX_EPOCH).unwrap().as_millis(),
                "game_end": game_end.duration_since(UNIX_EPOCH).unwrap().as_millis(),
            }))
        }))
        .route("/info", get(managers::api::read_info))
        .route("/messages/get", get(managers::messages::handle_get_messages))
        .route("/messages/send", post(managers::messages::handle_add_message))
        .with_state(chat_queue)
        .route("/websockets/mousepointers", get(managers::mousepointers::ws_handler))
        .with_state(mouse_chat)
        .route("/websockets/canvas", get(managers::mousepointers::ws_handler))
        .with_state(canvas_chat)
        .route("/websockets/image", get(managers::mousepointers::ws_handler))
        .with_state(image_chat)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any) 
                .allow_headers(Any)
        );

    println!("Server listening on http://localhost:{}/", args.port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}