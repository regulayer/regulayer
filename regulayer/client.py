"""
Regulayer SDK Backend Client

Non-blocking backend communication with memory-based event queue and retry logic.
"""

import asyncio
import atexit
from asyncio import Queue, Task
from typing import Optional
from datetime import datetime

import httpx

from .config import get_config
from .models import DecisionEvent
from .signer import create_signer


# Queue configuration
DEFAULT_QUEUE_SIZE = 1000
DEFAULT_TIMEOUT = 5.0
DEFAULT_MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 1.0  # seconds


class BackendClient:
    """
    Backend communication client with memory queue and retry logic.
    
    Features:
    - In-memory event queue (bounded)
    - Exponential backoff retry
    - Lazy queue drain task startup
    - Graceful shutdown on process exit
    - Silent failure (logs errors, never crashes)
    - TLS-only connections
    
    Note - Queue Drain Lifecycle:
        The queue drain task MUST be started lazily on first event submission
        and shut down gracefully on process exit to prevent subtle background-task
        leaks and unnecessary resource consumption.
    """
    
    def __init__(
        self,
        queue_size: int = DEFAULT_QUEUE_SIZE,
        timeout: float = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_MAX_RETRIES
    ):
        self.queue_size = queue_size
        self.timeout = timeout
        self.max_retries = max_retries
        
        self._queue: Queue = Queue(maxsize=queue_size)
        self._drain_task: Optional[Task] = None
        self._shutdown = False
        
        # Register shutdown handler
        atexit.register(self.shutdown)
    
    def submit_event(self, event: DecisionEvent):
        """
        Submit event to queue for transmission.
        
        This method never blocks user code.
        If queue is full, oldest events are dropped (logged).
        
        Args:
            event: DecisionEvent to transmit
        
        Note:
            This starts the queue drain task lazily on first call.
        """
        config = get_config()
        logger = config.get_logger()
        
        try:
            # Start drain task lazily on first event
            if self._drain_task is None and not self._shutdown:
                self._start_drain_task()
            
            # Try to add to queue (non-blocking)
            try:
                self._queue.put_nowait(event)
            except asyncio.QueueFull:
                # Queue is full - drop oldest event
                try:
                    dropped = self._queue.get_nowait()
                    logger.warning(
                        f"Queue overflow: dropped event {dropped.decision_id} "
                        f"(queue size: {self.queue_size})"
                    )
                    # Now add new event
                    self._queue.put_nowait(event)
                except Exception as e:
                    logger.error(f"Failed to handle queue overflow: {e}")
        
        except Exception as e:
            # Silent failure - log but never crash user code
            logger.error(f"Failed to submit event {event.decision_id}: {e}")
    
    def _start_drain_task(self):
        """Start the queue drain task (lazy initialization)."""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            # No event loop in current thread - create one
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        self._drain_task = loop.create_task(self._drain_queue())
    
    async def _drain_queue(self):
        """
        Continuously drain the event queue and send to backend.
        
        This task runs until shutdown is called.
        """
        config = get_config()
        logger = config.get_logger()
        
        logger.info("Queue drain task started")
        
        while not self._shutdown:
            try:
                # Wait for event (with timeout to check shutdown flag)
                try:
                    event = await asyncio.wait_for(
                        self._queue.get(),
                        timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue
                
                # Send event with retry logic
                await self._send_event_with_retry(event)
                
            except Exception as e:
                logger.error(f"Error in queue drain loop: {e}")
                # Continue draining even if one event fails
                await asyncio.sleep(0.1)
        
        logger.info("Queue drain task stopped")
    
    async def _send_event_with_retry(self, event: DecisionEvent):
        """
        Send event to backend with exponential backoff retry.
        
        Args:
            event: DecisionEvent to send
        """
        config = get_config()
        logger = config.get_logger()
        
        for attempt in range(self.max_retries):
            try:
                await self._send_event(event)
                logger.debug(f"Event {event.decision_id} sent successfully")
                return
            
            except Exception as e:
                if attempt < self.max_retries - 1:
                    # Exponential backoff
                    delay = INITIAL_RETRY_DELAY * (2 ** attempt)
                    logger.warning(
                        f"Event {event.decision_id} send failed (attempt {attempt + 1}/{self.max_retries}): {e}. "
                        f"Retrying in {delay}s..."
                    )
                    await asyncio.sleep(delay)
                else:
                    # Final attempt failed
                    logger.error(
                        f"Event {event.decision_id} send failed after {self.max_retries} attempts: {e}"
                    )
    
    async def _send_event(self, event: DecisionEvent):
        """
        Send event to backend (single attempt).
        
        Args:
            event: DecisionEvent to send
        
        Raises:
            Exception: If send fails
        """
        config = get_config()
        
        # Validate configuration
        config.validate()
        
        # Serialize event
        payload = event.model_dump_json()
        
        # Sign payload
        signer = create_signer(config.api_key)
        signature = signer.sign(payload)
        
        # Prepare headers
        headers = {
            "Content-Type": "application/json",
            "X-Regulayer-Signature": signature,
            "X-Regulayer-Algorithm": signer.get_algorithm(),
            "X-Regulayer-SDK-Version": event.runtime_fingerprint.sdk_version,
        }
        
        # Send to backend (TLS-only)
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                config.endpoint,
                content=payload,
                headers=headers
            )
            response.raise_for_status()
    
    def shutdown(self):
        """
        Gracefully shutdown the client.
        
        Stops the drain task and processes remaining events.
        
        Note:
            This is called automatically on process exit via atexit.
        """
        if self._shutdown:
            return
        
        config = get_config()
        logger = config.get_logger()
        
        logger.info("Shutting down backend client...")
        
        self._shutdown = True
        
        # Wait for drain task to complete (if it exists)
        if self._drain_task and not self._drain_task.done():
            try:
                loop = asyncio.get_event_loop()
                loop.run_until_complete(
                    asyncio.wait_for(self._drain_task, timeout=5.0)
                )
            except Exception as e:
                logger.warning(f"Error during shutdown: {e}")
        
        logger.info("Backend client shutdown complete")


# Global client instance (lazy initialization)
_client: Optional[BackendClient] = None


def get_client() -> BackendClient:
    """
    Get or create the global backend client.
    
    Returns:
        BackendClient instance
    """
    global _client
    if _client is None:
        _client = BackendClient()
    return _client
