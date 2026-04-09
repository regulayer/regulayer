"""
Regulayer Control Plane - Middleware

Tenant context injection and validation middleware.
"""

from typing import Optional, Callable
from uuid import UUID

from fastapi import Request, HTTPException, Depends, Header
from fastapi.security import APIKeyHeader

from .models import TenantContext
from .enums import ApiKeyScope
from .storage import SessionLocal, get_db
from .auth import AuthService
from .user_auth import UserAuthService
from .config import settings


# API key header
api_key_header = APIKeyHeader(name="X-Regulayer-API-Key", auto_error=False)


def get_tenant_context(
    request: Request,
    api_key: Optional[str] = Depends(api_key_header),
    authorization: Optional[str] = Header(None),
    db = Depends(get_db)
) -> Optional[TenantContext]:
    """
    Extract tenant context from request.
    
    Validates API key OR User Session and returns tenant context.
    Returns None if no credentials provided.
    """
    # Case A: API Key
    if api_key:
        auth_service = AuthService(db)
        validation = auth_service.validate_api_key(api_key)
        
        if not validation.valid:
            raise HTTPException(
                status_code=401,
                detail=validation.error or "Invalid API key"
            )
        
        return auth_service.build_tenant_context(validation)

    # Case B: User Session (Bearer Token)
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user_auth = UserAuthService(db)
        user = user_auth.get_user_from_token(token)
        
        if user:
            return TenantContext(
                organization_id=user.organization_id,
                project_id=None, # Users are org-scoped, not project-bound in context
                user_id=user.id,
                role=user.role,
                # We could fetch org status here if needed, but for now we trust session validity
            )
            
    return None


def require_tenant_context(
    tenant: Optional[TenantContext] = Depends(get_tenant_context)
) -> TenantContext:
    """
    Require a valid tenant context.
    
    Use this dependency for endpoints that require authentication.
    """
    if not tenant:
        raise HTTPException(
            status_code=401,
            detail="API key required"
        )
    return tenant


def require_scope(scope: ApiKeyScope) -> Callable:
    """
    Create a dependency that requires a specific scope.
    
    Usage:
        @app.post("/decisions", dependencies=[Depends(require_scope(ApiKeyScope.INGEST))])
    """
    def scope_checker(
        tenant: TenantContext = Depends(require_tenant_context)
    ) -> TenantContext:
        if not tenant.has_scope(scope):
            raise HTTPException(
                status_code=403,
                detail=f"Scope '{scope.value}' required"
            )
        return tenant
    
    return scope_checker



def require_internal_secret(x_internal_secret: str = Header(None)):
    if x_internal_secret != settings.internal_secret:
        raise HTTPException(status_code=403, detail="Internal secret required")


class TenantMiddleware:
    """
    Middleware to inject tenant context into request state.
    
    This allows accessing tenant context anywhere in the request lifecycle.
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Tenant context will be set by dependency injection
            # This middleware just ensures the pattern is available
            pass
        
        await self.app(scope, receive, send)


# ============================================================
# Header-based tenant identification (for internal services)
# ============================================================

def get_project_from_header(
    request: Request
) -> Optional[UUID]:
    """
    Get project ID from header.
    
    Used by internal services that receive pre-validated requests.
    """
    project_id = request.headers.get("X-Regulayer-Project-ID")
    if project_id:
        try:
            return UUID(project_id)
        except ValueError:
            return None
    return None


def get_org_from_header(
    request: Request
) -> Optional[UUID]:
    """
    Get organization ID from header.
    
    Used by internal services that receive pre-validated requests.
    """
    org_id = request.headers.get("X-Regulayer-Org-ID")
    if org_id:
        try:
            return UUID(org_id)
        except ValueError:
            return None
    return None
