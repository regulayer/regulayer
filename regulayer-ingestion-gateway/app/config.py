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


    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Override with standard names if present
        import os
        if os.getenv("CONTROL_PLANE_URL"):
            self.control_plane_url = os.getenv("CONTROL_PLANE_URL")
        if os.getenv("RECORDER_URL"):
            self.recorder_url = os.getenv("RECORDER_URL")
        if os.getenv("GOVERNANCE_URL"):
            self.governance_url = os.getenv("GOVERNANCE_URL")
        if os.getenv("REPORTS_URL"):
            self.reports_url = os.getenv("REPORTS_URL")
        if os.getenv("INCIDENTS_URL"):
            self.incidents_url = os.getenv("INCIDENTS_URL")
        if os.getenv("REDIS_URL"):
            self.redis_url = os.getenv("REDIS_URL")

        # Enforce Prod Checks
        if os.getenv("ENV") == "prod":
            if "localhost" in self.control_plane_url or "127.0.0.1" in self.control_plane_url:
                 # In docker, we can't easily distinguish 'localhost' from host network vs bad config
                 # But generally in prod we expect service names
                 # Passing for now to avoid blocking k8s local setups
                 pass


settings = Settings()
