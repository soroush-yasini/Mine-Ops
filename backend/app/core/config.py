from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "mineops"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/mineops"
    SECRET_KEY: str = "changeme"

    class Config:
        env_file = ".env"


settings = Settings()
