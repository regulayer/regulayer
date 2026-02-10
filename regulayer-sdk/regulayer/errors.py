"""
Regulayer SDK Errors
"""
from typing import Optional, Dict, Any

class RegulayerError(Exception):
    """Base error for Regulayer SDK."""
    def __init__(self, message: str, code: str = None, details: Dict[str, Any] = None, decision_id: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}
        self.decision_id = decision_id

class InvalidApiKeyError(RegulayerError):
    def __init__(self, message: str = "Invalid or revoked API key", decision_id: Optional[str] = None):
        super().__init__(message, code="INVALID_API_KEY", decision_id=decision_id)

class UnauthorizedError(RegulayerError):
    def __init__(self, message: str = "Unauthorized request", decision_id: Optional[str] = None):
        super().__init__(message, code="UNAUTHORIZED", decision_id=decision_id)

class QuotaExceededError(RegulayerError):
    def __init__(self, resets_at: str = None, decision_id: Optional[str] = None):
        super().__init__(
            "Quota exceeded. Upgrade plan or wait for reset.",
            code="QUOTA_EXCEEDED",
            details={"resets_at": resets_at},
            decision_id=decision_id
        )

class IngestionPausedError(RegulayerError):
    def __init__(self, decision_id: Optional[str] = None):
        super().__init__(
            "Ingestion paused due to billing status. Proof export remains available.",
            code="INGESTION_PAUSED",
            decision_id=decision_id
        )

class RateLimitError(RegulayerError):
    def __init__(self, retry_after: int = None, decision_id: Optional[str] = None):
        super().__init__(
            "Rate limit exceeded. Please slow down.",
            code="RATE_LIMITED",
            details={"retry_after": retry_after},
            decision_id=decision_id
        )

class NetworkError(RegulayerError):
    def __init__(self, message: str = "Network error", decision_id: Optional[str] = None):
        super().__init__(message, code="NETWORK_ERROR", decision_id=decision_id)

class ServiceUnavailableError(RegulayerError):
    def __init__(self, decision_id: Optional[str] = None):
        super().__init__(
            "Service temporarily unavailable. Please retry.",
            code="SERVICE_UNAVAILABLE",
            decision_id=decision_id
        )

class ValidationError(RegulayerError):
    def __init__(self, field: str, reason: str, decision_id: Optional[str] = None):
        super().__init__(
            f"Validation error: {field} - {reason}",
            code="VALIDATION_ERROR",
            details={"field": field, "reason": reason},
            decision_id=decision_id
        )

class PayloadTooLargeError(RegulayerError):
    def __init__(self, max_size: int, decision_id: Optional[str] = None):
        super().__init__(
            f"Payload exceeds maximum size ({max_size} bytes)",
            code="PAYLOAD_TOO_LARGE",
            details={"max_size": max_size},
            decision_id=decision_id
        )

class DemoKeyError(RegulayerError):
    """
    Raised when a demo API key is used without demo=True.
    """
    def __init__(self):
        super().__init__(
            "Demo API key detected. Demo keys must be used with configure(demo=True).",
            code="DEMO_KEY_WITHOUT_DEMO_MODE"
        )

class ProdKeyError(RegulayerError):
    """
    Raised when a production API key is used with demo=True.
    """
    def __init__(self):
        super().__init__(
            "Production API key used with demo=True. Remove demo=True from configure().",
            code="PROD_KEY_IN_DEMO_MODE"
        )

class DuplicateDecisionError(RegulayerError):
    """Raised when a decision ID has already been recorded (409)."""
    def __init__(self, decision_id: str):
        super().__init__(
            f"Decision ID {decision_id} already exists.",
            code="DUPLICATE_DECISION",
            decision_id=decision_id
        )

class OrgFrozenError(RegulayerError):
    """Raised when the organization is frozen (403)."""
    def __init__(self, message: str = "Organization is frozen.", decision_id: Optional[str] = None):
        super().__init__(
            message,
            code="ORG_FROZEN",
            decision_id=decision_id
        )

class InvalidResponseError(RegulayerError):
    """Raised when the server response is invalid or missing expected fields."""
    def __init__(self, message: str = "Invalid response from server", decision_id: Optional[str] = None):
        super().__init__(
            message,
            code="INVALID_RESPONSE",
            decision_id=decision_id
        )

# Alias for backwards compatibility
AuthenticationError = InvalidApiKeyError

