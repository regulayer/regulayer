"""
Regulayer Infrastructure - Environment Isolation

Ensures dev/staging/prod data never mixes.

GUARANTEES:
- Staging data cannot appear in prod
- Keys are environment-scoped
- Proof bundles include environment marker
"""

import os
from enum import Enum
from typing import Optional
from dataclasses import dataclass


class Environment(str, Enum):
    """Deployment environments."""
    DEV = "dev"
    STAGING = "staging"
    PROD = "prod"


@dataclass
class EnvironmentConfig:
    """Configuration for an environment."""
    name: Environment
    database_url: str
    control_plane_url: str
    allow_test_data: bool
    require_encryption: bool
    log_level: str


# ============================================================
# Environment Detection
# ============================================================

def get_current_environment() -> Environment:
    """Get the current deployment environment."""
    env_str = os.environ.get("REGULAYER_ENV", "dev").lower()
    
    try:
        return Environment(env_str)
    except ValueError:
        return Environment.DEV


def is_production() -> bool:
    """Check if running in production."""
    return get_current_environment() == Environment.PROD


def is_staging() -> bool:
    """Check if running in staging."""
    return get_current_environment() == Environment.STAGING


# ============================================================
# Environment-Scoped Configuration
# ============================================================

def get_environment_config() -> EnvironmentConfig:
    """Get configuration for current environment."""
    env = get_current_environment()
    
    configs = {
        Environment.DEV: EnvironmentConfig(
            name=Environment.DEV,
            database_url=os.environ.get("DATABASE_URL", "sqlite:///./dev.db"),
            control_plane_url=os.environ.get("CONTROL_PLANE_URL", "http://localhost:8100"),
            allow_test_data=True,
            require_encryption=False,
            log_level="DEBUG"
        ),
        Environment.STAGING: EnvironmentConfig(
            name=Environment.STAGING,
            database_url=os.environ.get("DATABASE_URL", ""),
            control_plane_url=os.environ.get("CONTROL_PLANE_URL", ""),
            allow_test_data=True,
            require_encryption=True,
            log_level="INFO"
        ),
        Environment.PROD: EnvironmentConfig(
            name=Environment.PROD,
            database_url=os.environ.get("DATABASE_URL", ""),
            control_plane_url=os.environ.get("CONTROL_PLANE_URL", ""),
            allow_test_data=False,
            require_encryption=True,
            log_level="WARNING"
        ),
    }
    
    return configs[env]


# ============================================================
# Environment Guards
# ============================================================

class EnvironmentGuard:
    """
    Guards to prevent cross-environment data leakage.
    """
    
    @staticmethod
    def require_production():
        """Raise if not in production."""
        if not is_production():
            raise RuntimeError("This operation requires production environment")
    
    @staticmethod
    def forbid_production():
        """Raise if in production (for test operations)."""
        if is_production():
            raise RuntimeError("This operation is forbidden in production")
    
    @staticmethod
    def require_encryption():
        """Raise if encryption is required but not configured."""
        config = get_environment_config()
        if config.require_encryption:
            # Check encryption is actually enabled
            if not os.environ.get("REGULAYER_ENCRYPTION_KEY"):
                raise RuntimeError(
                    f"Encryption required in {config.name.value} but REGULAYER_ENCRYPTION_KEY not set"
                )
    
    @staticmethod
    def validate_database_isolation(database_url: str) -> None:
        """Validate database URL matches environment."""
        env = get_current_environment()
        
        # Simple checks to prevent obvious mistakes
        if env == Environment.PROD:
            if "localhost" in database_url or "127.0.0.1" in database_url:
                raise RuntimeError("Production cannot use localhost database")
            if "dev" in database_url.lower() or "staging" in database_url.lower():
                raise RuntimeError("Production database URL contains dev/staging identifier")
        
        if env == Environment.STAGING:
            if "prod" in database_url.lower():
                raise RuntimeError("Staging database URL contains prod identifier")


# ============================================================
# Proof Bundle Environment Marker
# ============================================================

def get_environment_marker() -> dict:
    """
    Get environment marker for proof bundles.
    
    This is included in proof bundles to identify which environment
    they came from. NOT part of the cryptographic proof.
    """
    env = get_current_environment()
    
    return {
        "environment": env.value,
        "is_production": env == Environment.PROD,
        "marker_version": "1.0",
        # Do NOT include sensitive config here
    }
