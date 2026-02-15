
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
    Returns dict with role, org_status, and org_id.
    """
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    async with httpx.AsyncClient(base_url=settings.control_plane_url) as client:
        try:
            # Call /v1/auth/me to get UserWithOrg
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
            # Structure: { ..., "role": "...", "org": { "id": "...", "status": "...", ... } }
            
            return {
                "role": data.get("role", "member"),
                "org_status": data.get("org", {}).get("status", "active"),
                "org_id": data.get("org", {}).get("id")
            }
            
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Auth service unavailable")


async def validate_project_access(auth_header: str, project_id: str):
    """
    Verify that the authenticated user's organization owns the project.
    """
    # 1. Get User Context
    user_ctx = await validate_user_session(auth_header)
    user_org_id = user_ctx.get("org_id")
    
    if not user_org_id:
        raise HTTPException(status_code=403, detail="User has no organization")

    # 2. Get Project Details
    async with httpx.AsyncClient(base_url=settings.control_plane_url) as client:
        try:
            # We use the user's token so that if get_project becomes secured/RBAC'd, it works.
            # Currently get_project is open, but using token is best practice.
            resp = await client.get(
                f"/v1/projects/{project_id}",
                headers={"Authorization": auth_header},
                timeout=settings.auth_timeout_seconds
            )
            
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Project not found")
            
            if resp.status_code != 200:
                # If 403, user can't see project => good.
                raise HTTPException(status_code=403, detail="Access denied to project")
            
            project_data = resp.json()
            project_org_id = project_data.get("organization_id")
            
            # 3. Compare Org IDs
            if project_org_id != user_org_id:
                raise HTTPException(status_code=403, detail="Project does not belong to your organization")
                
        except httpx.RequestError:
             raise HTTPException(status_code=503, detail="Auth service unavailable")


# Catch-all for control plane routes
PROXY_PREFIXES = ["/v1/auth", "/v1/orgs", "/v1/projects", "/v1/keys", "/v1/users", "/v1/roles", "/v1/usage", "/v1/me", "/v1/plans"]
# Recorder Prefixes excluding decisions (handled separately)
RECORDER_PREFIXES = ["/v1/verify", "/v1/recorder"]
GOVERNANCE_PREFIXES = ["/v1/governance"]
INCIDENTS_PREFIXES = ["/v1/incidents", "/v1/public/status"]

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_handler(request: Request, path: str):
    full_path = request.url.path
    
    # 1. Secure Decisions Read API (Anti-Data Leak)
    if full_path.startswith("/v1/decisions"):
        # Enforce Authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Missing Authorization header")
            
        # Enforce Project ID (Isolation)
        project_id = request.headers.get("X-Regulayer-Project-Id")
        if not project_id:
            raise HTTPException(status_code=400, detail="X-Regulayer-Project-Id header required for SaaS reads")
            
        # Validate Access
        await validate_project_access(auth_header, project_id)
        
        # Forward to Recorder
        return await forward_request(request, settings.recorder_url)

    # 2. Route to Control Plane
    if any(full_path.startswith(prefix) for prefix in PROXY_PREFIXES):
        return await forward_request(request, settings.control_plane_url)

    # 3. Route to Recorder (Other endpoints)
    if any(full_path.startswith(prefix) for prefix in RECORDER_PREFIXES) or full_path == "/v1/reports/chain-integrity":
        return await forward_request(request, settings.recorder_url)
        
    # 4. Route to Governance
    if any(full_path.startswith(prefix) for prefix in GOVERNANCE_PREFIXES):
        # Validate Session & Get Context
        auth_header = request.headers.get("Authorization")
        context = await validate_user_session(auth_header)
        
        # Inject Context Headers + Internal Secret
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
    
    # 5. Route to Incidents
    if any(full_path.startswith(prefix) for prefix in INCIDENTS_PREFIXES):
         return await forward_request(request, settings.incidents_url)

    # 6. Route to Reports Service
    if full_path.startswith("/v1/reports"):
        return await forward_request(request, settings.reports_url)
    
    # 7. Not Found
    raise HTTPException(status_code=404, detail="Not Found")
