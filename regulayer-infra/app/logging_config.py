"""
Regulayer Infrastructure - Logging Configuration

Secure logging without leaking trust data.

RULES:
- No payloads in logs
- No hashes in logs
- No secrets in logs
"""

import logging
import sys
from typing import Optional

from .environments import get_environment_config


# ============================================================
# Sensitive Data Filter
# ============================================================

class SensitiveDataFilter(logging.Filter):
    """Filter sensitive data from logs."""
    
    SENSITIVE_PATTERNS = [
        "password",
        "secret",
        "key",
        "token",
        "hash",
        "signature",
        "payload",
    ]
    
    def filter(self, record: logging.LogRecord) -> bool:
        # Check message for sensitive patterns
        message = record.getMessage().lower()
        
        for pattern in self.SENSITIVE_PATTERNS:
            if pattern in message:
                # Redact the message
                record.msg = f"[REDACTED - contained {pattern}]"
                record.args = ()
        
        return True


# ============================================================
# Logging Setup
# ============================================================

def setup_logging(
    service_name: str = "regulayer",
    log_level: Optional[str] = None
) -> logging.Logger:
    """
    Set up secure logging for a service.
    
    Automatically applies environment-appropriate log level
    and sensitive data filtering.
    """
    config = get_environment_config()
    level = log_level or config.log_level
    
    # Create logger
    logger = logging.getLogger(service_name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Clear existing handlers
    logger.handlers = []
    
    # Console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, level.upper()))
    
    # Format
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    
    # Add sensitive data filter
    handler.addFilter(SensitiveDataFilter())
    
    logger.addHandler(handler)
    
    return logger


def get_logger(name: str = "regulayer") -> logging.Logger:
    """Get a configured logger."""
    return logging.getLogger(name)


# ============================================================
# Structured Logging Helpers
# ============================================================

def log_request(
    logger: logging.Logger,
    method: str,
    path: str,
    status: int,
    latency_ms: float,
    org_id: Optional[str] = None,
    project_id: Optional[str] = None
) -> None:
    """Log a request in structured format (safe data only)."""
    logger.info(
        f"request | {method} {path} | status={status} | latency={latency_ms:.2f}ms | "
        f"org={org_id[:8] if org_id else 'none'}... | project={project_id[:8] if project_id else 'none'}..."
    )


def log_event(
    logger: logging.Logger,
    event: str,
    **kwargs
) -> None:
    """Log an event with structured data (filtered for safety)."""
    # Filter out sensitive fields
    safe_kwargs = {
        k: v for k, v in kwargs.items()
        if not any(p in k.lower() for p in SensitiveDataFilter.SENSITIVE_PATTERNS)
    }
    
    parts = [f"{k}={v}" for k, v in safe_kwargs.items()]
    logger.info(f"event={event} | " + " | ".join(parts))
