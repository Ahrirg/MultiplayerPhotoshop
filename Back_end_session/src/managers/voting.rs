use axum::{extract::State, response::IntoResponse, Json};
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Deserialize)]
pub struct VotePayload {
    pub voter: String,
    pub target: String,
}

#[derive(Clone, Default)]
pub struct VoteState {
    // Maps Voter -> Target
    pub active_votes: Arc<RwLock<HashMap<String, String>>>,
}

impl VoteState {
    pub fn new() -> Self {
        Self::default()
    }
}

// POST /vote/cast
pub async fn cast_vote(
    State(state): State<Arc<VoteState>>,
    Json(payload): Json<VotePayload>,
) -> impl IntoResponse {
    let mut votes = state.active_votes.write().await;

    // Inserts or overwrites the voter's choice
    votes.insert(payload.voter, payload.target);

    axum::http::StatusCode::OK
}

// GET /vote/results
pub async fn get_results(State(state): State<Arc<VoteState>>) -> Json<HashMap<String, usize>> {
    let votes = state.active_votes.read().await;
    let mut results = HashMap::new();

    // Tally up total occurrences of each target
    for target in votes.values() {
        *results.entry(target.clone()).or_insert(0) += 1;
    }

    Json(results)
}
