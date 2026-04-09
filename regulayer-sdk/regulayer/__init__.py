"""
Regulayer Python SDK

Record provable AI decisions with tamper-detectable audit trails.

Usage:
    import regulayer

    # Configure with your API key
    regulayer.configure(api_key="rl_live_xxx")

    # Record a decision
    client = regulayer.get_client()
    result = client.record_decision(
        system="loan-approval",
        decision_type="credit_decision",
        input_data={"applicant_id": "12345"},
        output_data={"approved": True, "score": 0.87}
    )
"""

__version__ = "2.0.1"

from .config import configure, RegulayerConfig
from .client import get_client, RegulayerClient
from .errors import (
    RegulayerError,
    InvalidApiKeyError,
    AuthenticationError,
    RateLimitError,
    DemoKeyError,
    ProdKeyError,
    QuotaExceededError,
    IngestionPausedError,
    NetworkError,
    ServiceUnavailableError,
    ValidationError,
    PayloadTooLargeError,
)
from .trace import trace, Decision

__all__ = [
    # Version
    "__version__",
    # Configuration
    "configure",
    "get_client",
    # Client
    "RegulayerClient",
    "RegulayerConfig",
    # Trace
    "trace",
    "Decision",
    # Errors
    "RegulayerError",
    "InvalidApiKeyError",
    "AuthenticationError",
    "RateLimitError",
    "DemoKeyError",
    "ProdKeyError",
    "QuotaExceededError",
    "IngestionPausedError",
    "NetworkError",
    "ServiceUnavailableError",
    "ValidationError",
    "PayloadTooLargeError",
]
