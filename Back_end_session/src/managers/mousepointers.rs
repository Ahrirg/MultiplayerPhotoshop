use axum::{
    extract::{State, ws::{Message, Utf8Bytes, WebSocket, WebSocketUpgrade}},
    response::IntoResponse,
};
use tokio::sync::broadcast;
use std::sync::Arc;

#[derive(Clone)]
pub struct MousePointerState {
    tx: broadcast::Sender<Utf8Bytes>,
}

impl MousePointerState {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(100);
        Self { tx }
    }
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<MousePointerState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(mut socket: WebSocket, state: Arc<MousePointerState>) {
    let mut rx = state.tx.subscribe();

    println!("Client connected");

    loop {
        tokio::select! {
            Some(Ok(Message::Text(text))) = socket.recv() => {
                let _ = state.tx.send(text);
            }

            Ok(msg) = rx.recv() => {
                if socket.send(Message::Text(msg)).await.is_err() {
                    break;
                }
            }

            else => break,
        }
    }

    println!("Client disconnected");
}