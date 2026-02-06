"""
Regulayer Ingestion Queue - Producer

Enqueue decision events for async processing.

GUARANTEES:
- At-least-once delivery
- Strict ordering per project
- No mutation of payload
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from dataclasses import dataclass, field
import json
import hashlib

from .config import settings, QueueBackend


@dataclass
class QueuedEvent:
    """Event queued for processing."""
    request_id: UUID
    project_id: UUID
    org_id: UUID
    payload: bytes
    headers: Dict[str, str]
    enqueued_at: datetime
    sequence_number: int = 0
    retry_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize for queue storage."""
        return {
            "request_id": str(self.request_id),
            "project_id": str(self.project_id),
            "org_id": str(self.org_id),
            "payload_b64": self.payload.hex(),  # Preserve bytes exactly
            "headers": json.dumps(self.headers),
            "enqueued_at": self.enqueued_at.isoformat(),
            "sequence_number": str(self.sequence_number),
            "retry_count": str(self.retry_count),
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "QueuedEvent":
        """Deserialize from queue storage."""
        return cls(
            request_id=UUID(data["request_id"]),
            project_id=UUID(data["project_id"]),
            org_id=UUID(data["org_id"]),
            payload=bytes.fromhex(data["payload_b64"]),
            headers=json.loads(data["headers"]),
            enqueued_at=datetime.fromisoformat(data["enqueued_at"]),
            sequence_number=int(data.get("sequence_number", 0)),
            retry_count=int(data.get("retry_count", 0)),
        )


class InMemoryQueue:
    """In-memory queue for testing."""
    
    def __init__(self):
        self._queues: Dict[str, list] = {}
        self._sequence: Dict[str, int] = {}
    
    def get_stream_name(self, project_id: str) -> str:
        return f"{settings.redis_stream_prefix}:{project_id}"
    
    async def enqueue(self, event: QueuedEvent) -> str:
        """Add event to queue. Returns message ID."""
        stream = self.get_stream_name(str(event.project_id))
        
        if stream not in self._queues:
            self._queues[stream] = []
            self._sequence[stream] = 0
        
        self._sequence[stream] += 1
        event.sequence_number = self._sequence[stream]
        
        message_id = f"{event.sequence_number}"
        self._queues[stream].append((message_id, event))
        
        return message_id
    
    async def dequeue(self, project_id: str) -> Optional[tuple[str, QueuedEvent]]:
        """Get next event from queue."""
        stream = self.get_stream_name(project_id)
        
        if stream not in self._queues or not self._queues[stream]:
            return None
        
        return self._queues[stream].pop(0)
    
    async def acknowledge(self, project_id: str, message_id: str) -> None:
        """Acknowledge message processing."""
        pass  # In-memory doesn't need ack
    
    async def get_pending_count(self, project_id: str) -> int:
        """Get number of pending messages."""
        stream = self.get_stream_name(project_id)
        return len(self._queues.get(stream, []))


class RedisQueue:
    """Redis Streams queue for production."""
    
    def __init__(self):
        self._redis = None
    
    async def _get_redis(self):
        """Lazy Redis connection."""
        # print("DEBUG: _get_redis called", flush=True)
        if self._redis is None:
            import redis.asyncio as redis
            self._redis = redis.from_url(settings.redis_url)
        return self._redis
    
    def get_stream_name(self, project_id: str) -> str:
        return f"{settings.redis_stream_prefix}:{project_id}"
    
    async def enqueue(self, event: QueuedEvent) -> str:
        """Add event to Redis Stream."""
        redis = await self._get_redis()
        stream = self.get_stream_name(str(event.project_id))
        
        message_id = await redis.xadd(
            stream,
            event.to_dict(),
            maxlen=100000  # Cap stream length
        )
        
        return message_id.decode() if isinstance(message_id, bytes) else message_id
    
    async def dequeue(self, project_id: str) -> Optional[tuple[str, QueuedEvent]]:
        """Read from Redis Stream consumer group."""
        print(f"DEBUG: STARTING Dequeue for {project_id}", flush=True)
        redis = await self._get_redis()
        stream = self.get_stream_name(project_id)
        
        # Create consumer group if needed
        try:
            await redis.xgroup_create(
                stream,
                settings.consumer_group,
                id="0",
                mkstream=True
            )
        except Exception:
            pass  # Group may already exist
        
        # Read messages
        # DEBUG: Use xread to bypass group logic
        print(f"DEBUG: Dequeueing from stream: {stream}", flush=True)
        messages = await redis.xread(
            {stream: "0"},
            count=1,
            block=settings.batch_timeout_ms
        )
        
        if not messages:
            print(f"DEBUG: xread returned empty for {stream}", flush=True)
            return None
            
        print(f"DEBUG: xread result: {messages}", flush=True)
        
        for stream_name, stream_messages in messages:
            for message_id, data in stream_messages:
                # Decode bytes
                decoded_data = {
                    k.decode() if isinstance(k, bytes) else k:
                    v.decode() if isinstance(v, bytes) else v
                    for k, v in data.items()
                }
                event = QueuedEvent.from_dict(decoded_data)
                msg_id = message_id.decode() if isinstance(message_id, bytes) else message_id
                return msg_id, event
        
        return None
    
    async def acknowledge(self, project_id: str, message_id: str) -> None:
        """Acknowledge message processing."""
        redis = await self._get_redis()
        stream = self.get_stream_name(project_id)
        await redis.xack(stream, settings.consumer_group, message_id)
    
    async def get_pending_count(self, project_id: str) -> int:
        """Get pending message count."""
        redis = await self._get_redis()
        stream = self.get_stream_name(project_id)
        info = await redis.xinfo_groups(stream)
        return sum(g.get(b"pending", 0) for g in info)


# ============================================================
# Factory
# ============================================================

_queue: Optional[Any] = None


def get_queue():
    """Get the configured queue instance."""
    global _queue
    
    if _queue is None:
        print(f"DEBUG: INITIALIZING QUEUE. Configured Backend: {settings.queue_backend}", flush=True)
        if settings.queue_backend == QueueBackend.REDIS:
            print("DEBUG: Using RedisQueue", flush=True)
            _queue = RedisQueue()
        else:
            print(f"DEBUG: Using InMemoryQueue (Fallback? {settings.queue_backend})", flush=True)
            _queue = InMemoryQueue()
    
    return _queue


async def enqueue_decision(
    project_id: UUID,
    org_id: UUID,
    payload: bytes,
    headers: Dict[str, str]
) -> str:
    """
    Enqueue a decision for async processing.
    
    Returns request_id for tracking.
    """
    request_id = uuid4()
    
    event = QueuedEvent(
        request_id=request_id,
        project_id=project_id,
        org_id=org_id,
        payload=payload,
        headers=headers,
        enqueued_at=datetime.now(timezone.utc)
    )
    
    queue = get_queue()
    await queue.enqueue(event)
    
    return str(request_id)
