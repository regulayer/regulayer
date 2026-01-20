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
    database_url: str
    
    # Security
    hmac_secret_key: str
    
    # Service configuration
    log_level: str = "INFO"
    allowed_sdk_versions: str = "1.0.0"  # Comma-separated
    max_timestamp_drift_seconds: int = 300  # 5 minutes
    
    # Chain configuration
    chain_id: str = "global"  # Constant in Phase 1, future-proofs sharding
    
    # Server configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    def get_allowed_sdk_versions(self) -> List[str]:
        """Parse allowed SDK versions from comma-separated string."""
        return [v.strip() for v in self.allowed_sdk_versions.split(",")]
    
    def validate_production_readiness(self):
        """Validate configuration for production deployment."""
        # Ensure database URL uses postgres:// or postgresql://
        if not self.database_url.startswith(("postgres://", "postgresql://")):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")
        
        # Ensure HMAC key is sufficiently strong
        if len(self.hmac_secret_key) < 32:
            raise ValueError("HMAC_SECRET_KEY must be at least 32 characters")
        
        # In production, should use TLS-enabled database
        # (This is a warning, not a hard requirement for dev)
        if "sslmode" not in self.database_url:
            import logging
            logging.warning("DATABASE_URL does not specify sslmode - consider using TLS in production")


# Global settings instance
settings = Settings()
