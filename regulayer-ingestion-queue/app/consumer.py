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
            print(f"DEBUG: Forwarding event {event.request_id} to Recorder...", flush=True)
            url = f"{settings.recorder_url}/v1/decisions"
            print(f"DEBUG: Recorder URL: {url}", flush=True)
            
            async with httpx.AsyncClient(timeout=settings.forward_timeout_seconds) as client:
                response = await client.post(
                    url,
                    content=event.payload,  # Exact bytes
                    headers={
                        "Content-Type": event.headers.get("content-type", "application/json"),
                        "X-Regulayer-Org-Id": str(event.org_id),
                        "X-Regulayer-Project-Id": str(event.project_id),
                        "X-Request-ID": str(event.request_id),
                        **{
                            k: v for k, v in event.headers.items()
                            if k.lower().startswith("x-regulayer-")
                        }
                    }
                )
                print(f"DEBUG: Recorder Response: {response.status_code}", flush=True)
                return response.status_code, None
                
        except Exception as e:
            print(f"DEBUG: Forward Exception: {e}", flush=True)
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
                print(f"DLQ_INGEST_FAILED: Decision {event.request_id} failed permanently. Reason: {result.reason}", flush=True)
                await queue.acknowledge(str(event.project_id), message_id)
                return False
                
        finally:
            await ordering.release_project_lock(event.project_id)
    
    async def consume_project(self, project_id: str) -> None:
        """Consume events for a specific project."""
        try:
            queue = get_queue()
            print(f"DEBUG: Starting consumer loop for project {project_id}", flush=True)
            
            # Debug Group State
            try:
                pending = await queue.get_pending_count(project_id)
                print(f"DEBUG: Pending count for {project_id}: {pending}", flush=True)
            except Exception as e:
                print(f"DEBUG: Failed to get pending count: {e}", flush=True)

            print(f"DEBUG: Entering while loop for {project_id}", flush=True)
            print(f"DEBUG: Queue type: {type(queue)}", flush=True)
            print(f"DEBUG: Queue class: {queue.__class__.__name__}", flush=True)
            
            while self.running:
                try:
                    # print(f"DEBUG: Calling dequeue for {project_id}", flush=True)
                    result = await queue.dequeue(project_id)
                    
                    if result is None:
                        # No messages, wait a bit
                        await asyncio.sleep(0.1)
                        continue
                    
                    print(f"DEBUG: Found message for {project_id}", flush=True)
                    message_id, event = result
                    await self.process_event(message_id, event)
                except Exception as e:
                    import traceback
                    print(f"ERROR: Consumer loop crashed for {project_id}: {e}", flush=True)
                    traceback.print_exc()
                    await asyncio.sleep(1) # Backoff on crash
        except Exception as e:
            import traceback
            print(f"CRITICAL ERROR in consume_project for {project_id}: {e}", flush=True)
            traceback.print_exc()
    
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
