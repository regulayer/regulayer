"""
Regulayer SDK Retry Logic
"""
import time
import random
import logging
from typing import Callable, TypeVar, Any
from .errors import RateLimitError, ServiceUnavailableError, NetworkError

T = TypeVar("T")

logger = logging.getLogger(__name__)

def exponential_backoff(
    func: Callable[[], T],
    max_retries: int = 3,
    base_delay: float = 0.5,
    max_delay: float = 2.0,
    jitter: bool = True
) -> T:
    """
    Execute a function with exponential backoff retry logic.
    
    Retries on:
    - RateLimitError (429)
    - ServiceUnavailableError (5xx)
    - NetworkError
    
    Does NOT retry on:
    - InvalidApiKeyError (401)
    - ForbiddenError (403)
    - DuplicateDecisionError (409)
    - ValidationError (400)
    """
    retries = 0
    while True:
        try:
            return func()
        except (RateLimitError, ServiceUnavailableError, NetworkError) as e:
            if retries >= max_retries:
                logger.error(f"Max retries ({max_retries}) exceeded for {func.__name__}. Last error: {str(e)}")
                raise
            
            # Calculate delay
            delay = min(base_delay * (2 ** retries), max_delay)
            if jitter:
                delay += random.uniform(0, 0.1 * delay)
            
            logger.warning(
                f"Request failed with {type(e).__name__}: {str(e)}. "
                f"Retrying in {delay:.2f}s (Attempt {retries + 1}/{max_retries})"
            )
            
            time.sleep(delay)
            retries += 1
