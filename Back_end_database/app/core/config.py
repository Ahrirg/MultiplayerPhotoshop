from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    database_url: str = 'sqlite:///./data/app.db'
    data_dir: str = './data'

    # Jei palikta tuscia, tokenas dev rezime netikrinamas.
    # Kai DB bus jungiama tik per authority, cia ir authority .env turi sutapti tas pats tokenas.
    internal_api_token: str = ''


settings = Settings()
