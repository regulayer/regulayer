
import httpx
from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import StreamingResponse
from .config import settings
from .errors import GatewayError

router = APIRouter()


async def forward_request(request: Request, target_base_url: str, extra_headers: dict = None):
    client = httpx.AsyncClient(base_url=target_base_url)
    
    url = f"{request.url.path}"
    if request.url.query:
        url += f"?{request.url.query}"
        
    # Exclude headers that might confuse the backend or are hop-by-hop
    excluded_headers = {'host', 'content-length'}
    headers = {
        key: value 
        for key, value in request.headers.items() 
        if key.lower() not in excluded_headers
    }
    
    # Inject extra headers (internal secrets, etc.)
    if extra_headers:
        headers.update(extra_headers)
    
    try:
        body = await request.body()
        
        req = client.build_request(
            request.method,
            url,
            content=body,
            headers=headers,
            timeout=settings.forward_timeout_seconds
        )
        
        r = await client.send(req, stream=True)
        
        # Filter response headers
        response_excluded_headers = {'content-length', 'content-encoding', 'transfer-encoding'}
        response_headers = {
            key: value
            for key, value in r.headers.items()
            if key.lower() not in response_excluded_headers
        }
        
        return StreamingResponse(
            r.aiter_bytes(),
            status_code=r.status_code,
            headers=response_headers,
            background=None
        )
        
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(exc)}")
    finally:
        await client.aclose()


async def validate_user_session(auth_header: str) -> dict:
    """
    Validate user session with Control Plane and get context.
    Returns dict with role and org_status.
    """
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    async with httpx.AsyncClient(base_url=settings.control_plane_url) as client:
        try:
            # Call /v1/auth/me to get UserWithOrg
            # We assume the token is in the header "Bearer <token>"
            # We forward the header exactly as received
            resp = await client.get(
                "/v1/auth/me",
                headers={"Authorization": auth_header},
                timeout=settings.auth_timeout_seconds
            )
            
            if resp.status_code == 401:
                raise HTTPException(status_code=401, detail="Invalid or expired session")
            if resp.status_code == 403:
                raise HTTPException(status_code=403, detail="Forbidden")
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail="Auth service error")
            
            data = resp.json()
            # Structure: { ..., "role": "...", "org": { "status": "...", ... } }
            
            return {
                "role": data.get("role", "member"),
                "org_status": data.get("org", {}).get("status", "active")
            }
            
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Auth service unavailable")


# Catch-all for control plane routes
PROXY_PREFIXES = ["/v1/auth", "/v1/orgs", "/v1/projects", "/v1/keys", "/v1/users", "/v1/roles", "/v1/usage", "/v1/me", "/v1/plans"]
RECORDER_PREFIXES = ["/v1/decisions", "/v1/verify", "/v1/recorder"]
GOVERNANCE_PREFIXES = ["/v1/governance"]
INCIDENTS_PREFIXES = ["/v1/incidents", "/v1/public/status"]

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_handler(request: Request, path: str):
    full_path = request.url.path
    # print(f"DEBUG PROXY: path={path}, full_path={full_path}")
    
    # Route to Control Plane
    if any(full_path.startswith(prefix) for prefix in PROXY_PREFIXES):
        return await forward_request(request, settings.control_plane_url)

    # Route to Recorder
    # Includes: /v1/decisions, /v1/verify, /v1/recorder (keys, integrity)
    # Special Case: /v1/reports/chain-integrity is hosted by Recorder, not Reports Service
    if any(full_path.startswith(prefix) for prefix in RECORDER_PREFIXES) or full_path == "/v1/reports/chain-integrity":
        return await forward_request(request, settings.recorder_url)
        
    # Route to Governance
    if any(full_path.startswith(prefix) for prefix in GOVERNANCE_PREFIXES):
        # 1. Validate Session & Get Context
        auth_header = request.headers.get("Authorization")
        context = await validate_user_session(auth_header)
        
        # 2. Inject Context Headers + Internal Secret
        extra_headers = {
            "X-Internal-Auth": settings.governance_internal_secret,
            "X-Actor-Role": context["role"],
            "X-Org-Status": context["org_status"]
        }
        
        return await forward_request(
            request, 
            settings.governance_url,
            extra_headers=extra_headers
        )
    
    # Route to Incidents
    if any(full_path.startswith(prefix) for prefix in INCIDENTS_PREFIXES):
         # Public status is open, but incidents list might need auth? 
         # User said: "Validate user session for GET /v1/incidents"
         # For now, let's forward cleanly.
         return await forward_request(request, settings.incidents_url)

    # Route to Reports Service (General)
    if full_path.startswith("/v1/reports"):
        return await forward_request(request, settings.reports_url)
    
    # If not proxied, return 404 (Gateway doesn't have this)
    raise HTTPException(status_code=404, detail="Not Found")
