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


async def forward_decision(
    body: bytes,
    tenant_context: TenantContext,
    headers: Dict[str, str]
) -> Dict[str, Any]:
    """
    Forward decision to the Ingestion Queue.
    
    Args:
        body: Raw request body (byte-for-byte)
        tenant_context: Validated tenant context
        headers: Original request headers
    
    Returns:
        Dict with status info (e.g. {"status": "accepted", "id": "..."})
    """
    # Filter headers to forward
    # (Actually, producer.py takes all headers and consumers might filter, 
    # but let's filter here to save space in Redis if needed. 
    # However, for forensic integrity, maybe keeping them all is safer?
    # The original forwarder filtered. Let's stick to filtering.)
    
    PRESERVE_HEADERS = {
        "content-type",
        "x-regulayer-signature",
        "x-regulayer-attestation",
        "x-regulayer-timestamp",
        "x-regulayer-nonce",
    }
    
    forward_headers = {}
    for header_name, header_value in headers.items():
        if header_name.lower() in PRESERVE_HEADERS:
            forward_headers[header_name] = header_value

    try:
        # Enqueue to Redis
        request_id = await enqueue_decision_to_redis(
            body,
            tenant_context,
            forward_headers
        )
        
        # Return 202 Accepted semantics
        return {
            "status": "accepted", 
            "id": request_id, 
            "message": "Decision accepted for processing."
        }
            
    except Exception as e:
        raise ForwardingError(f"Queue connection error: {e}")
