from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "OpsPilot AI"
    DATABASE_URL: str | None = None
    JWT_SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="after")
    def require_database_url(self):
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL must be set in backend/.env")
        return self

settings = Settings()