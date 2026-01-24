"""
Regulayer Ingestion Gateway - Error Handling

Consistent error responses.
"""

from fastapi import HTTPException


class GatewayError(Exception):
    """Base gateway error."""
    status_code: int = 500
    error_code: str = "GATEWAY_ERROR"
    
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)
    
    def to_response(self) -> dict:
        return {
            "error": self.error_code,
            "message": self.message
        }


class AuthError(GatewayError):
    """Authentication service error."""
    status_code = 503
    error_code = "AUTH_SERVICE_ERROR"


class UnauthorizedError(GatewayError):
    """Invalid or missing credentials."""
    status_code = 401
    error_code = "UNAUTHORIZED"


class ForbiddenError(GatewayError):
    """Valid credentials but insufficient permissions."""
    status_code = 403
    error_code = "FORBIDDEN"


class RateLimitError(GatewayError):
    """Rate limit exceeded."""
    status_code = 429
    error_code = "RATE_LIMIT_EXCEEDED"


class QuotaExceededError(GatewayError):
    """Usage quota exceeded."""
    status_code = 429
    error_code = "QUOTA_EXCEEDED"


class ForwardingError(GatewayError):
    """Error forwarding to recorder."""
    status_code = 502
    error_code = "FORWARDING_ERROR"


class RecorderError(GatewayError):
    """Recorder returned an error."""
    status_code = 502
    error_code = "RECORDER_ERROR"


def gateway_error_to_http(error: GatewayError) -> HTTPException:
    """Convert gateway error to HTTP exception."""
    return HTTPException(
        status_code=error.status_code,
        detail=error.to_response()
    )
