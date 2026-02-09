
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configuration for Regulayer Incidents Service."""
    
    # Service
    database_url: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/regulayer"
    internal_secret: str = "regulayer_internal_secret_value_change_in_prod"
    
    # Defaults
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_prefix = "INCIDENTS_"

settings = Settings()
