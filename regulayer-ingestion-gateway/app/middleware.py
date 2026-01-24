"""
Regulayer Ingestion Gateway - Middleware

Request context and tenant injection.
"""

from typing import Optional
from uuid import UUID
from contextvars import ContextVar

from fastapi import Request

from .auth import TenantContext


# Context variable for current request's tenant context
_tenant_context: ContextVar[Optional[TenantContext]] = ContextVar(
    "tenant_context",
    default=None
)


def set_tenant_context(context: TenantContext) -> None:
    """Set tenant context for current request."""
    _tenant_context.set(context)


def get_tenant_context() -> Optional[TenantContext]:
    """Get tenant context for current request."""
    return _tenant_context.get()


def clear_tenant_context() -> None:
    """Clear tenant context after request."""
    _tenant_context.set(None)


def extract_api_key(request: Request) -> Optional[str]:
    """Extract API key from request headers."""
    return request.headers.get("X-Regulayer-Api-Key")


def extract_project_id(request: Request) -> Optional[str]:
    """Extract project ID from request headers."""
    return request.headers.get("X-Regulayer-Project-Id")


def get_client_ip(request: Request) -> str:
    """Get client IP address."""
    # Check for forwarded header
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    # Fall back to direct connection
    return request.client.host if request.client else "unknown"


def get_request_headers(request: Request) -> dict:
    """Get relevant headers as dict."""
    return {
        k.lower(): v
        for k, v in request.headers.items()
    }
