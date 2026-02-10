"""
Regulayer Ingestion Gateway - Main Application

Secure, rate-limited, tenant-aware ingestion gateway.

This is the SaaS entry point. The recorder is NEVER exposed directly.
"""

from fastapi import FastAPI, Request, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .auth import validate_request_headers, TenantContext
from .ratelimit import check_rate_limit
from .quota import consume_quota, get_quota_enforcer
from .forwarder import forward_decision
from .middleware import (
    extract_api_key,
    extract_project_id,
    get_request_headers,
    set_tenant_context,
    clear_tenant_context,
    get_client_ip
)
from .errors import (
    GatewayError,
    UnauthorizedError,
    ForbiddenError,
    RateLimitError,
    QuotaExceededError,
    ForwardingError,
    RecorderError
)


app = FastAPI(
    title="Regulayer Ingestion Gateway",
    description="Public SaaS entry point for decision ingestion",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Allow GET for read APIs
    allow_headers=["*"],
)


# ============================================================
# Error Handlers
# ============================================================

@app.exception_handler(GatewayError)
async def gateway_error_handler(request: Request, exc: GatewayError):
    """Handle all gateway errors consistently."""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_response()
    )


# ============================================================
# Ingestion Endpoint
# ============================================================

@app.post("/v1/ingest/decision", status_code=status.HTTP_202_ACCEPTED)
@app.post("/v1/decisions", status_code=status.HTTP_202_ACCEPTED)
async def ingest_decision(request: Request, response: Response):
    """
    Public decision ingestion endpoint.
    
    This is the ONLY way to ingest decisions in SaaS mode.
    
    Required Headers:
        X-Regulayer-Api-Key: API key with 'ingest' scope
        X-Regulayer-Project-Id: Project ID (optional, derived from key)
    
    Flow:
        1. Validate API key via control plane
        2. Check rate limits
        3. Check quotas
        4. Forward to recorder (byte-for-byte)
        5. Return recorder response
    """
    try:
        # 1. Extract auth info
        api_key = extract_api_key(request)
        project_id = extract_project_id(request)
        
        # 2. Validate via control plane
        tenant_context = await validate_request_headers(api_key, project_id)
        set_tenant_context(tenant_context)
        
        # 3. Check Billing Status (Enforcement I.6.2)
        # Only ACTIVE or TRIAL orgs can ingest.
        # Frozen orgs can still READ (handled by exemptions) but NOT ingest.
        allowed_statuses = {"active", "trial"}
        if tenant_context.org_status not in allowed_statuses:
            raise ForbiddenError(
                f"Organization status is '{tenant_context.org_status}'. Billing required for ingestion.",
                error_code="BILLING_REQUIRED"
            )
        
        # 4. Check rate limits (per API key)
        check_rate_limit(str(tenant_context.key_id))
        
        # 4. Check quotas (per project)
        remaining = await consume_quota(str(tenant_context.project_id))
        
        # 5. Read body (byte-for-byte)
        body = await request.body()
        
        # 6. Forward to recorder
        headers = get_request_headers(request)
        forward_response = await forward_decision(body, tenant_context, headers)
        
        # 7. Return response with quota info
        # Strict 202 Accepted
        response.status_code = status.HTTP_202_ACCEPTED
        
        return {
            **forward_response,
            "_gateway": {
                "quota_remaining": remaining
            }
        }
        
    finally:
        clear_tenant_context()


# ============================================================
# Health Check (MUST be before proxy catch-all)
# ============================================================

@app.get("/health")
async def health_check():
    """Gateway health check."""
    return {
        "status": "healthy",
        "service": "ingestion-gateway"
    }


# ============================================================
# Proxy Router (catch-all — must be LAST)
# ============================================================

from .proxy import router as proxy_router

app.include_router(proxy_router)


# ============================================================
# Quota Status
# ============================================================
@app.get("/v1/quota/status")
async def quota_status(request: Request):
    """
    Get quota status for current API key.
    
    Requires valid API key.
    """
    api_key = extract_api_key(request)
    project_id = extract_project_id(request)
    
    tenant_context = await validate_request_headers(api_key, project_id)
    
    return await get_quota_enforcer().get_usage(str(tenant_context.project_id))
