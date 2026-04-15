"""
Regulayer Control Plane - Configuration
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Control plane settings."""
    
    # Database
    # Allow DATABASE_URL env var to override
    database_url: str = "sqlite:///./control_plane.db"
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Security
    domain: str = os.getenv("DOMAIN", "localhost")
    frontend_url: str = ""
    cors_origins: list = []
    governance_url: str = "http://governance:8002"
    internal_secret: str = "dev_internal_secret"
    stripe_api_key: str = os.getenv("STRIPE_SECRET_KEY") or "mock_key"
    stripe_webhook_secret: str = os.getenv("STRIPE_WEBHOOK_SECRET") or ""
    stripe_price_id_pro: str = os.getenv("STRIPE_PRICE_ID_PRO") or "price_mock_pro"

    # Email (SMTP)
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    from_email: str = os.getenv("FROM_EMAIL", f"no-reply@{os.getenv('DOMAIN', 'regulayer.tech')}")
    
    # Internal
    
    model_config = SettingsConfigDict(env_prefix="REGULAYER_CONTROL_")
    
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Fallback to standard DATABASE_URL if present and not set by prefix
        if os.getenv("DATABASE_URL"):
             self.database_url = os.getenv("DATABASE_URL")
        elif os.getenv("CONTROL_DB_URL"):
             self.database_url = os.getenv("CONTROL_DB_URL")
        
        # Resolve domain at runtime from env var (not class-level)
        domain = os.getenv("DOMAIN", "localhost")
        self.domain = domain
        
        # Compute frontend_url from DOMAIN (allow direct override via FRONTEND_URL env)
        if os.getenv("FRONTEND_URL"):
            self.frontend_url = os.getenv("FRONTEND_URL")
        elif domain == "localhost":
            self.frontend_url = "http://localhost:3000"
        else:
            self.frontend_url = f"https://app.{domain}"
        
        # Compute CORS origins from domain
        self.cors_origins = [
            "http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000",
            f"https://{domain}", f"https://app.{domain}", f"http://{domain}:3000"
        ]
        
        # No auto-conversion to async driver here as we use synchronous SQLAlchemy


        # Enforce SSL in production
        if os.getenv("ENV") == "prod":
            if not self.database_url:
                raise RuntimeError("DATABASE_URL is required in production mode")
            if "sslmode" not in self.database_url:
                raise RuntimeError("SSL is required in production (sslmode=require or verify-full)")


settings = Settings()
