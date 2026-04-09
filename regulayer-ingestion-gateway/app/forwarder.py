"""
Regulayer Ingestion Gateway - Forwarder

Safe forwarding to the Ingestion Queue (Redis).

CRITICAL GUARANTEES:
- Payload forwarded byte-for-byte
- Headers stripped except signature/attestation
- Gateway NEVER modifies payload
- No hashing, no canonicalization
"""

from typing import Dict, Any

from .auth import TenantContext
from .producer import enqueue_decision_to_redis
from .errors import ForwardingError


import httpx
from .config import settings

async def forward_decision(
    body: bytes,
    tenant_context: TenantContext,
    headers: Dict[str, str]
) -> Dict[str, Any]:
    """
    Forward decision to the Ingestion Queue (or directly to Recorder for Gate Mode).
    """
    PRESERVE_HEADERS = {
        "content-type",
        "x-regulayer-signature",
        "x-regulayer-attestation",
        "x-regulayer-timestamp",
        "x-regulayer-nonce",
        "x-request-id",
        "x-regulayer-project-id",
    }
    
    forward_headers = {}
    request_id_from_header = None
    
    for header_name, header_value in headers.items():
        lower_name = header_name.lower()
        if lower_name in PRESERVE_HEADERS:
            forward_headers[header_name] = header_value
            if lower_name == "x-request-id":
                request_id_from_header = header_value
            
    # Inject Environment Header
    if tenant_context.environment:
        forward_headers["x-regulayer-environment"] = tenant_context.environment
    
    # Inject Governance Mode
    forward_headers["x-regulayer-gov-mode"] = tenant_context.governance_mode

    # Inject Org ID
    forward_headers["x-regulayer-org-id"] = str(tenant_context.org_id)
    
    # Inject Project ID (CRITICAL for Governance Policy Scoping)
    forward_headers["x-regulayer-project-id"] = str(tenant_context.project_id)

    # Gate Mode (Synchronous Blocking)
    if tenant_context.governance_mode == "gate":
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{settings.recorder_url}/v1/decisions",
                    content=body,
                    headers=forward_headers,
                    timeout=settings.forward_timeout_seconds
                )
                
                if resp.status_code == 403:
                    # Parse error body
                    err = resp.json()
                    if err.get("detail", {}).get("error") == "GovernanceBlockedError":
                        from fastapi import HTTPException
                        raise HTTPException(status_code=403, detail=err["detail"])
                    resp.raise_for_status()
                elif resp.status_code not in (200, 201, 202):
                    try:
                        err = resp.json()
                        from fastapi import HTTPException
                        raise HTTPException(status_code=resp.status_code, detail=err.get("detail", err))
                    except ValueError:
                        resp.raise_for_status()
                        
                # Success
                return resp.json()
        except httpx.RequestError as e:
            raise ForwardingError(f"Recorder connection error: {e}")
            
    # Observe Mode (Async Queue)
    else:
        try:
            request_id = await enqueue_decision_to_redis(
                body,
                tenant_context,
                forward_headers,
                request_id=request_id_from_header
            )
            
            return {
                "status": "accepted", 
                "decision_id": request_id,
                "id": request_id, 
                "message": "Decision accepted for processing."
            }
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise ForwardingError(f"Queue connection error: {e}")
