from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "mineops"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/mineops"
    SECRET_KEY: str = "changeme"
    CORS_ORIGINS: str = "*"

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_not_be_default(cls, v: str) -> str:
        import os
        if v == "changeme" and os.environ.get("APP_ENV", "development") == "production":
            raise ValueError("SECRET_KEY must be changed in production")
        return v

    class Config:
        env_file = ".env"


settings = Settings()
