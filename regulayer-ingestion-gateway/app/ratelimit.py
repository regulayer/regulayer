"""
Regulayer Ingestion Gateway - Rate Limiting

Distributed token bucket rate limiter using Redis and Lua.
"""

import time
from typing import Optional
from dataclasses import dataclass
import redis.asyncio as redis

from .config import settings
from .errors import RateLimitError


# Lua script for atomic token bucket
# Keys: [rate_limit_key]
# Args: [capacity, refill_rate, now_timestamp, requested_tokens]
# Returns: [allowed (1/0), retry_after (seconds)]
TOKEN_BUCKET_SCRIPT = """
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

-- Get current state
local last_refill = tonumber(redis.call('HGET', key, 'last_refill') or now)
local tokens = tonumber(redis.call('HGET', key, 'tokens') or capacity)

-- Refill tokens
local elapsed = now - last_refill
local new_tokens = math.min(capacity, tokens + (elapsed * refill_rate))

-- Consume tokens
local allowed = 0
local retry_after = 0

if new_tokens >= requested then
    allowed = 1
    new_tokens = new_tokens - requested
    -- Update state
    redis.call('HSET', key, 'last_refill', now, 'tokens', new_tokens)
    -- Expire key after idle time (e.g., time to full refill + buffer)
    redis.call('EXPIRE', key, math.ceil(capacity / refill_rate) + 60)
else
    allowed = 0
    retry_after = (requested - new_tokens) / refill_rate
    -- Update last_refill to avoid calculating excessive elapsed time next run 
    -- (Strictly, standard alg doesn't update on reject, but we expire anyway)
end

return {allowed, retry_after}
"""


class RateLimiter:
    """
    Distributed rate limiter using Redis.
    """
    
    def __init__(
        self,
        requests_per_minute: int = None,
        burst_limit: int = None
    ):
        self.requests_per_minute = requests_per_minute or settings.default_rate_limit
        self.burst_limit = burst_limit or settings.burst_limit
        self.refill_rate = self.requests_per_minute / 60.0
        self.capacity = self.requests_per_minute + self.burst_limit
        
        self.redis = redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
        self.script = self.redis.register_script(TOKEN_BUCKET_SCRIPT)
    
    async def check(self, key: str, cost: int = 1) -> None:
        """
        Check if request is allowed.
        
        Raises RateLimitError if limit exceeded.
        """
        redis_key = f"{settings.redis_stream_prefix}:ratelimit:{key}"
        now = time.time()
        
        # Atomically check and consume
        result = await self.script(
            keys=[redis_key],
            args=[self.capacity, self.refill_rate, now, cost]
        )
        
        allowed, retry_after = result
        
        if not allowed:
             raise RateLimitError(
                f"Rate limit exceeded. Retry after {float(retry_after):.1f}s"
            )


# ============================================================
# Global Instance
# ============================================================

_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    """Get or create the global rate limiter."""
    global _rate_limiter
    
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    
    return _rate_limiter


async def check_rate_limit(api_key_id: str) -> None:
    """Check rate limit for an API key."""
    await get_rate_limiter().check(api_key_id)
