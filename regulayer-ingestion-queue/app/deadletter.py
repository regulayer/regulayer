"""
Regulayer Ingestion Queue - Dead Letter Queue

Poison message sink for failed events.

PURPOSE:
- Preserve evidence of failure
- Allow manual replay
- Never silently drop data
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from uuid import UUID
from dataclasses import dataclass
import json

from .producer import QueuedEvent


@dataclass
class DeadLetterEntry:
    """Entry in the Dead Letter Queue."""
    original_event: QueuedEvent
    failure_reason: str
    failed_at: datetime
    retry_count: int
    last_status_code: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize for storage."""
        return {
            "request_id": str(self.original_event.request_id),
            "project_id": str(self.original_event.project_id),
            "org_id": str(self.original_event.org_id),
            "payload_b64": self.original_event.payload.hex(),
            "headers": json.dumps(self.original_event.headers),
            "enqueued_at": self.original_event.enqueued_at.isoformat(),
            "failure_reason": self.failure_reason,
            "failed_at": self.failed_at.isoformat(),
            "retry_count": self.retry_count,
            "last_status_code": self.last_status_code,
        }


from .config import settings

class DeadLetterQueue:
    """
    Redis-backed Dead Letter Queue for failed messages.
    """
    
    def __init__(self):
        self._redis = None
        self.dlq_key = f"{settings.redis_stream_prefix}:dlq"
        
    async def _get_redis(self):
        if self._redis is None:
            import redis.asyncio as redis
            self._redis = redis.from_url(settings.redis_url)
        return self._redis
    
    async def add(
        self,
        event: QueuedEvent,
        failure_reason: str,
        retry_count: int,
        last_status_code: Optional[int] = None
    ) -> None:
        """Add a failed event to the Redis DLQ."""
        entry = DeadLetterEntry(
            original_event=event,
            failure_reason=failure_reason,
            failed_at=datetime.now(timezone.utc),
            retry_count=retry_count,
            last_status_code=last_status_code
        )
        
        redis = await self._get_redis()
        # Save as JSON string in Redis Hash
        await redis.hset(self.dlq_key, str(event.request_id), json.dumps(entry.to_dict()))
    
    async def get_all(self) -> List[DeadLetterEntry]:
        """Get all DLQ entries from Redis."""
        redis = await self._get_redis()
        raw_entries = await redis.hgetall(self.dlq_key)
        
        results = []
        for v in raw_entries.values():
            try:
                data = json.loads(v)
                # Reconstruct QueuedEvent
                event_data = {
                    "request_id": data["request_id"],
                    "project_id": data["project_id"],
                    "org_id": data["org_id"],
                    "payload_b64": data["payload_b64"],
                    "headers": data["headers"],
                    "enqueued_at": data["enqueued_at"],
                    "sequence_number": data.get("sequence_number", 0),
                    "retry_count": data.get("retry_count", 0)
                }
                event = QueuedEvent.from_dict(event_data)
                
                entry = DeadLetterEntry(
                    original_event=event,
                    failure_reason=data["failure_reason"],
                    failed_at=datetime.fromisoformat(data["failed_at"]),
                    retry_count=data["retry_count"],
                    last_status_code=data.get("last_status_code")
                )
                results.append(entry)
            except Exception:
                pass # skip corrupted
        return results
    
    async def get_by_project(self, project_id: UUID) -> List[DeadLetterEntry]:
        all_entries = await self.get_all()
        return [e for e in all_entries if str(e.original_event.project_id) == str(project_id)]
    
    async def count(self) -> int:
        redis = await self._get_redis()
        return await redis.hlen(self.dlq_key)
    
    async def count_by_project(self, project_id: UUID) -> int:
        return len(await self.get_by_project(project_id))
    
    async def get_stats(self) -> Dict[str, Any]:
        all_entries = await self.get_all()
        by_reason: Dict[str, int] = {}
        by_project: Dict[str, int] = {}
        
        for entry in all_entries:
            reason = entry.failure_reason.split(":")[0]
            by_reason[reason] = by_reason.get(reason, 0) + 1
            
            proj = str(entry.original_event.project_id)
            by_project[proj] = by_project.get(proj, 0) + 1
            
        return {
            "total": len(all_entries),
            "by_project": by_project,
            "by_reason": by_reason
        }
    
    async def replay_one(self, request_id: UUID) -> Optional[QueuedEvent]:
        redis = await self._get_redis()
        raw = await redis.hget(self.dlq_key, str(request_id))
        if not raw:
            return None
            
        try:
            data = json.loads(raw)
            event_data = {
                "request_id": data["request_id"],
                "project_id": data["project_id"],
                "org_id": data["org_id"],
                "payload_b64": data["payload_b64"],
                "headers": data["headers"],
                "enqueued_at": data["enqueued_at"]
            }
            event = QueuedEvent.from_dict(event_data)
            await redis.hdel(self.dlq_key, str(request_id))
            return event
        except Exception:
            return None

# ============================================================
# Global Instance
# ============================================================

_dlq: Optional[DeadLetterQueue] = None

def get_dead_letter_queue() -> DeadLetterQueue:
    """Get or create the global DLQ."""
    global _dlq
    if _dlq is None:
        _dlq = DeadLetterQueue()
    return _dlq

async def send_to_dlq(
    event: QueuedEvent,
    failure_reason: str,
    retry_count: int,
    last_status_code: Optional[int] = None
) -> None:
    await get_dead_letter_queue().add(
        event,
        failure_reason,
        retry_count,
        last_status_code
    )
