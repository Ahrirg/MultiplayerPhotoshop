use std::time::SystemTime;
use tokio::time::{sleep, Duration};

pub async fn shutdown_signal(game_end_time: SystemTime) {
    let now = SystemTime::now();

    if let Ok(duration) = game_end_time.duration_since(now) {
        let total = duration + Duration::from_secs(10);
        sleep(total).await;
    }
    println!("Game ended, shutting down server....");
    std::process::exit(0);
}
