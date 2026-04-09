from fastapi import APIRouter, Depends, HTTPException, Request, status, Response, Body
from typing import List, Optional, Any
from uuid import UUID
import httpx

from .middleware import require_tenant_context, TenantContext
from .config import settings
from .enums import UserRole

# Define Router
router = APIRouter(prefix="/v1/policies", tags=["policy-proxy"])

# Helper for forwarding
async def forward_request(
    method: str,
    path: str,
    tenant: TenantContext,
    json_body: Optional[dict] = None,
    params: Optional[dict] = None
):
    """
    Forward request to Policy Engine with internal auth headers.
    """
    # 1. Resolve Policy URL
    base_url = getattr(settings, 'policy_url', "http://policy-engine:8000")
    url = f"{base_url.rstrip('/')}/v1/policies{path}"
    
    # 2. Prepare Headers
    headers = {
        "X-Internal-Auth": getattr(settings, 'internal_secret', "dev_internal_secret"),
        "Content-Type": "application/json"
    }
    
    # 3. Execute Request
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.request(
                method=method,
                url=url,
                headers=headers,
                json=json_body,
                params=params,
                timeout=10.0
            )
            
            if resp.status_code >= 400:
                try:
                    detail = resp.json().get("detail", resp.text)
                except:
                    detail = resp.text
                raise HTTPException(status_code=resp.status_code, detail=detail)
            
            return resp.json()
            
        except httpx.RequestError as e:
            print(f"Policy Proxy Error: {str(e)}")
            raise HTTPException(status_code=503, detail="Policy engine unavailable")

# ============================================================
# Endpoints
# ============================================================

@router.get("", summary="List policies")
async def list_policies(tenant: TenantContext = Depends(require_tenant_context)):
    return await forward_request("GET", "", tenant)

@router.post("", summary="Create a policy")
async def create_policy(
    payload: dict = Body(...),
    tenant: TenantContext = Depends(require_tenant_context)
):
    if tenant.role not in [UserRole.ADMIN, UserRole.OWNER]:
        raise HTTPException(status_code=403, detail="Only Admins or Owners can create policies.")
    return await forward_request("POST", "", tenant, json_body=payload)

@router.get("/{policy_id}", summary="Get policy by ID")
async def get_policy(
    policy_id: UUID,
    tenant: TenantContext = Depends(require_tenant_context)
):
    return await forward_request("GET", f"/{policy_id}", tenant)

@router.patch("/{policy_id}/enable", summary="Enable or disable a policy")
async def toggle_policy(
    policy_id: UUID,
    enabled: bool,
    tenant: TenantContext = Depends(require_tenant_context)
):
    if tenant.role not in [UserRole.ADMIN, UserRole.OWNER]:
        raise HTTPException(status_code=403, detail="Only Admins or Owners can configure policies.")
    return await forward_request("PATCH", f"/{policy_id}/enable", tenant, params={"enabled": enabled})
