"""
Regulayer SDK Configuration

Configure the SDK before use.
"""

from typing import Optional
from dataclasses import dataclass
from .constants import (
    DEFAULT_API_ENDPOINT,
    DEFAULT_TIMEOUT_SECONDS,
    DEFAULT_MAX_RETRIES,
    DEFAULT_ENVIRONMENT
)
from .errors import InvalidConfigurationError, DemoKeyError, ProdKeyError


@dataclass
class RegulayerConfig:
    """SDK configuration."""
    api_key: str
    endpoint: str = DEFAULT_API_ENDPOINT
    project_id: Optional[str] = None
    environment: str = DEFAULT_ENVIRONMENT
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS
    max_retries: int = DEFAULT_MAX_RETRIES
    demo: bool = False


# Global config
_config: Optional[RegulayerConfig] = None


def configure(
    api_key: str,
    endpoint: str = DEFAULT_API_ENDPOINT,
    project_id: Optional[str] = None,
    environment: str = DEFAULT_ENVIRONMENT,
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
    max_retries: int = DEFAULT_MAX_RETRIES,
    demo: bool = False
) -> None:
    """
    Configure the Regulayer SDK.
    
    Call this before using trace().
    
    Args:
        api_key: Your API key.
        endpoint: API endpoint.
        project_id: Optional project identifier.
        environment: 'dev' | 'staging' | 'prod'.
        timeout_seconds: Request timeout.
        max_retries: Number of retries on network failure.
        demo: Set to True if using a demo API key.
    
    Raises:
        InvalidConfigurationError: If configuration is invalid.
        DemoKeyError: If demo key used without demo=True.
        ProdKeyError: If prod key used with demo=True.
    """
    global _config
    
    if not api_key:
        raise InvalidConfigurationError("api_key is required")

    # Demo Credential Wall
    is_demo_key = api_key.startswith("rl_demo_")
    
    if is_demo_key and not demo:
        raise DemoKeyError()
    
    if not is_demo_key and demo:
        raise ProdKeyError()

    # Allow reconfiguration by simply updating the global config.
    # This keeps tests and long-running processes flexible (for key
    # rotation, endpoint changes, etc.).
    _config = RegulayerConfig(
        api_key=api_key,
        endpoint=endpoint,
        project_id=project_id,
        environment=environment,
        timeout_seconds=timeout_seconds,
        max_retries=max_retries,
        demo=demo
    )


def get_config() -> RegulayerConfig:
    """Get current configuration."""
    global _config
    if _config is None:
        raise InvalidConfigurationError(
            "Regulayer SDK not configured. "
            "Call regulayer.configure(...) first."
        )
    return _config


def reset_config() -> None:
    """Reset configuration (for testing)."""
    global _config
    _config = None
