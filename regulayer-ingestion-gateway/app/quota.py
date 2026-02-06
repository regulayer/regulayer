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
        """Get Redis key for project daily quota."""
        today = date.today().isoformat()
        return f"{settings.redis_stream_prefix}:quota:{project_id}:{today}"
    
    async def check(self, project_id: str) -> None:
        """
        Check if quota allows request.
        
        Raises QuotaExceededError if limit exceeded.
        """
        key = self._get_key(project_id)
        current = await self.redis.get(key)
        
        if current and int(current) >= self.daily_limit:
            raise QuotaExceededError(
                f"Daily quota exceeded. Limit: {self.daily_limit}. Resets at midnight UTC."
            )
    
    async def consume(self, project_id: str) -> int:
        """
        Consume one from quota. Returns remaining.
        
        Raises QuotaExceededError if limit exceeded.
        """
        key = self._get_key(project_id)
        
        # Check first to avoid incrementing if already full
        # Race condition possible but acceptable for soft quotas
        # Strict enforcement would use Lua script
        current = await self.redis.get(key)
        if current and int(current) >= self.daily_limit:
             raise QuotaExceededError(
                f"Daily quota exceeded. Limit: {self.daily_limit}."
            )
            
        # Increment
        new_val = await self.redis.incr(key)
        
        # Set expiry on first write (24h + 1h buffer)
        if new_val == 1:
            await self.redis.expire(key, 90000)
            
        # Double check after increment (strictness)
        if new_val > self.daily_limit:
             # Looked okay before, but now exceeded.
             # We let this one slide? Or block?
             # Standard pattern: Allow if it WAS allowable, or strictly block?
             # Let's strictly block and return error, client receives 429.
             # Note: This "burns" a quota unit for a failed request, which is fine for DoS protection.
             raise QuotaExceededError(
                f"Daily quota exceeded. Limit: {self.daily_limit}."
            )
            
        return max(0, self.daily_limit - new_val)
    
    async def get_usage(self, project_id: str) -> dict:
        """Get current usage for a project."""
        key = self._get_key(project_id)
        val = await self.redis.get(key)
        count = int(val) if val else 0
        
        return {
            "project_id": project_id,
            "date": date.today().isoformat(),
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


async def check_quota(project_id: str) -> None:
    """Check quota for a project."""
    await get_quota_enforcer().check(project_id)


async def consume_quota(project_id: str) -> int:
    """Consume quota and return remaining."""
    return await get_quota_enforcer().consume(project_id)
