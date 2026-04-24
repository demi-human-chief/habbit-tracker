from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", case_sensitive=False
    )

    # Локально и в Docker: переменная DATABASE_URL
    database_url: str = "postgresql://habit:habit@localhost:5432/habit"

    # JWT: в проде задайте длинный случайный JWT_SECRET
    jwt_secret: str = Field(
        default="insecure_dev_only_set_JWT_SECRET_in_production_32char_min"
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 суток

    # CORS: через запятую, без пробелов (или с пробелами — обрежем)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @field_validator("jwt_secret")
    @classmethod
    def jwt_not_empty_in_prod(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError("jwt_secret must be at least 32 characters")
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
