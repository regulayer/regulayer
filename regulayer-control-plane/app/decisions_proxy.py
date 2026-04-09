from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional, Any
from uuid import UUID
import httpx

from .middleware import require_tenant_context, TenantContext
from .config import settings
from .storage import get_db, ProjectDB
from sqlalchemy.orm import Session

from .usage import record_api_call

# Define Router
router = APIRouter(prefix="/v1/decisions", tags=["decisions-proxy"])

# Helper for forwarding
async def forward_to_recorder(
    method: str,
    path: str,
    project_id: str,
    params: Optional[dict] = None
):
    """
    Forward request to Recorder Service with project header.
    """
    # 1. Resolve Recorder URL
    base_url = settings.recorder_url if hasattr(settings, 'recorder_url') else "http://recorder:8000"
    url = f"{base_url.rstrip('/')}{path}"
    
    # 2. Prepare Headers
    headers = {
        "X-Regulayer-Project-Id": project_id,
        "Accept": "application/json"
    }
    
    # 3. Execute Request
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                timeout=10.0
            )
            
            if resp.status_code >= 400:
                # Propagate error
                try:
                    detail = resp.json().get("detail", resp.text)
                except:
                    detail = resp.text
                raise HTTPException(status_code=resp.status_code, detail=detail)
            
            return resp.json()
            
        except httpx.RequestError as e:
            print(f"Recorder Proxy Error: {str(e)}")
            raise HTTPException(status_code=503, detail="Recorder service unavailable")


# ============================================================
# Endpoints
# ============================================================

@router.get("", summary="List decisions")
@router.get("/", summary="List decisions", include_in_schema=False)
async def list_decisions(
    project_id: str = Query(..., description="Project ID to filter by"),
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """
    List decisions for a project.
    REQ: User must belong to the organization that owns the project.
    """
    # 1. Verify Project Access
    if project_id == "all":
        # Enforce API Key Scoping
        if tenant.project_id:
             raise HTTPException(status_code=403, detail="API Keys cannot query 'all' projects")
             
        projects = db.query(ProjectDB).filter(ProjectDB.organization_id == tenant.organization_id).all()
            
        import asyncio
        tasks = []
        # Query each project chain
        for p in projects:
            tasks.append(forward_to_recorder("GET", "/v1/decisions", project_id=str(p.id), params={"limit": limit, "offset": 0}))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_decisions = []
        for res in results:
            if isinstance(res, list):
                all_decisions.extend(res)
            elif isinstance(res, dict) and "decision_id" in res:
                all_decisions.append(res)
                
        # Sort by server_timestamp descending and slice
        all_decisions.sort(key=lambda d: d.get("server_timestamp", ""), reverse=True)
        return all_decisions[:limit]

    try:
        pid_uuid = UUID(project_id)
    except ValueError:
         raise HTTPException(status_code=400, detail="Invalid Project ID")

    # Enforce API Key Scoping
    if tenant.project_id and tenant.project_id != pid_uuid:
         raise HTTPException(status_code=403, detail="API Key is not authorized for this project")

    project = db.query(ProjectDB).filter(ProjectDB.id == pid_uuid).first()
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
         
    if project.organization_id != tenant.organization_id:
         raise HTTPException(status_code=403, detail="Access denied to this project")

    # 2. Record API Usage (if API Key used)
    if tenant.project_id:
        record_api_call(db, tenant.project_id)

    # 3. Forward to Recorder
    return await forward_to_recorder(
        "GET", 
        "/v1/decisions", 
        project_id=project_id,
        params={"limit": limit, "offset": offset}
    )


@router.get("/{decision_id}", summary="Get decision details")
async def get_decision(
    decision_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """
    Get a single decision.
    WARNING: Decision ID lookup in Recorder doesn't require Project ID in query, 
    but we should ideally verify ownership.
    However, Recorder storage is by chain_id (Project ID). 
    If we don't know the project ID, we can't easily check ownership without querying Recorder first 
    to see WHICH chain it belongs to, then checking if we own that chain.
    
    For now/MVP: We will allow reading the decision if valid UUID. 
    Refinement: We can fetch decision from Recorder, check its 'chain_id' (which is project_id), 
    and verify user owns that project.
    """
    
    # 1. Fetch from Recorder (Internal) using a generic 'global' or just path lookup
    # Recorder endpoint: GET /decisions/{id} -> Returns record with 'chain_id'
    
    base_url = settings.recorder_url if hasattr(settings, 'recorder_url') else "http://recorder:8000"
    url = f"{base_url.rstrip('/')}/v1/decisions/{decision_id}"
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=5.0)
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Decision not found")
            if resp.status_code >= 400:
                 raise HTTPException(status_code=resp.status_code, detail="Error fetching decision")
            
            decision = resp.json()
            chain_id = decision.get("chain_id")
            
            # 2. Verify Ownership
            if chain_id and chain_id != "global":
                try:
                    pid_uuid = UUID(chain_id)

                    # Enforce API Key Scoping
                    if tenant.project_id and tenant.project_id != pid_uuid:
                        raise HTTPException(status_code=403, detail="API Key is not authorized for this decision")

                    project = db.query(ProjectDB).filter(ProjectDB.id == pid_uuid).first()
                    
                    if not project or project.organization_id != tenant.organization_id:
                        # Obfuscate existence for security? Or just 403.
                        raise HTTPException(status_code=403, detail="Access denied")

                    # 3. Record API Usage (if API Key used and access granted)
                    if tenant.project_id:
                        record_api_call(db, tenant.project_id)

                except ValueError:
                    # chain_id is not UUID (e.g. 'global' or legacy)
                    # If global and user is not super-admin? 
                    # For MVP, if chain_id is not a UUID project we own, block it unless we decide otherwise.
                    # Assuming 'global' is not accessible to tenants.
                    raise HTTPException(status_code=403, detail="Access denied to global chain")

            return decision
            
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Recorder unavailable")
