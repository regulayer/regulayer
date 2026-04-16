"""
Regulayer Reports - Configuration
"""

import os
from pydantic_settings import BaseSettings


class ReportsSettings(BaseSettings):
    """Settings for the Reports service."""
    
    recorder_api_url: str = os.getenv("RECORDER_URL", "http://recorder:8000")
    governance_api_url: str = os.getenv("GOVERNANCE_URL", "http://governance:8002")
    report_version: str = "1.0.0"
    debug: bool = False
    cors_origins: str = "*"
    internal_secret: str = ""
    env: str = "production"
    
    # Cross-service secrets
    governance_internal_secret: str = os.getenv("GOVERNANCE_INTERNAL_SECRET", "")
    incidents_internal_secret: str = os.getenv("INCIDENTS_INTERNAL_SECRET", "")
    control_plane_internal_secret: str = os.getenv("CONTROL_PLANE_INTERNAL_SECRET", "")

    class Config:
        env_prefix = "REPORTS_"
        env_file = ".env"

settings = ReportsSettings()
