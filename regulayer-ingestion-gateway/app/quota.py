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
    """Daily usage snapshot."""
    date: str
    count: int
    limit: int
    remaining: int
    exceeded: bool


class QuotaEnforcer:
    """
    Enforce per-project usage quotas via Redis.
    """
    
    def __init__(self, daily_limit: int = None):
        self.daily_limit = daily_limit or settings.default_daily_quota
        import redis.asyncio as redis
        self.redis = redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
    
    def _get_key(self, project_id: str) -> str:
        """Get Redis key for project monthly quota."""
        current_month = date.today().strftime("%Y-%m")
        return f"{settings.redis_stream_prefix}:quota:{project_id}:{current_month}"
    
    async def check(self, project_id: str, tier_limit: Optional[int] = None) -> None:
        """
        Check if quota allows request.
        
        Raises QuotaExceededError if limit exceeded.
        """
        limit = tier_limit if tier_limit is not None else self.daily_limit
        key = self._get_key(project_id)
        current = await self.redis.get(key)
        
        if current and int(current) >= limit:
            raise QuotaExceededError(
                f"Monthly quota exceeded. Limit: {limit}. Resets at midnight UTC on the 1st of next month."
            )
    
    async def consume(self, project_id: str, tier_limit: Optional[int] = None) -> int:
        """
        Consume one from quota. Returns remaining.
        
        Raises QuotaExceededError if limit exceeded.
        """
        limit = tier_limit if tier_limit is not None else self.daily_limit
        key = self._get_key(project_id)
        
        # Atomic Increment
        new_val = await self.redis.incr(key)
        
        # Set expiry on first write (32 days in seconds to cover any month length safely)
        if new_val == 1:
            await self.redis.expire(key, 2764800)
            
        # Strict Enforcement: Check AFTER atomic increment
        if new_val > limit:
             raise QuotaExceededError(
                f"Monthly quota exceeded. Limit: {limit}."
            )
            
        return max(0, limit - new_val)
    
    async def get_usage(self, project_id: str) -> dict:
        """Get current usage for a project."""
        key = self._get_key(project_id)
        val = await self.redis.get(key)
        count = int(val) if val else 0
        
        return {
            "project_id": project_id,
            "month": date.today().strftime("%Y-%m"),
            "used": count,
            "limit": self.daily_limit,
            "remaining": max(0, self.daily_limit - count),
            "exceeded": count >= self.daily_limit
        }


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


async def check_quota(project_id: str, tier_limit: Optional[int] = None) -> None:
    """Check quota for a project."""
    import sys
    limit = tier_limit if tier_limit is not None else sys.maxsize # Default to unlimited if none configured
    await get_quota_enforcer().check(project_id, tier_limit=limit)


async def consume_quota(project_id: str, tier_limit: Optional[int] = None) -> int:
    """Consume quota and return remaining."""
    import sys
    limit = tier_limit if tier_limit is not None else sys.maxsize
    return await get_quota_enforcer().consume(project_id, tier_limit=limit)
