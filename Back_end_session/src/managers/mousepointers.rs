use axum::Json;
use axum::{
    extract::{
        ws::{Message, Utf8Bytes, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
};
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};

#[derive(Clone)]
pub struct MousePointerState {
    tx: broadcast::Sender<Utf8Bytes>,
    pub history: Arc<RwLock<Vec<Utf8Bytes>>>,
}

impl MousePointerState {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(100);
        Self {
            tx,
            history: Arc::new(RwLock::new(Vec::new())),
        }
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
                let mut history = state.history.write().await;
                history.push(text.clone());

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

pub async fn get_history(State(state): State<Arc<MousePointerState>>) -> Json<Vec<String>> {
    let history = state.history.read().await;

    Json(history.iter().map(|m| m.to_string()).collect())
}
