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
    stripe_api_key: str = "mock_key"
    
    class Config:
        env_prefix = "REGULAYER_CONTROL_"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Fallback to standard DATABASE_URL if present and not set by prefix
        if os.getenv("DATABASE_URL") and self.database_url == "sqlite:///./control_plane.db":
             self.database_url = os.getenv("DATABASE_URL")


settings = Settings()
