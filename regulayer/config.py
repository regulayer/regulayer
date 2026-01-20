"""
Regulayer SDK Configuration Module

Centralized configuration management with validation.
Supports environment variables and thread-safe updates.
"""

import os
import logging
from typing import Optional
from threading import Lock


# Default configuration values
DEFAULT_ENDPOINT = "https://api.regulayer.io/v1/events"
DEFAULT_LOG_LEVEL = "WARNING"


class Config:
    """
    Singleton configuration for Regulayer SDK.
    
    Thread-safe configuration management with validation.
    Supports environment variables:
    - REGULAYER_API_KEY: API authentication key
    - REGULAYER_ENDPOINT: Backend endpoint URL
    - REGULAYER_LOG_LEVEL: Logging verbosity (default: WARNING)
    """
    
    _instance: Optional['Config'] = None
    _lock = Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        with self._lock:
            if self._initialized:
                return
                
            self.api_key: Optional[str] = os.getenv("REGULAYER_API_KEY")
            self.endpoint: str = os.getenv("REGULAYER_ENDPOINT", DEFAULT_ENDPOINT)
            self.log_level: str = os.getenv("REGULAYER_LOG_LEVEL", DEFAULT_LOG_LEVEL)
            
            # Validate TLS enforcement
            if self.endpoint and not self.endpoint.startswith("https://"):
                raise ValueError("REGULAYER_ENDPOINT must use HTTPS (TLS required)")
            
            # Set up logging
            self._setup_logging()
            
            self._initialized = True
    
    def _setup_logging(self):
        """Configure SDK logging level."""
        logger = logging.getLogger("regulayer")
        logger.setLevel(getattr(logging, self.log_level.upper(), logging.WARNING))
        
        # Add handler if none exists
        if not logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(
                logging.Formatter('[%(asctime)s] %(name)s - %(levelname)s - %(message)s')
            )
            logger.addHandler(handler)
    
    def configure(
        self,
        api_key: Optional[str] = None,
        endpoint: Optional[str] = None,
        log_level: Optional[str] = None
    ):
        """
        Update configuration values.
        
        Args:
            api_key: API authentication key
            endpoint: Backend endpoint URL (must be HTTPS)
            log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        
        Raises:
            ValueError: If endpoint does not use HTTPS
        
        Note:
            API keys authenticate the SDK instance, not the end user.
            No user identity is assumed at SDK level.
        """
        with self._lock:
            if api_key is not None:
                self.api_key = api_key
            
            if endpoint is not None:
                if not endpoint.startswith("https://"):
                    raise ValueError("endpoint must use HTTPS (TLS required)")
                self.endpoint = endpoint
            
            if log_level is not None:
                self.log_level = log_level
                self._setup_logging()
    
    def validate(self):
        """
        Validate that required configuration is present.
        
        Raises:
            ValueError: If API key is missing
        """
        if not self.api_key:
            raise ValueError(
                "REGULAYER_API_KEY is required. Set via environment variable or configure() method."
            )
    
    def get_logger(self) -> logging.Logger:
        """Get the SDK logger."""
        return logging.getLogger("regulayer")


# Global configuration instance
_config = Config()


def configure(
    api_key: Optional[str] = None,
    endpoint: Optional[str] = None,
    log_level: Optional[str] = None
):
    """
    Configure the Regulayer SDK.
    
    Args:
        api_key: API authentication key
        endpoint: Backend endpoint URL (must be HTTPS)
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Example:
        >>> from regulayer import configure
        >>> configure(
        ...     api_key="your-api-key",
        ...     endpoint="https://api.regulayer.io/v1/events",
        ...     log_level="INFO"
        ... )
    
    Note:
        API keys authenticate the SDK instance, not the end user.
        No user identity is assumed at SDK level.
    """
    _config.configure(api_key=api_key, endpoint=endpoint, log_level=log_level)


def get_config() -> Config:
    """Get the global configuration instance."""
    return _config
