"""
Regulayer Ingestion Queue - Consumer

Forward queued events to the recorder.

GUARANTEES:
- Per-project ordering maintained
- Bounded retries
- Poison messages go to DLQ
- No payload mutation
"""

import asyncio
from typing import Optional, Set
from uuid import UUID

import httpx

from .config import settings
from .producer import QueuedEvent, get_queue
from .ordering import get_ordering_manager
from .retry import should_retry, RetryDecision, wait_for_retry
from .deadletter import send_to_dlq


class QueueConsumer:
    """
    Consumes events from queue and forwards to recorder.
    
    Maintains per-project ordering while allowing parallel processing
    across projects.
    """
    
    def __init__(self):
        self.running = False
        self._active_projects: Set[str] = set()
    
    async def forward_to_recorder(
        self,
        event: QueuedEvent
    ) -> tuple[Optional[int], Optional[Exception]]:
        """
        Forward event payload to recorder.
        
        Returns (status_code, exception).
        """
        try:
            async with httpx.AsyncClient(timeout=settings.forward_timeout_seconds) as client:
                response = await client.post(
                    f"{settings.recorder_url}/v1/decisions",
                    content=event.payload,  # Exact bytes
                    headers={
                        "Content-Type": event.headers.get("content-type", "application/json"),
                        "X-Regulayer-Org-Id": str(event.org_id),
                        "X-Regulayer-Project-Id": str(event.project_id),
                        **{
                            k: v for k, v in event.headers.items()
                            if k.lower().startswith("x-regulayer-")
                        }
                    }
                )
                return response.status_code, None
                
        except Exception as e:
            return None, e
    
    async def process_event(
        self,
        message_id: str,
        event: QueuedEvent
    ) -> bool:
        """
        Process a single event.
        
        Returns True if successful, False if sent to DLQ.
        """
        ordering = get_ordering_manager()
        queue = get_queue()
        
        # Acquire project lock for ordering
        await ordering.wait_for_project_lock(event.project_id)
        
        try:
            status_code, exception = await self.forward_to_recorder(event)
            
            result = should_retry(status_code, exception, event.retry_count)
            
            if result.decision == RetryDecision.SUCCESS:
                # Acknowledge and record sequence
                await queue.acknowledge(str(event.project_id), message_id)
                ordering.record_sequence(event.project_id, event.sequence_number)
                return True
            
            elif result.decision == RetryDecision.RETRY:
                # Wait and retry
                event.retry_count += 1
                await wait_for_retry(event.retry_count)
                
                # Re-enqueue
                await queue.enqueue(event)
                await queue.acknowledge(str(event.project_id), message_id)
                return True
            
            else:  # DEAD_LETTER
                # Send to DLQ
                await send_to_dlq(
                    event,
                    result.reason,
                    event.retry_count,
                    status_code
                )
                await queue.acknowledge(str(event.project_id), message_id)
                return False
                
        finally:
            await ordering.release_project_lock(event.project_id)
    
    async def consume_project(self, project_id: str) -> None:
        """Consume events for a specific project."""
        queue = get_queue()
        
        while self.running:
            result = await queue.dequeue(project_id)
            
            if result is None:
                # No messages, wait a bit
                await asyncio.sleep(0.1)
                continue
            
            message_id, event = result
            await self.process_event(message_id, event)
    
    async def run(self, project_ids: list[str]) -> None:
        """
        Run consumer for specified projects.
        
        Each project is processed in parallel but events within
        a project are strictly ordered.
        """
        self.running = True
        self._active_projects = set(project_ids)
        
        tasks = [
            asyncio.create_task(self.consume_project(pid))
            for pid in project_ids
        ]
        
        try:
            await asyncio.gather(*tasks)
        finally:
            self.running = False
    
    def stop(self) -> None:
        """Stop the consumer."""
        self.running = False


# ============================================================
# Worker Entry Point
# ============================================================

async def run_consumer(project_ids: list[str]) -> None:
    """Run the queue consumer."""
    consumer = QueueConsumer()
    await consumer.run(project_ids)
