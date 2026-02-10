"""
Regulayer SDK Configuration

Configure the SDK before use.
"""

from typing import Optional
from dataclasses import dataclass


@dataclass
class RegulayerConfig:
    """SDK configuration."""
    api_key: Optional[str] = None
    endpoint: str = "https://api.regulayer.io"
    timeout_seconds: float = 30.0
    max_retries: int = 3
    
    # Trust: SDK never does these
    hash_payloads: bool = False  # Server hashes
    sign_payloads: bool = False  # Server signs
    persist_locally: bool = False  # No local state


# Global config
_config: Optional[RegulayerConfig] = None


def configure(
    api_key: str,
    endpoint: str = "https://api.regulayer.io",
    timeout_seconds: float = 30.0,
    max_retries: int = 3
) -> None:
    """
    Configure the Regulayer SDK.
    
    Call this before using trace().
    
    Args:
        api_key: Your API key (starts with rl_live_ or rl_test_)
        endpoint: API endpoint (default: production)
        timeout_seconds: Request timeout
        max_retries: Number of retries on network failure
    
    Example:
        >>> from regulayer import configure
        >>> configure(api_key="rl_live_xxx")
    """
    global _config
    _config = RegulayerConfig(
        api_key=api_key,
        endpoint=endpoint,
        timeout_seconds=timeout_seconds,
        max_retries=max_retries
    )


def get_config() -> RegulayerConfig:
    """Get current configuration."""
    global _config
    if _config is None:
        raise RuntimeError(
            "Regulayer SDK not configured. "
            "Call regulayer.configure(api_key='...') first."
        )
    return _config


def reset_config() -> None:
    """Reset configuration (for testing)."""
    global _config
    _config = None
