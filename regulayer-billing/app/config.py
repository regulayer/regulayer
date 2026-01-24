"""
Regulayer Billing - Configuration
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Billing configuration."""
    
    # Service
    host: str = "0.0.0.0"
    port: int = 8500
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id_pro: str = ""
    stripe_price_id_enterprise: str = ""
    
    # Control Plane
    control_plane_url: str = "http://localhost:8100"
    
    # Defaults
    default_plan: str = "free"
    
    class Config:
        env_prefix = "BILLING_"


settings = Settings()
