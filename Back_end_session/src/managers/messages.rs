use axum::{extract::State, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub username: String,
    pub content: String,
}

#[derive(Clone)]
pub struct ChatQueue {
    pub messages: Arc<Mutex<Vec<ChatMessage>>>,
}

impl ChatQueue {
    pub fn new() -> Self {
        ChatQueue {
            messages: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add_message(&self, message: ChatMessage) {
        let mut msgs = self.messages.lock().unwrap();
        msgs.push(message);
        if msgs.len() > 30 {
            msgs.remove(0);
        }
    }

    pub fn get_messages(&self) -> Vec<ChatMessage> {
        self.messages.lock().unwrap().clone()
    }
}

pub async fn handle_get_messages(State(chat_queue): State<ChatQueue>) -> impl IntoResponse {
    Json(chat_queue.get_messages())
}

pub async fn handle_add_message(
    State(chat_queue): State<ChatQueue>,
    Json(message): Json<ChatMessage>,
) -> impl IntoResponse {
    chat_queue.add_message(message);
    Json(chat_queue.get_messages())
}