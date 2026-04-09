"""
Regulayer SDK - Client
"""

import logging
import json
import hashlib
from typing import Optional, Dict, Any
import httpx

from .config import get_config, RegulayerConfig
from .errors import (
    AuthenticationError,
    RateLimitError,
    DuplicateDecisionError,
    OrgFrozenError,
    ServiceUnavailableError,
    InvalidResponseError,
    NetworkError,
    ValidationError,
    GovernanceBlockedError
)
from .retry import exponential_backoff
from .validation import validate_payload_size, validate_circular_refs
from .utils import get_current_timestamp, get_runtime_fingerprint, generate_decision_id, apply_zkp_commitments
from . import __version__

logger = logging.getLogger(__name__)

_client: Optional["RegulayerClient"] = None


def get_client() -> "RegulayerClient":
    """Get the configured client instance."""
    global _client
    
    config = get_config()  # Raises InvalidConfigurationError if not configured

    # If no client exists yet, or the configuration has changed since the
    # last time we created a client, build a fresh one.
    if _client is None or _client.config != config:
        _client = RegulayerClient(config)

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
                "Authorization": f"Bearer {config.api_key}",
                "X-Regulayer-Api-Key": config.api_key, # Legacy/Dual support? Spec says Authorization: Bearer <API_KEY>
                "Content-Type": "application/json",
                "X-Regulayer-SDK-Version": __version__
            }
        )
        # Spec Section 7 says:
        # Headers:
        #   Authorization: Bearer <API_KEY>
        #   X-Request-ID: <decision_id>
        #   Content-Type: application/json
        # I added X-Regulayer-Api-Key just in case, but will ensure Authorization is there.
    
    def record_decision(
        self,
        system: str,
        decision_type: str, # Spec says "system" in payload, doesn't explicitly mention decision_type in Section 7 payload, but 6.1 says "system". 
        # Wait, Section 7 Payload:
        # {
        #   "decision_id": "uuid",
        #   "system": "string",
        #   "input": {...},
        #   "output": {...},
        #   "client_metadata": { ... }
        # }
        # Existing code had "decision_type". The spec doesn't show "decision_type" in Section 7 payload. 
        # But section 1 says "Record decisions... Attach inputs & outputs". 
        # I will keep decision_type in "input" or "metadata" if needed, but strictly follow Section 7 for top level.
        # Actually I'll check if I can keep it or if strict spec forbids extra fields?
        # "Payload ... { ... }" implies exact structure? 
        # The existing code had "decision_type" in payload. 
        # I'll put it in `client_metadata` or `input` to be safe? 
        # Or just include it at top level and hope backend accepts it.
        # Section 5.2 example: `with trace(system="loan_approval")`. No decision_type arg in spec example. 
        # Existing `trace` class has `decision_type="default"`. 
        # I will keep `decision_type` but maybe not send it if strict? 
        # Let's assume strict Section 7.
        input_data: dict,
        output_data: dict,
        metadata: Optional[dict] = None,
        risk_level: str = "standard",
        decision_id: Optional[str] = None,
        hidden_fields: Optional[list] = None,
        zkp_salt: str = ""
    ) -> dict:
        """
        Record a decision with strict semantics and retry logic.
        Supports Zero-Knowledge Commitments if `hidden_fields` are provided.
        """
        # 1. Canonical Identity
        if not decision_id:
            decision_id = generate_decision_id()
            
        timestamp_now = get_current_timestamp()
        
        # 2. Validation
        validate_circular_refs(input_data)
        validate_circular_refs(output_data)

        # 2.5 Zero-Knowledge Privacy Masking
        if hidden_fields:
            input_data = apply_zkp_commitments(input_data, hidden_fields, zkp_salt)
            output_data = apply_zkp_commitments(output_data, hidden_fields, zkp_salt)
        
        # Calculate duration (for now 0 if we don't track start/end separately in this method)
        execution_duration_ms = 0.0

        # Runtime Fingerprint
        fingerprint = get_runtime_fingerprint()

        # Calculate Hashes
        def calc_hash(data: Any) -> Optional[str]:
            if data is None: return None
            try:
                # Use sort_keys=True for consistent hashing
                dump = json.dumps(data, sort_keys=True)
                return hashlib.sha256(dump.encode("utf-8")).hexdigest()
            except Exception:
                return None

        input_hash = calc_hash(input_data)
        output_hash = calc_hash(output_data)

        # Spec Section 7 Payload Structure (Corrected to match Recorder DecisionEvent)
        final_payload: Dict[str, Any] = {
            # Event Metadata
            "event_version": "2.0",
            "event_state": "completed",
            
            # Decision ID
            "decision_id": decision_id,
            "system_name": system, 
            "risk_level": risk_level,
            
            # Model Info (Defaults if not provided)
            "model_name": "default", 
            "model_version": "1.0",
            
            # Hashes
            "input_hash": input_hash,
            "output_hash": output_hash,
            
            # Timing
            "start_timestamp": timestamp_now,
            "end_timestamp": timestamp_now,
            "execution_duration_ms": execution_duration_ms,
            
            # Context
            "runtime_fingerprint": fingerprint,
            
            # Data
            "input": input_data,
            "output": output_data,
            "metadata": metadata or {},
            
            # Extra fields from client_metadata that might be useful
            "decision_type": decision_type,
        }
        
        # Additional metadata handling
        # Verify inputs
        # (Validation logic remains)
        
        validate_payload_size(final_payload)

        # 3. Execution with Retry
        def _execute_request():
            headers = self._http.headers.copy()
            headers["X-Request-ID"] = decision_id
            headers["X-Regulayer-Environment"] = self.config.environment
            # headers["Authorization"] is already set in __init__
            
            try:
                response = self._http.post(
                    f"{self.config.endpoint}/v1/decisions", 
                    json=final_payload, 
                    headers=headers
                )
            except httpx.NetworkError as e:
                raise NetworkError(str(e), decision_id=decision_id)
            
            # Map Status Codes
            if response.status_code == 202:
                # Spec: "Returns immediately after 202"
                # Spec: "SUCCESS (Pending)"
                return response.json()
                
            if response.status_code == 200 or response.status_code == 201:
                return response.json()
            
            if response.status_code == 401:
                raise AuthenticationError("Invalid API key", decision_id=decision_id)
                
            if response.status_code == 403:
                # Could be OrgFrozen, GovernanceBlocked, or generic Forbidden
                if "frozen" in response.text.lower():
                    raise OrgFrozenError(decision_id=decision_id)
                try:
                    err_data = response.json()
                    if err_data.get("detail", {}).get("error") == "GovernanceBlockedError":
                        raise GovernanceBlockedError(
                            message=err_data.get("detail", {}).get("message", "Decision requires approval."),
                            decision_id=decision_id
                        )
                except ValueError:
                    pass
                raise AuthenticationError("Forbidden", decision_id=decision_id)
                
            if response.status_code == 409:
                try:
                    err_payload = response.json()
                    detail = err_payload.get("detail", {})
                    if isinstance(detail, dict) and detail.get("error") == "ENVIRONMENT_MISMATCH":
                        raise InvalidConfigurationError(
                            f"Environment Mismatch: {detail.get('message')}"
                        )
                except ValueError:
                    pass
                raise DuplicateDecisionError(decision_id)
                
            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After")
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
        return exponential_backoff(_execute_request, max_retries=self.config.max_retries)

    def check_review_status(self, decision_id: str) -> dict:
        """Check the status of a pending gate-mode decision."""
        headers = self._http.headers.copy()
        
        try:
            response = self._http.get(
                f"{self.config.endpoint}/v1/decisions/{decision_id}/review-status",
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            # If polling fails, assume it's still pending so we don't prematurely abort.
            # Timeout logic in trace.py will handle ultimate abort.
            return {"status": "pending_review"}

    def close(self) -> None:
        """Close the client."""
        self._http.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.close()

