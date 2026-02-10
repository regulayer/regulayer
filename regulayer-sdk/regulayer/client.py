"""
Regulayer SDK - Client
"""

import os
import logging
from typing import Optional
import httpx

from .config import RegulayerConfig
from .types import DecisionPayload, RuntimeFingerprint
from .errors import (
    AuthenticationError,
    RateLimitError,
    DuplicateDecisionError,
    OrgFrozenError,
    ServiceUnavailableError,
    InvalidResponseError,
    DemoKeyError,
    ProdKeyError,
    NetworkError,
    ValidationError
)
from .retry import exponential_backoff
from .validation import validate_payload_size, validate_circular_refs
from .utils import get_current_timestamp, get_runtime_fingerprint, generate_decision_id

logger = logging.getLogger(__name__)

_client: Optional["RegulayerClient"] = None
_config: Optional[RegulayerConfig] = None


def configure(
    api_key: Optional[str] = None,
    endpoint: str = "https://api.regulayer.io/v1/ingest/decision",
    timeout: int = 30,
    demo: bool = False
) -> None:
    """
    Configure the Regulayer SDK.
    
    Args:
        api_key: Your Regulayer API key (starts with rl_)
        endpoint: Ingestion endpoint URL
        timeout: Request timeout in seconds
        demo: Set to True if using a demo API key (rl_demo_*)
    """
    global _config, _client
    
    key = api_key or os.environ.get("REGULAYER_API_KEY")
    if not key:
        raise ValueError(
            "API key required. Pass api_key or set REGULAYER_API_KEY env var."
        )
    
    # Demo Credential Wall
    is_demo_key = key.startswith("rl_demo_")
    
    if is_demo_key and not demo:
        raise DemoKeyError()
    
    if not is_demo_key and demo:
        raise ProdKeyError()
    
    # Check if reconfiguring with different values is attempted
    if _config is not None:
        if _config.api_key != key or _config.endpoint != endpoint:
             logger.warning("Re-configuring SDK. Previous configuration overwritten.")

    _config = RegulayerConfig(
        api_key=key,
        endpoint=endpoint,
        timeout_seconds=float(timeout)
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
    """
    
    def __init__(self, config: RegulayerConfig):
        self.config = config
        self._http = httpx.Client(
            timeout=config.timeout_seconds,
            headers={
                "X-Regulayer-Api-Key": config.api_key,
                "Content-Type": "application/json",
                "X-Regulayer-SDK-Version": "2.0.0"
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
        Record a decision with strict semantics and retry logic.
        """
        # 1. Canonical Identity
        if not decision_id:
            decision_id = generate_decision_id()
            
        timestamp_now = get_current_timestamp()
        
        # 2. Validation
        validate_circular_refs(input_data)
        validate_circular_refs(output_data)
        
        payload_dict = {
            "decision_id": decision_id,
            "system_name": system,
            "decision_type": decision_type,
            "risk_level": risk_level,
            "event_version": "2.0",
            "event_state": "completed",
            "model_name": "unknown", 
            "model_version": "unknown",
            "start_timestamp": timestamp_now,
            "end_timestamp": timestamp_now,
            "execution_duration_ms": 0.0,
            "runtime_fingerprint": get_runtime_fingerprint(),
            "input": input_data,
            "output": output_data,
            "metadata": metadata or {},
        }
        
        # Pydantic Validation & Serialization
        try:
            model = DecisionPayload(**payload_dict)
            final_payload = model.model_dump(mode='json')
        except Exception as e:
            raise ValidationError("payload", str(e), decision_id=decision_id)
            
        validate_payload_size(final_payload)

        # 3. Execution with Retry
        def _execute_request():
            headers = self._http.headers.copy()
            headers["X-Request-ID"] = decision_id
            headers["X-Regulayer-Timestamp"] = get_current_timestamp()
            
            try:
                response = self._http.post(
                    self.config.endpoint, 
                    json=final_payload, 
                    headers=headers
                )
            except httpx.NetworkError as e:
                raise NetworkError(str(e), decision_id=decision_id)
            
            # Map Status Codes
            if response.status_code == 202:
                logger.warning(f"Decision {decision_id} accepted (Pending).")
                return response.json()
                
            if response.status_code == 201:
                return response.json()
            
            if response.status_code == 401:
                raise AuthenticationError("Invalid API key", decision_id=decision_id)
                
            if response.status_code == 403:
                # Could be OrgFrozen or generic Forbidden
                if "frozen" in response.text.lower():
                    raise OrgFrozenError(decision_id=decision_id)
                raise AuthenticationError("Forbidden", decision_id=decision_id)
                
            if response.status_code == 409:
                raise DuplicateDecisionError(decision_id)
                
            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After")
                msg = f"Rate limited. Retry after {retry_after}s" if retry_after else "Rate limited"
                raise RateLimitError(int(retry_after) if retry_after else None, decision_id=decision_id)
                
            if 500 <= response.status_code < 600:
                raise ServiceUnavailableError(decision_id=decision_id)
                
            # Catch-all
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                 raise InvalidResponseError(f"HTTP {response.status_code}: {response.text}", decision_id=decision_id)
            
            return response.json()

        # Execute with backoff
        return exponential_backoff(_execute_request)

    def close(self) -> None:
        """Close the client."""
        self._http.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.close()
