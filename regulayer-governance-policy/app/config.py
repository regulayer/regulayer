"""
Regulayer Governance Policy - Configuration
"""

from pydantic_settings import BaseSettings


class PolicySettings(BaseSettings):
    """Settings for the Policy service."""
    
    policy_database_url: str = "postgresql://postgres:postgres@localhost:5432/regulayer_governance"
    debug: bool = False
    
    class Config:
        env_prefix = "POLICY_"
        env_file = ".env"


settings = PolicySettings()
