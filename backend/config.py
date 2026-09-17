import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Darukaa.Earth"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api"

    JWT_SECRET_KEY: str = "darukaa-earth-super-secret-jwt-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    GOOGLE_CLIENT_ID: str = "demo-google-client-id.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET: str = "demo-google-client-secret"

    DATABASE_URL: str = "sqlite:///./darukaa_dev.db"

    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o"
    AI_DEMO_MODE: bool = True

    VITE_MAPBOX_TOKEN: str = "pk.eyJ1IjoiZGFydWthYSIsImEiOiJjbHNlYnZqMTAwMDAwMmlwOHp6Z3ZqZ3ZqIn0.demo_mapbox_token"

    @property
    def effective_database_url(self) -> str:
        # Vercel serverless environment check: use /tmp for writable SQLite db
        if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
            return "sqlite:////tmp/darukaa_dev.db"
        return self.DATABASE_URL

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
