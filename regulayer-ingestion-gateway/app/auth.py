"""
Regulayer Ingestion Gateway - Authentication

API key validation via Control Plane.

NO crypto verification here. Only access control.
"""

from typing import Optional
from dataclasses import dataclass
from uuid import UUID

import httpx

from .config import settings
from .errors import AuthError, UnauthorizedError, ForbiddenError


@dataclass
class TenantContext:
    """Validated tenant context from API key."""
    org_id: UUID
    project_id: UUID
    key_id: UUID
    scopes: list[str]
    
    def has_scope(self, scope: str) -> bool:
        return scope in self.scopes


async def validate_api_key(api_key: str, project_id: str) -> TenantContext:
    """
    Validate API key via Control Plane.
    
    Checks:
    1. Key is active
    2. Scope includes 'ingest'
    3. Project belongs to org
    
    Returns TenantContext on success.
    Raises AuthError on failure.
    """
    if not api_key:
        raise UnauthorizedError("Missing API key")
    
    if not api_key.startswith("rl_"):
        raise UnauthorizedError("Invalid API key format")
    
    try:
        async with httpx.AsyncClient(timeout=settings.auth_timeout_seconds) as client:
            response = await client.post(
                f"{settings.control_plane_url}/v1/auth/validate",
                params={"api_key": api_key}
            )
            
            if response.status_code != 200:
                raise UnauthorizedError("Invalid API key")
            
            data = response.json()
            
    except httpx.TimeoutException:
        raise AuthError("Authentication service timeout")
    except httpx.RequestError as e:
        raise AuthError(f"Authentication service error: {e}")
    
    # Check validation result
    if not data.get("valid"):
        error = data.get("error", "Key validation failed")
        
        if "revoked" in error.lower():
            raise UnauthorizedError("API key has been revoked")
        else:
            raise UnauthorizedError(error)
    
    # Check scope includes ingest
    scopes = data.get("scopes", [])
    if "ingest" not in scopes:
        raise ForbiddenError("API key does not have 'ingest' scope")
    
    # Verify project matches
    validated_project_id = data.get("project_id")
    if project_id and str(validated_project_id) != project_id:
        raise ForbiddenError("Project ID does not match API key")
    
    return TenantContext(
        org_id=UUID(str(data["organization_id"])),
        project_id=UUID(str(data["project_id"])),
        key_id=UUID(str(data.get("key_id", "00000000-0000-0000-0000-000000000000"))),
        scopes=scopes
    )


async def validate_request_headers(
    api_key: Optional[str],
    project_id: Optional[str]
) -> TenantContext:
    """
    Validate request headers and return tenant context.
    """
    if not api_key:
        raise UnauthorizedError("X-Regulayer-Api-Key header required")
    
    return await validate_api_key(api_key, project_id)
