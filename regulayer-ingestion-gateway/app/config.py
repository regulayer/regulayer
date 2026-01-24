"""
Regulayer Ingestion Gateway - Configuration
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Gateway configuration."""
    
    # Service
    host: str = "0.0.0.0"
    port: int = 8400
    
    # Control Plane
    control_plane_url: str = "http://localhost:8100"
    
    # Recorder (internal only)
    recorder_url: str = "http://localhost:8000"
    
    # Rate Limits
    default_rate_limit: int = 100  # requests per minute
    burst_limit: int = 20          # burst allowance
    
    # Quotas
    default_daily_quota: int = 10000  # decisions per day
    
    # Timeouts
    forward_timeout_seconds: int = 30
    auth_timeout_seconds: int = 5
    
    class Config:
        env_prefix = "GATEWAY_"


settings = Settings()
