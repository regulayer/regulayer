"""
Regulayer Ingestion Gateway - Main Application

Secure, rate-limited, tenant-aware ingestion gateway.

This is the SaaS entry point. The recorder is NEVER exposed directly.
"""

from fastapi import FastAPI, Request, HTTPException, Response, status
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

# ---------- Pure-ASGI CORS Middleware ----------
# Starlette's CORSMiddleware does NOT work reliably when combined with
# BaseHTTPMiddleware subclasses. We use a pure-ASGI implementation.

class _CORSMiddleware:
    """Lightweight pure-ASGI CORS middleware."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers_raw = dict(scope.get("headers", []))
        origin = headers_raw.get(b"origin", b"").decode()

        if scope["method"] == "OPTIONS":
            resp_headers = [
                (b"access-control-allow-origin", origin.encode() if origin else b"*"),
                (b"access-control-allow-methods", b"GET,POST,PUT,PATCH,DELETE,OPTIONS"),
                (b"access-control-allow-headers", b"*"),
                (b"access-control-max-age", b"600"),
                (b"content-length", b"0"),
            ]
            await send({"type": "http.response.start", "status": 204, "headers": resp_headers})
            await send({"type": "http.response.body", "body": b""})
            return

        async def send_with_cors(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"access-control-allow-origin", origin.encode() if origin else b"*"))
                headers.append((b"access-control-expose-headers", b"*"))
                message = {**message, "headers": headers}
            await send(message)

        await self.app(scope, receive, send_with_cors)

from .observability import RequestIdMiddleware, StructuredLoggerMiddleware, SecurityHeadersMiddleware

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(StructuredLoggerMiddleware)
app.add_middleware(RequestIdMiddleware)

# CORS must be added LAST so it runs as the OUTERMOST layer.
# In Starlette, middleware added last = executed first (outermost wrapper).
app.add_middleware(_CORSMiddleware)


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
        # 4. Check rate limits (per API key)
        await check_rate_limit(str(tenant_context.key_id))
        
        # 4. Check quotas (per project)
        remaining = await consume_quota(str(tenant_context.project_id))
        
        # 5. Read body (byte-for-byte)
        body = await request.body()
        
        # 6. Forward to recorder
        headers = get_request_headers(request)
        forward_response = await forward_decision(body, tenant_context, headers)
        
        # 7. Return response with quota info
        if tenant_context.governance_mode == "gate":
            # If the recorder indicated pending human review, return 202 Accepted
            if forward_response.get("status") == "pending_review":
                response.status_code = status.HTTP_202_ACCEPTED
            else:
                response.status_code = status.HTTP_201_CREATED
        else:
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
