"""
Regulayer Python SDK

Record provable AI decisions with cryptographic guarantees.

IMPORTANT:
- This SDK does NOT perform hashing or signing
- All cryptographic operations happen server-side
- The SDK is a transport layer, not a trust layer
"""

__version__ = "1.0.0"

from .client import RegulayerClient, configure, get_client
from .trace import trace, Decision
from .errors import RegulayerError, AuthenticationError, RateLimitError

__all__ = [
    "RegulayerClient",
    "configure", 
    "get_client",
    "trace",
    "Decision",
    "RegulayerError",
    "AuthenticationError",
    "RateLimitError",
]
