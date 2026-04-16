
import httpx
from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import StreamingResponse
from .config import settings
from .errors import GatewayError

router = APIRouter()


async def forward_request(request: Request, target_base_url: str, extra_headers: dict | None = None):
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
        for extra_k, extra_v in extra_headers.items():
            # Remove existing header ignoring case to prevent duplicates
            keys_to_delete = [k for k in headers.keys() if k.lower() == extra_k.lower()]
            for k in keys_to_delete:
                del headers[k]
            headers[extra_k] = extra_v
    
    try:
        body = await request.body()
        
        req = client.build_request(
            request.method,
            url,
            content=body,
            headers=headers,
            timeout=settings.forward_timeout_seconds
        )
        
        r = await client.send(req)
        
        # Filter response headers
        response_excluded_headers = {'content-encoding', 'transfer-encoding'}
        response_headers = {
            key: value
            for key, value in r.headers.items()
            if key.lower() not in response_excluded_headers
        }
        
        return Response(
            content=r.content,
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
                "org_id": data.get("org", {}).get("id"),
                "email": data.get("email")
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
PROXY_PREFIXES = ["/v1/auth", "/v1/orgs", "/v1/projects", "/v1/keys", "/v1/users", "/v1/roles", "/v1/usage", "/v1/me", "/v1/plans", "/v1/billing", "/v1/status", "/v1/admin"]
# Recorder Prefixes excluding decisions (handled separately)
RECORDER_PREFIXES = ["/v1/verify", "/v1/recorder"]
GOVERNANCE_PREFIXES = ["/v1/governance"]
INCIDENTS_PREFIXES = ["/v1/incidents", "/v1/public/status"]
POLICY_PREFIXES = ["/v1/policies"]

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_handler(request: Request, path: str):
    full_path = request.url.path
    
    # 1. Secure Decisions Read API (Anti-Data Leak)
    # Only proxy GET requests. POST requests are handled by the native ingestion endpoint in main.py.
    if full_path.startswith("/v1/decisions") and request.method == "GET":
        # Enforce Authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Missing Authorization header")
            
        # Enforce Project ID (Isolation) - bypass for review-status polling by SDK
        project_id = request.headers.get("X-Regulayer-Project-Id")
        if not project_id and not full_path.endswith("/review-status"):
            raise HTTPException(status_code=400, detail="X-Regulayer-Project-Id header required for SaaS reads")
            
        extra_headers = None
        # Validate Access (Bypass project check if polling status, as decision ID is untweakable uuid)
        if not full_path.endswith("/review-status"):
            if project_id == "all":
                user_ctx = await validate_user_session(auth_header)
                user_org_id = user_ctx.get("org_id")
                if not user_org_id:
                    raise HTTPException(status_code=403, detail="User has no organization")
                
                # Fetch user's projects to enforce isolation
                async with httpx.AsyncClient(base_url=settings.control_plane_url) as client:
                    try:
                        resp = await client.get(
                            f"/v1/orgs/{user_org_id}/projects",
                            headers={"Authorization": auth_header},
                            timeout=settings.auth_timeout_seconds
                        )
                        if resp.status_code == 200:
                            projects = resp.json()
                            allowed_project_ids = [p["id"] for p in projects]
                            if allowed_project_ids:
                                extra_headers = {"X-Regulayer-Project-Id": ",".join(allowed_project_ids)}
                            else:
                                # User has no projects, return empty list fast without hitting recorder
                                return Response(content="[]", media_type="application/json")
                        else:
                            raise HTTPException(status_code=503, detail="Failed to fetch projects for access check")
                    except httpx.RequestError:
                        raise HTTPException(status_code=503, detail="Control plane unavailable")
            else:
                await validate_project_access(auth_header, project_id)
        
        # Forward to Recorder
        return await forward_request(request, settings.recorder_url, extra_headers)

    # 2. Route to Control Plane
    if any(full_path.startswith(prefix) for prefix in PROXY_PREFIXES):
        return await forward_request(request, settings.control_plane_url)

    if any(full_path.startswith(prefix) for prefix in POLICY_PREFIXES):
        # We enforce internal/external auth later inside the policy service, but proxy just passes it through
        auth_header = request.headers.get("Authorization")
        org_id = None
        actor_email = None
        if auth_header:
            ctx = await validate_user_session(auth_header)
            org_id = ctx.get("org_id")
            actor_email = ctx.get("email")
            
        extra_headers = {
            "X-Internal-Auth": settings.governance_internal_secret  # Reusing governance secret since they talk closely
        }
        if org_id:
            extra_headers["X-Org-Id"] = org_id
        if actor_email:
            extra_headers["X-Actor-Email"] = actor_email
            
        return await forward_request(request, settings.policy_url, extra_headers=extra_headers)

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
            "X-Actor-Role": context.get("role", "analyst"),
            "X-Org-Status": context.get("org_status", "active")
        }
        if context.get("org_id"):
            extra_headers["X-Org-Id"] = context["org_id"]
        if context.get("email"):
            extra_headers["X-Actor-Email"] = context["email"]
            
        return await forward_request(
            request, 
            settings.governance_url,
            extra_headers=extra_headers
        )
    
    # 5. Route to Incidents
    if any(full_path.startswith(prefix) for prefix in INCIDENTS_PREFIXES):
        if full_path == "/v1/incidents": # Protected listing
             auth_header = request.headers.get("Authorization")
             if not auth_header:
                 raise HTTPException(status_code=401, detail="Authentication required to list incidents")
             # We validate session to ensure valid user, even if we don't strictly use context yet
             await validate_user_session(auth_header)
        
        # Inject Internal Secret
        extra_headers = {
            "X-Internal-Auth": settings.incidents_internal_secret
        }
        return await forward_request(request, settings.incidents_url, extra_headers=extra_headers)

    # 6. Route to Reports Service
    if full_path.startswith("/v1/reports"):
        # Validate Session for Reports
        extra_headers = {
            "X-Internal-Auth": settings.reports_internal_secret
        }
        auth_header = request.headers.get("Authorization")
        if auth_header:
             ctx = await validate_user_session(auth_header)
             if ctx.get("org_id"):
                 extra_headers["X-Org-Id"] = ctx["org_id"]
                 extra_headers["X-Actor-Role"] = ctx["role"]

        return await forward_request(request, settings.reports_url, extra_headers=extra_headers)
    
    # 7. Not Found
    raise HTTPException(status_code=404, detail="Not Found")
