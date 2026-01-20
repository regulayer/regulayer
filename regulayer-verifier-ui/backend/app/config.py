"""
Regulayer Verification UI - Read-Only Backend Configuration

CRITICAL: Database connection MUST be read-only.
"""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Read-only verification UI backend configuration.
    
    SECURITY: Database user must have SELECT-only permissions.
    """
    
    # Database (READ-ONLY)
    database_url_readonly: str
    
    # CORS
    cors_origins: str = "http://localhost:3000"  # Frontend origin
    
    # Service
    log_level: str = "INFO"
    host: str = "0.0.0.0"
    port: int = 8001
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    def validate_readonly_access(self):
        """Validate that database connection is read-only."""
        # Check connection string suggests read-only
        if "readonly" not in self.database_url_readonly.lower():
            import logging
            logging.warning(
                "DATABASE_URL_READONLY does not contain 'readonly' - "
                "ensure database user has SELECT-only permissions"
            )
        
        # Verify it's PostgreSQL
        if not self.database_url_readonly.startswith(("postgres://", "postgresql://")):
            raise ValueError("DATABASE_URL_READONLY must be a PostgreSQL connection string")


# Global settings instance
settings = Settings()
