"""
Regulayer Ingestion Queue - Retry Logic

Bounded retry with exponential backoff.

RULES:
- Retry only on 5xx from recorder or network timeouts
- Max retries configurable (default 5)
- After max retries → Dead Letter Queue
"""

import asyncio
from typing import Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from .config import settings


class RetryDecision(str, Enum):
    """What to do with a failed message."""
    RETRY = "retry"
    DEAD_LETTER = "dead_letter"
    SUCCESS = "success"


@dataclass
class RetryResult:
    """Result of a retry decision."""
    decision: RetryDecision
    delay_seconds: float = 0.0
    reason: str = ""


def should_retry(
    status_code: Optional[int],
    exception: Optional[Exception],
    retry_count: int
) -> RetryResult:
    """
    Determine if a message should be retried.
    
    Args:
        status_code: HTTP status code (if any)
        exception: Exception (if any)
        retry_count: Current retry count
    
    Returns:
        RetryResult with decision and delay
    """
    # Max retries exceeded
    if retry_count >= settings.max_retries:
        return RetryResult(
            decision=RetryDecision.DEAD_LETTER,
            reason=f"Max retries ({settings.max_retries}) exceeded"
        )
    
    # Network/timeout error
    if exception is not None:
        delay = calculate_backoff(retry_count)
        return RetryResult(
            decision=RetryDecision.RETRY,
            delay_seconds=delay,
            reason=f"Network error: {type(exception).__name__}"
        )
    
    
    # 5xx server error
    if status_code is not None and 500 <= status_code < 600:
        delay = calculate_backoff(retry_count)
        return RetryResult(
            decision=RetryDecision.RETRY,
            delay_seconds=delay,
            reason=f"Server error: {status_code}"
        )
    
    # 409 Conflict - Ordering Violation or Duplicate
    if status_code == 409:
        return RetryResult(
            decision=RetryDecision.DEAD_LETTER,
            reason="Ordering Violation or Duplicate (409)"
        )

    # 4xx client error - do not retry
    if status_code is not None and 400 <= status_code < 500:
        return RetryResult(
            decision=RetryDecision.DEAD_LETTER,
            reason=f"Client error: {status_code} - not retryable"
        )
    
    # 2xx success
    if status_code is not None and 200 <= status_code < 300:
        return RetryResult(
            decision=RetryDecision.SUCCESS,
            reason="Success"
        )
    
    # Unknown - retry with backoff
    delay = calculate_backoff(retry_count)
    return RetryResult(
        decision=RetryDecision.RETRY,
        delay_seconds=delay,
        reason="Unknown status - retrying"
    )


def calculate_backoff(retry_count: int) -> float:
    """
    Calculate exponential backoff delay.
    
    delay = base_delay * (multiplier ^ retry_count)
    """
    base = settings.retry_delay_seconds
    multiplier = settings.retry_backoff_multiplier
    
    delay = base * (multiplier ** retry_count)
    
    # Cap at 60 seconds
    return min(delay, 60.0)


async def wait_for_retry(retry_count: int) -> None:
    """Wait for appropriate backoff period."""
    delay = calculate_backoff(retry_count)
    await asyncio.sleep(delay)
