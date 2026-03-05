use deadpool_redis::{Config, Pool, Runtime};
use redis::{AsyncCommands, RedisResult};
use std::sync::Arc;
use std::string::ToString;

#[derive(Clone)]
pub struct Database {
    pool: Arc<Pool>,
}

impl Database {
    pub fn create(url: &str) -> Self {
        let mut database_config = Config::default();
        database_config.url = Some(url.to_String());
        
        let pool = database_config.create_pool(Some(Runtime::Tokio1)).unwrap();


        Self{
            pool: Arc::new(pool),
        }
    }

    pub async fn exist(&self, key: &str) -> RedisResult<bool>{
        let mut connection = self.pool.get().await?;
        connection.exist(key).await
    }

    pub async fn get(&self, key: &str) -> RedisResult<str> {
        //todo
    }

    pub async fn add(&self, key: &str) -> RedisResult<str> {
        //todo
    }
}