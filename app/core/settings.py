from typing import Optional
from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from urllib.parse import quote_plus

class NBLSettings(BaseSettings):
    # app
    APP_NAME: str = "NBL"
    ENV: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Postgres / SQLAlchemy
    DATABASE_URL: Optional[str] = None  # complete URL if provided
    POSTGRES_USER: str = "nbl"
    POSTGRES_PASSWORD: str = "nblpassword"
    POSTGRES_DB: str = "nbl_db"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432

    # alembic (optional)
    ALEMBIC_INI_PATH: str = "alembic.ini"

    # pydantic v2 settings
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def sqlalchemy_async_database_url(self) -> str:
        """
        Returns an async SQLAlchemy URL. If DATABASE_URL is set, that is used.
        Otherwise a URL is constructed from the POSTGRES_* fields.
        """
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # quote password in case it contains special chars
        pw = quote_plus(self.POSTGRES_PASSWORD or "")
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{pw}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

# single shared settings instance
settings = NBLSettings()