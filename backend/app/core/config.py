from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    APP_NAME: str = "Avaliador de Veículos Usados"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    MODEL_PATH: str = "ml/models/model.joblib"

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]


settings = Settings()
