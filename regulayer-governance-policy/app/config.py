"""
Regulayer Governance Policy - Configuration
"""

from typing import Optional
from pydantic_settings import BaseSettings


class PolicySettings(BaseSettings):
    """Settings for the Policy service."""
    
    database_url: str = "postgresql://postgres:postgres@localhost:5432/regulayer_governance"
    recorder_url: str = "http://localhost:8000"
    control_plane_url: str = "http://control-plane:8000"
    governance_url: str = "http://governance:8002"
    incidents_url: str = "http://incidents:8005"
    internal_secret: str = "dev_internal_secret"
    slack_webhook_url: Optional[str] = None
    debug: bool = False
    groq_api_key: Optional[str] = None
    
    class Config:
        env_prefix = "POLICY_"
        env_file = ".env"


settings = PolicySettings()
