"""
Regulayer Ingestion Gateway - Quota Enforcement

Per-project usage quotas for business-level limits.
"""

from datetime import datetime, timezone, date
from typing import Dict, Optional
from dataclasses import dataclass, field
from threading import Lock
from uuid import UUID

from .config import settings
from .errors import QuotaExceededError


@dataclass
class UsageCounter:
    """Daily usage counter for a project."""
    date: date
    count: int = 0
    limit: int = field(default_factory=lambda: settings.default_daily_quota)
    
    @property
    def remaining(self) -> int:
        return max(0, self.limit - self.count)
    
    @property
    def exceeded(self) -> bool:
        return self.count >= self.limit


class QuotaEnforcer:
    """
    Enforce per-project usage quotas.
    
    Tracks daily decision counts and blocks when exceeded.
    """
    
    def __init__(self, daily_limit: int = None):
        self.daily_limit = daily_limit or settings.default_daily_quota
        self._counters: Dict[str, UsageCounter] = {}
        self._lock = Lock()
    
    def _get_counter(self, project_id: str) -> UsageCounter:
        """Get or create counter for project."""
        today = date.today()
        key = f"{project_id}:{today.isoformat()}"
        
        with self._lock:
            if key not in self._counters:
                self._counters[key] = UsageCounter(
                    date=today,
                    limit=self.daily_limit
                )
            return self._counters[key]
    
    def check(self, project_id: str) -> None:
        """
        Check if quota allows request.
        
        Raises QuotaExceededError if limit exceeded.
        """
        counter = self._get_counter(project_id)
        
        if counter.exceeded:
            raise QuotaExceededError(
                f"Daily quota exceeded. Limit: {counter.limit}. "
                f"Resets at midnight UTC."
            )
    
    def consume(self, project_id: str) -> int:
        """
        Consume one from quota. Returns remaining.
        
        Raises QuotaExceededError if limit exceeded.
        """
        counter = self._get_counter(project_id)
        
        if counter.exceeded:
            raise QuotaExceededError(
                f"Daily quota exceeded. Limit: {counter.limit}."
            )
        
        with self._lock:
            counter.count += 1
        
        return counter.remaining
    
    def get_usage(self, project_id: str) -> dict:
        """Get current usage for a project."""
        counter = self._get_counter(project_id)
        
        return {
            "project_id": project_id,
            "date": counter.date.isoformat(),
            "used": counter.count,
            "limit": counter.limit,
            "remaining": counter.remaining,
            "exceeded": counter.exceeded
        }
    
    def cleanup_old_counters(self) -> int:
        """Remove counters from previous days."""
        today = date.today()
        removed = 0
        
        with self._lock:
            keys_to_remove = [
                key for key, counter in self._counters.items()
                if counter.date < today
            ]
            
            for key in keys_to_remove:
                del self._counters[key]
                removed += 1
        
        return removed
    
    def set_limit(self, project_id: str, limit: int) -> None:
        """Set custom limit for a project."""
        counter = self._get_counter(project_id)
        counter.limit = limit


# ============================================================
# Global Instance
# ============================================================

_quota_enforcer: Optional[QuotaEnforcer] = None


def get_quota_enforcer() -> QuotaEnforcer:
    """Get or create the global quota enforcer."""
    global _quota_enforcer
    
    if _quota_enforcer is None:
        _quota_enforcer = QuotaEnforcer()
    
    return _quota_enforcer


def check_quota(project_id: str) -> None:
    """Check quota for a project."""
    get_quota_enforcer().check(project_id)


def consume_quota(project_id: str) -> int:
    """Consume quota and return remaining."""
    return get_quota_enforcer().consume(project_id)
