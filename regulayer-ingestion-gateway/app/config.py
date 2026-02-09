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
    
    # Governance (internal only)
    governance_url: str = "http://localhost:8002"
    
    # Reports (internal only)
    reports_url: str = "http://localhost:8003"
    
    # Incidents (internal only)
    incidents_url: str = "http://incidents:8000"
    
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
    
    # Demo/Prod Mode
    gateway_mode: str = "prod"  # "demo" or "prod"
    
    # Internal Auth
    governance_internal_secret: str = "regulayer_internal_secret_value_change_in_prod"
    
    class Config:
        env_prefix = "GATEWAY_"


settings = Settings()
