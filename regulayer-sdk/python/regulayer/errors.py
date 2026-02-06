"""
Regulayer SDK Errors
"""

class RegulayerError(Exception):
    """Base error for Regulayer SDK."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}

class InvalidApiKeyError(RegulayerError):
    def __init__(self, message: str = "Invalid or revoked API key"):
        super().__init__(message, code="INVALID_API_KEY")

class UnauthorizedError(RegulayerError):
    def __init__(self, message: str = "Unauthorized request"):
        super().__init__(message, code="UNAUTHORIZED")

class QuotaExceededError(RegulayerError):
    def __init__(self, resets_at: str = None):
        super().__init__(
            "Quota exceeded. Upgrade plan or wait for reset.",
            code="QUOTA_EXCEEDED",
            details={"resets_at": resets_at}
        )

class IngestionPausedError(RegulayerError):
    def __init__(self):
        super().__init__(
            "Ingestion paused due to billing status. Proof export remains available.",
            code="INGESTION_PAUSED"
        )

class RateLimitError(RegulayerError):
    def __init__(self, retry_after: int = None):
        super().__init__(
            "Rate limit exceeded. Please slow down.",
            code="RATE_LIMITED",
            details={"retry_after": retry_after}
        )

class NetworkError(RegulayerError):
    def __init__(self, message: str = "Network error"):
        super().__init__(message, code="NETWORK_ERROR")

class ServiceUnavailableError(RegulayerError):
    def __init__(self):
        super().__init__(
            "Service temporarily unavailable. Please retry.",
            code="SERVICE_UNAVAILABLE"
        )

class ValidationError(RegulayerError):
    def __init__(self, field: str, reason: str):
        super().__init__(
            f"Validation error: {field} - {reason}",
            code="VALIDATION_ERROR",
            details={"field": field, "reason": reason}
        )

class PayloadTooLargeError(RegulayerError):
    def __init__(self, max_size: int = 1048576):
        super().__init__(
            f"Payload exceeds maximum size ({max_size} bytes)",
            code="PAYLOAD_TOO_LARGE",
            details={"max_size": max_size}
        )
