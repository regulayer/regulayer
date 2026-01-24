"""
Regulayer Ingestion Gateway - Forwarder

Safe forwarding to the Decision Recorder.

CRITICAL GUARANTEES:
- Payload forwarded byte-for-byte
- Headers stripped except signature/attestation
- Gateway NEVER modifies payload
- No hashing, no canonicalization
"""

from typing import Optional, Dict, Any, Tuple
from uuid import UUID

import httpx

from .config import settings
from .auth import TenantContext
from .errors import ForwardingError, RecorderError


# Headers to preserve when forwarding
PRESERVE_HEADERS = {
    "content-type",
    "x-regulayer-signature",
    "x-regulayer-attestation",
    "x-regulayer-timestamp",
    "x-regulayer-nonce",
}


async def forward_to_recorder(
    body: bytes,
    tenant_context: TenantContext,
    original_headers: Dict[str, str]
) -> Tuple[int, Dict[str, Any]]:
    """
    Forward ingestion request to the Decision Recorder.
    
    Args:
        body: Raw request body (byte-for-byte)
        tenant_context: Validated tenant context
        original_headers: Original request headers
    
    Returns:
        (status_code, response_json)
    
    Guarantees:
        - Payload is NOT modified
        - Only allowed headers are forwarded
        - Tenant context is injected
    """
    # Build forwarding headers
    forward_headers = {
        "Content-Type": original_headers.get("content-type", "application/json"),
        
        # Inject tenant context (recorder uses these)
        "X-Regulayer-Org-Id": str(tenant_context.org_id),
        "X-Regulayer-Project-Id": str(tenant_context.project_id),
        "X-Regulayer-Key-Id": str(tenant_context.key_id),
    }
    
    # Preserve signature/attestation headers
    for header_name, header_value in original_headers.items():
        if header_name.lower() in PRESERVE_HEADERS:
            forward_headers[header_name] = header_value
    
    try:
        async with httpx.AsyncClient(timeout=settings.forward_timeout_seconds) as client:
            response = await client.post(
                f"{settings.recorder_url}/v1/decisions",
                content=body,  # Forward byte-for-byte
                headers=forward_headers
            )
            
            # Return response from recorder
            try:
                response_json = response.json()
            except Exception:
                response_json = {"message": response.text}
            
            return response.status_code, response_json
            
    except httpx.TimeoutException:
        raise ForwardingError("Recorder timeout")
    except httpx.RequestError as e:
        raise ForwardingError(f"Recorder connection error: {e}")


async def forward_decision(
    body: bytes,
    tenant_context: TenantContext,
    headers: Dict[str, str]
) -> Dict[str, Any]:
    """
    Forward a decision and handle response.
    
    Raises appropriate errors on failure.
    """
    status_code, response = await forward_to_recorder(body, tenant_context, headers)
    
    if status_code >= 500:
        raise RecorderError(f"Recorder error: {response.get('message', 'Unknown error')}")
    
    if status_code >= 400:
        # Pass through client errors from recorder
        raise RecorderError(
            f"Recorder rejected request: {response.get('message', 'Unknown error')}"
        )
    
    return response
