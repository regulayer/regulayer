"""
Regulayer SDK - Client
"""

import os
from typing import Optional
from dataclasses import dataclass
import httpx


@dataclass
class RegulayerConfig:
    """SDK configuration."""
    api_key: str
    endpoint: str = "https://api.regulayer.io/v1/ingest/decision"
    timeout: int = 30


_client: Optional["RegulayerClient"] = None
_config: Optional[RegulayerConfig] = None


def configure(
    api_key: Optional[str] = None,
    endpoint: str = "https://api.regulayer.io/v1/ingest/decision",
    timeout: int = 30
) -> None:
    """
    Configure the Regulayer SDK.
    
    Args:
        api_key: Your Regulayer API key (starts with rl_)
        endpoint: Ingestion endpoint URL
        timeout: Request timeout in seconds
    
    Example:
        configure(api_key="rl_live_xxx")
    """
    global _config, _client
    
    key = api_key or os.environ.get("REGULAYER_API_KEY")
    if not key:
        raise ValueError(
            "API key required. Pass api_key or set REGULAYER_API_KEY env var."
        )
    
    _config = RegulayerConfig(
        api_key=key,
        endpoint=endpoint,
        timeout=timeout
    )
    _client = None  # Reset client


def get_client() -> "RegulayerClient":
    """Get the configured client instance."""
    global _client
    
    if _config is None:
        raise RuntimeError("SDK not configured. Call configure() first.")
    
    if _client is None:
        _client = RegulayerClient(_config)
    
    return _client


class RegulayerClient:
    """
    Regulayer API client.
    
    Sends decision records to the ingestion gateway.
    
    IMPORTANT: This client does NOT:
    - Hash payloads
    - Sign anything
    - Verify responses cryptographically
    
    All trust operations happen server-side.
    """
    
    def __init__(self, config: RegulayerConfig):
        self.config = config
        self._http = httpx.Client(
            timeout=config.timeout,
            headers={
                "X-Regulayer-Api-Key": config.api_key,
                "Content-Type": "application/json",
            }
        )
    
    def record_decision(
        self,
        system: str,
        decision_type: str,
        input_data: dict,
        output_data: dict,
        metadata: Optional[dict] = None,
        risk_level: str = "standard",
        decision_id: Optional[str] = None
    ) -> dict:
        """
        Record a decision.
        
        Args:
            system: Name of the AI system
            decision_type: Type of decision
            input_data: Input to the decision
            output_data: Output/result of the decision
            metadata: Optional additional metadata
            risk_level: Risk level (standard, elevated, high)
            decision_id: Canonical ID (UUID4) for idempotency
        
        Returns:
            Response with decision_id and status
        """
        import uuid
        from datetime import datetime, timezone
        
        # Canonical Identity Logic
        if not decision_id:
            decision_id = str(uuid.uuid4())
            
        timestamp_now = datetime.now(timezone.utc)
        payload = {
            "decision_id": decision_id,
            "system_name": system,
            "decision_type": decision_type,
            "risk_level": risk_level,
            "event_version": "2.0",
            "event_state": "completed",
            "model_name": "unknown", 
            "model_version": "unknown",
            "start_timestamp": timestamp_now.isoformat(),
            "end_timestamp": timestamp_now.isoformat(),
            "execution_duration_ms": 0.0,
            "runtime_fingerprint": {
                "python_version": "3.x",
                "os": "unknown",
                "sdk_version": "2.0.0",
                "sdk_instance_id": str(uuid.uuid4())
            },
            "input": input_data,
            "output": output_data,
            "metadata": metadata or {},
        }
        
        # Merge headers for this request
        headers = self._http.headers.copy()
        headers["X-Request-ID"] = decision_id
        headers["X-Regulayer-Timestamp"] = datetime.now(timezone.utc).isoformat()
        
        response = self._http.post(self.config.endpoint, json=payload, headers=headers)
        
        if response.status_code == 401:
            from .errors import AuthenticationError
            raise AuthenticationError("Invalid API key")
        
        if response.status_code == 429:
            from .errors import RateLimitError
            raise RateLimitError("Rate limit exceeded")
        
        # 202 Accepted (async) or 201 Created (sync) are both success
        response.raise_for_status()
        return response.json()
    
    def close(self) -> None:
        """Close the client."""
        self._http.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.close()
