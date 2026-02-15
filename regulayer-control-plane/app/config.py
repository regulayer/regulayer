"""
Regulayer Control Plane - Configuration
"""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Control plane settings."""
    
    # Database
    # Allow DATABASE_URL env var to override
    database_url: str = "sqlite:///./control_plane.db"
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Security
    cors_origins: list = ["*"]
    jwt_secret: str = "dev_secret"
    stripe_api_key: str = os.getenv("STRIPE_SECRET_KEY", "mock_key")
    stripe_webhook_secret: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    stripe_price_id_pro: str = os.getenv("STRIPE_PRICE_ID_PRO", "price_mock_pro")
    
    class Config:
        env_prefix = "REGULAYER_CONTROL_"
    
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Fallback to standard DATABASE_URL if present and not set by prefix
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
