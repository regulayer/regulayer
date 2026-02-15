
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configuration for Regulayer Incidents Service."""
    
    # Service
    database_url: str = "postgresql+asyncpg://incidents:incidents_password@postgres:5432/regulayer_incidents"
    internal_secret: str = "regulayer_internal_secret_value_change_in_prod"
    
    # Defaults
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_prefix = "INCIDENTS_"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Map DATABASE_URL to correct field if present
        if os.getenv("DATABASE_URL"):
             self.database_url = os.getenv("DATABASE_URL")
        
        # Auto-convert to async driver
        if "postgresql://" in self.database_url and "postgresql+asyncpg://" not in self.database_url:
            self.database_url = self.database_url.replace("postgresql://", "postgresql+asyncpg://")

        # Enforce SSL in production
        if os.getenv("ENV") == "prod":
            if not self.database_url:
                raise RuntimeError("DATABASE_URL is required in production mode")
            if "sslmode" not in self.database_url:
                raise RuntimeError("SSL is required in production (sslmode=require or verify-full)")

settings = Settings()
