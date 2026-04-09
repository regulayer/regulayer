from fastapi import APIRouter, Depends, HTTPException, Request, status, Response, Body
from typing import List, Optional, Any
from uuid import UUID
import httpx

from .middleware import require_tenant_context, TenantContext
from .config import settings
from .enums import UserRole

# Define Router
router = APIRouter(prefix="/v1/governance", tags=["governance-proxy"])

# Role Mapping
def map_role_to_governance(user_role: UserRole) -> str:
    """Map Control Plane UserRole to GovernanceRole."""
    # Governance Roles: system, analyst, compliance, auditor, admin
    
    # OWNER/ADMIN -> COMPLIANCE (Can approve)
    # Ideally only specific officers should be compliance, but for MVP/SMB:
    if user_role in [UserRole.OWNER, UserRole.ADMIN]:
        return "compliance"
    
    # EDITOR -> ANALYST (Can annotate)
    if user_role == UserRole.EDITOR:
        return "analyst"
        
    # VIEWER -> AUDITOR (Read only)
    return "auditor"


# Helper for forwarding
async def forward_request(
    method: str,
    path: str,
    tenant: TenantContext,
    json_body: Optional[dict] = None,
    params: Optional[dict] = None
):
    """
    Forward request to Governance Service with internal auth headers.
    """
    # 1. Resolve Governance URL
    base_url = settings.governance_url if hasattr(settings, 'governance_url') else "http://governance:8002"
    url = f"{base_url.rstrip('/')}/v1/governance{path}"
    
    # 2. Map Role
    gov_role = map_role_to_governance(tenant.role) if tenant.role else "auditor"

    # 3. Prepare Headers (filter out None values to avoid httpx TypeError)
    headers = {
        "X-Internal-Auth": settings.internal_secret,
        "X-Actor-Role": gov_role,
        "Content-Type": "application/json"
    }
    # Add optional headers only if they have values
    if tenant.org_status:
        headers["X-Org-Status"] = tenant.org_status
    if tenant.organization_id:
        headers["X-Org-Id"] = str(tenant.organization_id)
    
    # 4. Execute Request
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
            
            # 4. Return Response
            # We return dict/list directly for FastAPI to serialize, or Response object?
            # Better to return data and let FastAPI serialize, but if status code matches...
            
            if resp.status_code >= 400:
                # Propagate error
                try:
                    detail = resp.json().get("detail", resp.text)
                except:
                    detail = resp.text
                raise HTTPException(status_code=resp.status_code, detail=detail)
            
            return resp.json()
            
        except httpx.RequestError as e:
            print(f"Governance Proxy Error: {str(e)}")
            raise HTTPException(status_code=503, detail="Governance service unavailable")


# ============================================================
# Endpoints
# ============================================================

@router.get("/queue", summary="Get review queue")
async def get_queue(
    status: Optional[str] = "unreviewed",
    limit: int = 50,
    offset: int = 0,
    tenant: TenantContext = Depends(require_tenant_context)
):
    """List decisions pending review."""
    # RBAC: Only Owners, Admins, or specific roles?
    # For now, allow all authenticated users to SEE queue, but maybe actions strict.
    return await forward_request(
        "GET", 
        "/queue", 
        tenant, 
        params={"status": status, "limit": limit, "offset": offset}
    )


@router.get("/{decision_id}", summary="Get decision details")
async def get_decision(
    decision_id: UUID,
    tenant: TenantContext = Depends(require_tenant_context)
):
    return await forward_request("GET", f"/{decision_id}", tenant)


@router.post("/{decision_id}/annotations", summary="Add annotation")
async def add_annotation(
    decision_id: UUID,
    payload: dict = Body(...),
    tenant: TenantContext = Depends(require_tenant_context)
):
    # Payload should match GovernanceAnnotationCreate
    # Inject author role from tenant if missing? 
    # The PROXY sets X-Actor-Role header, so explicit body role might be overridden or checked by Governance.
    # We pass body as is.
    
    # Override/Enforce author_role in body to match tenant?
    payload["author_role"] = tenant.role.value
    
    return await forward_request("POST", f"/{decision_id}/annotations", tenant, json_body=payload)


@router.post("/{decision_id}/tags", summary="Add tag")
async def add_tag(
    decision_id: UUID,
    payload: dict = Body(...),
    tenant: TenantContext = Depends(require_tenant_context)
):
    return await forward_request("POST", f"/{decision_id}/tags", tenant, json_body=payload)


@router.post("/{decision_id}/reviews", summary="Submit review")
async def submit_review(
    decision_id: UUID,
    payload: dict = Body(...),
    tenant: TenantContext = Depends(require_tenant_context)
):
    # RBAC Enforced in Governance Service via X-Actor-Role
    # But we can also fail fast here
    if tenant.role not in [UserRole.ADMIN, UserRole.OWNER]: # Mapping Owner->Admin for governance?
        # If Governance expects 'admin' or 'compliance', we verified UserRole enum matches?
        # UserRole: owner, admin, member...
        # GovernanceRole: admin, compliance, analyst...
        # We might need mapping.
        pass
        
    return await forward_request("POST", f"/{decision_id}/reviews", tenant, json_body=payload)


@router.get("/{decision_id}/evidence", summary="Get evidence bundle")
async def get_evidence(
    decision_id: UUID,
    tenant: TenantContext = Depends(require_tenant_context)
):
    return await forward_request("GET", f"/{decision_id}/evidence", tenant)


@router.get("/{decision_id}/timeline", summary="Get timeline")
async def get_timeline(
    decision_id: UUID,
    tenant: TenantContext = Depends(require_tenant_context)
):
    return await forward_request("GET", f"/{decision_id}/timeline", tenant)
