
import httpx
from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import StreamingResponse
from .config import settings
from .errors import GatewayError

router = APIRouter()

async def forward_request(request: Request, target_base_url: str):
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


# Catch-all for control plane routes
PROXY_PREFIXES = ["/v1/auth", "/v1/orgs", "/v1/projects", "/v1/keys", "/v1/users", "/v1/roles", "/v1/usage", "/v1/me", "/v1/plans"]
RECORDER_PREFIXES = ["/v1/decisions", "/v1/verify"]
GOVERNANCE_PREFIXES = ["/v1/governance"]

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_handler(request: Request, path: str):
    full_path = request.url.path
    print(f"DEBUG PROXY: path={path}, full_path={full_path}")
    print(f"DEBUG PROXY: Checking against prefixes")
    
    # Route to Control Plane
    if any(full_path.startswith(prefix) for prefix in PROXY_PREFIXES):
        return await forward_request(request, settings.control_plane_url)

    # Route to Recorder
    if any(full_path.startswith(prefix) for prefix in RECORDER_PREFIXES):
        return await forward_request(request, settings.recorder_url)
        
    # Route to Governance
    if any(full_path.startswith(prefix) for prefix in GOVERNANCE_PREFIXES):
        return await forward_request(request, settings.governance_url)
    
    # Route to Reports
    if full_path.startswith("/v1/reports"):
        return await forward_request(request, settings.reports_url)
    
    # If not proxied, return 404 (Gateway doesn't have this)
    raise HTTPException(status_code=404, detail="Not Found")
