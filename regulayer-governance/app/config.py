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
    
    # Internal Auth Secret (for Recorder/Gateway calls)
    internal_secret: str = "regulayer_internal_secret_value_change_in_prod"
    
    class Config:
        env_prefix = "GOVERNANCE_"
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Map DATABASE_URL to governance_database_url if present
        if os.getenv("DATABASE_URL"):
             self.governance_database_url = os.getenv("DATABASE_URL")
        
        # Auto-convert to async driver
        if "postgresql://" in self.governance_database_url and "postgresql+asyncpg://" not in self.governance_database_url:
            self.governance_database_url = self.governance_database_url.replace("postgresql://", "postgresql+asyncpg://")

        # Enforce SSL in production
        if os.getenv("ENV") == "prod":
            if not self.governance_database_url:
                raise RuntimeError("DATABASE_URL is required in production mode")
            if "sslmode" not in self.governance_database_url:
                raise RuntimeError("SSL is required in production (sslmode=require or verify-full)")


settings = GovernanceSettings()
