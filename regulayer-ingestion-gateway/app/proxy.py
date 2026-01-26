
import httpx
from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import StreamingResponse
from .config import settings
from .errors import GatewayError

router = APIRouter()

async def forward_request(request: Request, target_url: str):
    client = httpx.AsyncClient(base_url=settings.control_plane_url)
    
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
        
        return StreamingResponse(
            r.aiter_raw(),
            status_code=r.status_code,
            headers=dict(r.headers),
            background=None
        )
        
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Control Plane unavailable: {str(exc)}")
    finally:
        await client.aclose()


# Catch-all for control plane routes
# We explicitly list the prefixes we want to proxy to avoid accidental exposure
PROXY_PREFIXES = ["/v1/auth", "/v1/orgs", "/v1/projects", "/v1/keys", "/v1/users", "/v1/roles", "/v1/usage", "/v1/me"]

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_handler(request: Request, path: str):
    # Check if path starts with allowed prefix
    path_with_slash = f"/{path}"
    if not any(path_with_slash.startswith(prefix) for prefix in PROXY_PREFIXES):
         # Fallback to local 404/405 if not a proxy route
         # But since we are catching everything here, we should probably check if it matches other local routes first?
         # Actually this router will be mounted/included. Be careful about order.
         # For now, let's just forward if it matches prefix.
         pass

    # If we are here, we match the path var, but we need to verify prefix match again for safety
    # path comes from FastAPI without leading slash usually? let's check.
    full_path = request.url.path
    
    if any(full_path.startswith(prefix) for prefix in PROXY_PREFIXES):
        return await forward_request(request, settings.control_plane_url)
    
    # If not proxied, return 404 (Gateway doesn't have this)
    raise HTTPException(status_code=404, detail="Not Found")
