"""
Regulayer SDK - Enterprise-grade AI Trust Infrastructure

Decision Tracing SDK for capturing deterministic, non-PII metadata
about AI decisions with cryptographic integrity.

Public API:
    - trace: Context manager for decision tracing
    - configure: SDK configuration
    - __version__: SDK version

Example:
    >>> from regulayer import trace, configure
    >>> 
    >>> configure(api_key="your-api-key")
    >>> 
    >>> with trace(
    ...     system="loan_approval",
    ...     risk="high",
    ...     model_name="credit_model",
    ...     model_version="v1.2.3"
    ... ) as t:
    ...     input_data = {"user_id": "12345", "amount": 50000}
    ...     t.set_input(input_data)
    ...     
    ...     decision = model.predict(input_data)
    ...     
    ...     t.set_output(decision)

Trust Boundary:
    The SDK is NOT a source of truth.
    The backend is the source of truth.
    SDK events are CLAIMS, not facts.
    
    This distinction is critical for legal, forensic, and regulatory
    interpretation. The SDK provides deterministic, tamper-evident
    event transmission—attestation and verification occur server-side.
"""

from .trace import trace
from .config import configure
from .runtime import __version__

__all__ = [
    "trace",
    "configure",
    "__version__",
]

# Package metadata
__author__ = "Regulayer Team"
__description__ = "Enterprise-grade AI trust infrastructure - Decision Tracing SDK"
