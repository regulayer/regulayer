"""
Regulayer Reports - Configuration
"""

from pydantic_settings import BaseSettings


class ReportsSettings(BaseSettings):
    """Settings for the Reports service."""
    
    recorder_api_url: str = "http://localhost:8000"
    governance_api_url: str = "http://localhost:8001"
    report_version: str = "1.0.0"
    debug: bool = False
    
    class Config:
        env_prefix = "REPORTS_"
        env_file = ".env"


settings = ReportsSettings()
