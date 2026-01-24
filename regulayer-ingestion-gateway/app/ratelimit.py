"""
Regulayer Ingestion Gateway - Rate Limiting

Token bucket rate limiter for per-key limits.
"""

import time
from typing import Dict, Optional
from dataclasses import dataclass, field
from threading import Lock

from .config import settings
from .errors import RateLimitError


@dataclass
class TokenBucket:
    """Token bucket for rate limiting."""
    capacity: int             # Max tokens
    refill_rate: float        # Tokens per second
    tokens: float = field(default=0.0, init=False)
    last_refill: float = field(default_factory=time.time, init=False)
    
    def __post_init__(self):
        self.tokens = float(self.capacity)
    
    def consume(self, tokens: int = 1) -> bool:
        """Try to consume tokens. Returns True if successful."""
        self._refill()
        
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False
    
    def _refill(self) -> None:
        """Refill tokens based on time elapsed."""
        now = time.time()
        elapsed = now - self.last_refill
        
        # Add tokens based on elapsed time
        self.tokens = min(
            self.capacity,
            self.tokens + (elapsed * self.refill_rate)
        )
        
        self.last_refill = now
    
    def time_until_available(self, tokens: int = 1) -> float:
        """Get seconds until tokens are available."""
        self._refill()
        
        if self.tokens >= tokens:
            return 0.0
        
        needed = tokens - self.tokens
        return needed / self.refill_rate


class RateLimiter:
    """
    Rate limiter using token buckets.
    
    Maintains per-key buckets with configurable limits.
    """
    
    def __init__(
        self,
        requests_per_minute: int = None,
        burst_limit: int = None
    ):
        self.requests_per_minute = requests_per_minute or settings.default_rate_limit
        self.burst_limit = burst_limit or settings.burst_limit
        self.refill_rate = self.requests_per_minute / 60.0
        
        self._buckets: Dict[str, TokenBucket] = {}
        self._lock = Lock()
    
    def _get_bucket(self, key: str) -> TokenBucket:
        """Get or create bucket for key."""
        with self._lock:
            if key not in self._buckets:
                self._buckets[key] = TokenBucket(
                    capacity=self.requests_per_minute + self.burst_limit,
                    refill_rate=self.refill_rate
                )
            return self._buckets[key]
    
    def check(self, key: str) -> None:
        """
        Check if request is allowed.
        
        Raises RateLimitError if limit exceeded.
        """
        bucket = self._get_bucket(key)
        
        if not bucket.consume(1):
            retry_after = bucket.time_until_available(1)
            raise RateLimitError(
                f"Rate limit exceeded. Retry after {retry_after:.1f}s"
            )
    
    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed (without consuming)."""
        bucket = self._get_bucket(key)
        return bucket.tokens >= 1
    
    def cleanup_old_buckets(self, max_age_seconds: int = 3600) -> int:
        """Remove buckets that haven't been used recently."""
        now = time.time()
        removed = 0
        
        with self._lock:
            keys_to_remove = [
                key for key, bucket in self._buckets.items()
                if now - bucket.last_refill > max_age_seconds
            ]
            
            for key in keys_to_remove:
                del self._buckets[key]
                removed += 1
        
        return removed


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


def check_rate_limit(api_key_id: str) -> None:
    """Check rate limit for an API key."""
    get_rate_limiter().check(api_key_id)
