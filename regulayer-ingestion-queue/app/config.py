"""
Regulayer Ingestion Queue - Configuration
"""

from pydantic_settings import BaseSettings
from enum import Enum


class QueueBackend(str, Enum):
    """Supported queue backends."""
    REDIS = "redis"
    MEMORY = "memory"  # For testing only


class Settings(BaseSettings):
    """Queue configuration."""
    
    # Backend
    queue_backend: QueueBackend = QueueBackend.MEMORY
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    redis_stream_prefix: str = "regulayer:ingest"
    
    # Consumer
    consumer_group: str = "regulayer-recorder"
    consumer_name: str = "worker-1"
    
    # Recorder
    recorder_url: str = "http://localhost:8000"
    
    # Retry
    max_retries: int = 5
    retry_delay_seconds: int = 1
    retry_backoff_multiplier: float = 2.0
    
    # Timeouts
    forward_timeout_seconds: int = 30
    
    # Batch
    batch_size: int = 10
    batch_timeout_ms: int = 100
    
    class Config:
        env_prefix = "QUEUE_"


settings = Settings()
