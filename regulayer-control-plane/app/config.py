"""
Regulayer Control Plane - Configuration
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Control plane settings."""
    
    # Database
    database_url: str = "sqlite:///./control_plane.db"
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8100
    
    # Security
    cors_origins: list = ["*"]
    
    class Config:
        env_prefix = "REGULAYER_CONTROL_"


settings = Settings()
