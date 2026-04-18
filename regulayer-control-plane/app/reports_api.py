"""
Regulayer Control Plane - Reports Proxy

Proxies report requests to the dedicated Reports microservice
via the gateway, ensuring real data is returned instead of stubs.

This router exists on the control plane so that frontends configured
to talk directly to the control plane (port 8100) can still access
reports without reconfiguration.
"""

from fastapi import APIRouter, Request, Response, Depends, HTTPException, Header
from typing import Optional
import httpx
import os

from .models import TenantContext, UserRole
from .middleware import require_tenant_context

router = APIRouter(prefix="/v1/reports", tags=["reports"])

REPORTS_SERVICE_URL = os.getenv("REPORTS_URL", "http://reports:8003")
REPORTS_INTERNAL_SECRET = os.getenv("REPORTS_INTERNAL_SECRET", "")


async def _proxy_to_reports(
    request: Request,
    path: str,
    tenant: TenantContext,
    method: str = "GET",
    body: bytes = None
) -> Response:
    """Forward the request to the real Reports microservice."""
    
    # Build headers for internal auth
    headers = {
        "X-Internal-Auth": REPORTS_INTERNAL_SECRET,
        "X-Org-Id": str(tenant.organization_id),
        "X-Actor-Role": tenant.role.value if tenant.role else "member",
    }
    if tenant.email:
        headers["X-Actor-Email"] = tenant.email
    
    # Forward query parameters
    query_string = str(request.query_params)
    url = f"{REPORTS_SERVICE_URL}{path}"
    if query_string:
        url += f"?{query_string}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            if method == "POST":
                headers["Content-Type"] = request.headers.get("content-type", "application/json")
                resp = await client.post(url, headers=headers, content=body)
            else:
                resp = await client.get(url, headers=headers)
            
            # Forward the response exactly as-is (preserving PDF bytes, JSON, etc.)
            response_headers = {}
            if "content-disposition" in resp.headers:
                response_headers["Content-Disposition"] = resp.headers["content-disposition"]
            
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                media_type=resp.headers.get("content-type", "application/json"),
                headers=response_headers
            )
    except httpx.ConnectError:
        raise HTTPException(status_code=502, detail="Reports service unavailable")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Reports service timeout")


@router.get("/chain/{chain_id}")
async def proxy_chain_report(
    chain_id: str,
    request: Request,
    tenant: TenantContext = Depends(require_tenant_context)
):
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN, UserRole.AUDITOR]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return await _proxy_to_reports(request, f"/v1/reports/chain/{chain_id}", tenant)


@router.get("/governance")
async def proxy_governance_report(
    request: Request,
    tenant: TenantContext = Depends(require_tenant_context)
):
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN, UserRole.AUDITOR]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return await _proxy_to_reports(request, "/v1/reports/governance", tenant)


@router.get("/incidents")
async def proxy_incidents_report(
    request: Request,
    tenant: TenantContext = Depends(require_tenant_context)
):
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN, UserRole.AUDITOR]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return await _proxy_to_reports(request, "/v1/reports/incidents", tenant)


@router.get("/usage")
async def proxy_usage_report(
    request: Request,
    tenant: TenantContext = Depends(require_tenant_context)
):
    return await _proxy_to_reports(request, "/v1/reports/usage", tenant)


@router.get("/sla")
async def proxy_sla_report(
    request: Request,
    tenant: TenantContext = Depends(require_tenant_context)
):
    return await _proxy_to_reports(request, "/v1/reports/sla", tenant)


@router.get("/system")
async def proxy_system_report(
    request: Request,
    tenant: TenantContext = Depends(require_tenant_context)
):
    return await _proxy_to_reports(request, "/v1/reports/system", tenant)


@router.post("/ai-act/draft")
async def proxy_ai_act_draft(
    request: Request,
    tenant: TenantContext = Depends(require_tenant_context)
):
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN, UserRole.AUDITOR]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    body = await request.body()
    return await _proxy_to_reports(request, "/v1/reports/ai-act/draft", tenant, method="POST", body=body)


@router.post("/ai-act/attest")
async def proxy_ai_act_attest(
    request: Request,
    tenant: TenantContext = Depends(require_tenant_context)
):
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN, UserRole.AUDITOR]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    body = await request.body()
    return await _proxy_to_reports(request, "/v1/reports/ai-act/attest", tenant, method="POST", body=body)
