"""
Regulayer SDK - Errors
"""


class RegulayerError(Exception):
    """Base error for Regulayer SDK."""
    pass


class AuthenticationError(RegulayerError):
    """Invalid or missing API key."""
    pass


class RateLimitError(RegulayerError):
    """Rate limit exceeded."""
    pass


class QuotaExceededError(RegulayerError):
    """Usage quota exceeded."""
    pass


class NetworkError(RegulayerError):
    """Network communication error."""
    pass
