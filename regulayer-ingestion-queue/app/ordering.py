"""
Regulayer Ingestion Queue - Ordering

Ensure strict per-project ordering.

GUARANTEES:
- Events for same project are processed in order
- Different projects can be processed in parallel
- No reordering within a project
"""

from typing import Dict, Set, Optional
from uuid import UUID
from threading import Lock
from dataclasses import dataclass
import asyncio


@dataclass
class ProjectLock:
    """Lock for a project's processing."""
    project_id: UUID
    locked: bool = False
    current_sequence: int = 0


class OrderingManager:
    """
    Manages per-project ordering guarantees.
    
    Ensures:
    - Only one event per project processes at a time
    - Events are processed in sequence order
    - Different projects can process in parallel
    """
    
    def __init__(self):
        self._locks: Dict[str, asyncio.Lock] = {}
        self._sequences: Dict[str, int] = {}
        self._global_lock = asyncio.Lock()
    
    async def acquire_project_lock(self, project_id: UUID) -> bool:
        """
        Acquire processing lock for a project.
        
        Returns True if lock acquired, False if already locked.
        """
        key = str(project_id)
        
        async with self._global_lock:
            if key not in self._locks:
                self._locks[key] = asyncio.Lock()
        
        # Non-blocking acquire
        lock = self._locks[key]
        try:
            return lock.locked() == False and await asyncio.wait_for(
                lock.acquire(),
                timeout=0.001  # Near-instant timeout
            )
        except asyncio.TimeoutError:
            return False
    
    async def release_project_lock(self, project_id: UUID) -> None:
        """Release processing lock for a project."""
        key = str(project_id)
        
        if key in self._locks and self._locks[key].locked():
            self._locks[key].release()
    
    async def wait_for_project_lock(self, project_id: UUID) -> None:
        """Wait to acquire processing lock for a project."""
        key = str(project_id)
        
        async with self._global_lock:
            if key not in self._locks:
                self._locks[key] = asyncio.Lock()
        
        await self._locks[key].acquire()
    
    def record_sequence(self, project_id: UUID, sequence: int) -> None:
        """Record that a sequence was processed."""
        key = str(project_id)
        
        if key not in self._sequences:
            self._sequences[key] = 0
        
        self._sequences[key] = max(self._sequences[key], sequence)
    
    def get_last_sequence(self, project_id: UUID) -> int:
        """Get last processed sequence for a project."""
        return self._sequences.get(str(project_id), 0)
    
    def is_in_order(self, project_id: UUID, sequence: int) -> bool:
        """Check if sequence is the expected next one."""
        last = self.get_last_sequence(project_id)
        return sequence == last + 1 or sequence == 0


# ============================================================
# Global Instance
# ============================================================

_ordering_manager: Optional[OrderingManager] = None


def get_ordering_manager() -> OrderingManager:
    """Get or create the global ordering manager."""
    global _ordering_manager
    
    if _ordering_manager is None:
        _ordering_manager = OrderingManager()
    
    return _ordering_manager
