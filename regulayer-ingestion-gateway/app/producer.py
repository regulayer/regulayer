"""
Regulayer Ingestion Gateway - Redis Producer

Enqueues validated decisions to Redis Streams.
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

import redis.asyncio as redis
from .config import settings
from .auth import TenantContext

# Shared Redis Client
_redis: Any = None

async def get_redis():
    global _redis
    if _redis is None:
        print(f"DEBUG: Redis URL: {settings.redis_url}")
        _redis = redis.from_url(settings.redis_url)
    return _redis

async def enqueue_decision_to_redis(
    body: bytes,
    tenant_context: TenantContext,
    headers: Dict[str, str],
    request_id: str | None = None
) -> str:
    """
    Enqueue decision payload to Redis Stream.
    Returns the Request ID (UUID).
    """
    if not request_id:
        request_id = str(uuid.uuid4())
    project_id = str(tenant_context.project_id)
    stream_name = f"{settings.redis_stream_prefix}:{project_id}"
    
    event_data = {
        "request_id": request_id,
        "project_id": project_id,
        "org_id": str(tenant_context.org_id),
        "payload_b64": body.hex(),  # Convert bytes to hex string
        "headers": json.dumps(headers),
        "enqueued_at": datetime.now(timezone.utc).isoformat(),
        # Initial sequence number will be assigned by consumer/worker ordering logic
        "sequence_number": "0", 
        "retry_count": "0"
    }

    r = await get_redis()
    await r.xadd(stream_name, event_data, maxlen=100000)
    
    return request_id
