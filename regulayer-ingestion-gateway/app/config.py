"""
Regulayer Ingestion Gateway - Configuration
"""

import os
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
    
    # Redis (for Queue)
    redis_url: str = "redis://localhost:6379"
    redis_stream_prefix: str = "ingestion"
    
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

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if os.getenv("REDIS_URL"):
            self.redis_url = os.getenv("REDIS_URL")
        if os.getenv("CONTROL_PLANE_URL"):
            self.control_plane_url = os.getenv("CONTROL_PLANE_URL")


settings = Settings()
