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


class DeadLetterQueue:
    """
    Dead Letter Queue for failed messages.
    
    Messages here need manual intervention or replay.
    """
    
    def __init__(self):
        self._entries: List[DeadLetterEntry] = []
        self._by_project: Dict[str, List[DeadLetterEntry]] = {}
    
    async def add(
        self,
        event: QueuedEvent,
        failure_reason: str,
        retry_count: int,
        last_status_code: Optional[int] = None
    ) -> None:
        """Add a failed event to the DLQ."""
        entry = DeadLetterEntry(
            original_event=event,
            failure_reason=failure_reason,
            failed_at=datetime.now(timezone.utc),
            retry_count=retry_count,
            last_status_code=last_status_code
        )
        
        self._entries.append(entry)
        
        project_key = str(event.project_id)
        if project_key not in self._by_project:
            self._by_project[project_key] = []
        self._by_project[project_key].append(entry)
    
    async def get_all(self) -> List[DeadLetterEntry]:
        """Get all DLQ entries."""
        return list(self._entries)
    
    async def get_by_project(self, project_id: UUID) -> List[DeadLetterEntry]:
        """Get DLQ entries for a project."""
        return list(self._by_project.get(str(project_id), []))
    
    async def count(self) -> int:
        """Get total DLQ count."""
        return len(self._entries)
    
    async def count_by_project(self, project_id: UUID) -> int:
        """Get DLQ count for a project."""
        return len(self._by_project.get(str(project_id), []))
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get DLQ statistics."""
        by_reason: Dict[str, int] = {}
        
        for entry in self._entries:
            reason = entry.failure_reason.split(":")[0]
            by_reason[reason] = by_reason.get(reason, 0) + 1
        
        return {
            "total": len(self._entries),
            "by_project": {k: len(v) for k, v in self._by_project.items()},
            "by_reason": by_reason
        }
    
    async def replay_one(self, request_id: UUID) -> Optional[QueuedEvent]:
        """
        Remove an entry and return it for replay.
        
        Returns None if not found.
        """
        for i, entry in enumerate(self._entries):
            if entry.original_event.request_id == request_id:
                removed = self._entries.pop(i)
                
                # Also remove from project index
                project_key = str(removed.original_event.project_id)
                if project_key in self._by_project:
                    self._by_project[project_key] = [
                        e for e in self._by_project[project_key]
                        if e.original_event.request_id != request_id
                    ]
                
                return removed.original_event
        
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
    """Send a failed event to the Dead Letter Queue."""
    await get_dead_letter_queue().add(
        event,
        failure_reason,
        retry_count,
        last_status_code
    )
