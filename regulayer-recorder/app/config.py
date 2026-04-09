"""
Regulayer Decision Recorder - Configuration

Service configuration with secrets management and validation.
"""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Service configuration.
    
    All sensitive values must be provided via environment variables.
    """
    
    # Database
    database_url: str | None = None
    recorder_db_url: str | None = None
    
    # Security
    hmac_secret_key: str
    governance_internal_secret: str = "regulayer_internal_secret_value_change_in_prod" # Fallback for dev
    recorder_signing_key_path: str = "recorder_ed25519.key"
    
    # Service configuration
    log_level: str = "INFO"
    allowed_sdk_versions: str = "1.0.0,2.0.0,2.0.1"  # Comma-separated
    max_timestamp_drift_seconds: int = 300  # 5 minutes
    
    # Ingestion configuration
    allow_legacy_ingestion: bool = True  # Phase 2.2 default

    
    # Chain configuration
    chain_id: str = "global"  # Constant in Phase 1, future-proofs sharding
    
    # Environment mode (Phase I.1)
    recorder_environment: str = "prod"  # "demo" or "prod"
    
    # Server configuration
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "*"

    # Governance
    governance_url: str = "http://governance:8002"
    policy_engine_url: str = "http://policy-engine:8000"
    
    # Incidents
    incidents_url: str = "http://incidents:8000"
    incidents_internal_secret: str = "regulayer_internal_secret_value_change_in_prod"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    


    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Map recorder_db_url to database_url if not set
        if not self.database_url and self.recorder_db_url:
            self.database_url = self.recorder_db_url
    
    def get_allowed_sdk_versions(self) -> List[str]:
        """Parse allowed SDK versions from comma-separated string."""
        return [v.strip() for v in self.allowed_sdk_versions.split(",")]
    
    def validate_production_readiness(self):
        """Validate configuration for production deployment."""
        if not self.database_url:
            raise RuntimeError("DATABASE_URL is required in production mode")

        # Auto-convert to async driver
        if "postgresql://" in self.database_url and "postgresql+asyncpg://" not in self.database_url:
            self.database_url = self.database_url.replace("postgresql://", "postgresql+asyncpg://")

        # Enforce SSL in production
        if self.recorder_environment == "prod" and "sslmode" not in self.database_url:
            raise RuntimeError("SSL is required in production (sslmode=require or verify-full)")
        
        # Ensure HMAC key is sufficiently strong
        if len(self.hmac_secret_key) < 32:
            raise ValueError("HMAC_SECRET_KEY must be at least 32 characters")

# Global settings instance
settings = Settings()
settings.validate_production_readiness()
