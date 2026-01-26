"""
Regulayer Governance - Configuration
"""

import os
from pydantic_settings import BaseSettings


class GovernanceSettings(BaseSettings):
    """Settings for the Governance service."""
    
    # Database URL for governance tables
    # Should be same DB as recorder but can be different schema/DB
    governance_database_url: str = "postgresql://postgres:postgres@localhost:5432/regulayer_governance"
    
    # Debug mode
    debug: bool = False
    
    class Config:
        env_prefix = "GOVERNANCE_"
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Map DATABASE_URL to governance_database_url if present
        if os.getenv("DATABASE_URL"):
             self.governance_database_url = os.getenv("DATABASE_URL")


settings = GovernanceSettings()
