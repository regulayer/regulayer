"""
Regulayer Governance Policy - Configuration
"""

from typing import Optional
from pydantic_settings import BaseSettings


class PolicySettings(BaseSettings):
    """Settings for the Policy service."""
    
    database_url: str = "postgresql://postgres:postgres@localhost:5432/regulayer_governance"
    recorder_url: str = "http://localhost:8000"
    internal_secret: str = "dev_internal_secret"
    debug: bool = False
    groq_api_key: Optional[str] = None
    
    class Config:
        env_prefix = "POLICY_"
        env_file = ".env"


settings = PolicySettings()
