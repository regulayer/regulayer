"""
Regulayer Decision Recorder - Schema & Semantic Validation

Validates decision events for schema conformance and semantic consistency.
Rule: Invalid events are REJECTED, not repaired.
"""

from datetime import datetime, timezone, timedelta
from typing import List

from .models import DecisionEvent
from .config import settings
from .errors import SchemaValidationError, SemanticValidationError, TimestampAnomalyError


def validate_decision_event(event: DecisionEvent) -> None:
    """
    Perform comprehensive validation on a decision event.
    
    Validates:
    - Schema (via Pydantic - already done)
    - Semantic consistency
    - Timestamp sanity
    - SDK version compatibility
    
    Args:
        event: DecisionEvent to validate
    
    Raises:
        SchemaValidationError: Schema validation failed
        SemanticValidationError: Semantic inconsistency detected
        TimestampAnomalyError: Timestamp is invalid
    
    Rule: Invalid events are REJECTED, not repaired.
    """
    _validate_event_state_consistency(event)
    _validate_timestamps(event)
    _validate_sdk_version(event)
    _validate_execution_duration(event)


def _validate_event_state_consistency(event: DecisionEvent) -> None:
    """
    Validate that event_state matches output_hash or output presence.
    """
    if event.event_state == "completed" and event.output_hash is None and event.output is None:
        raise SemanticValidationError(
            f"event_state is 'completed' but both output_hash and output are null",
            decision_id=str(event.decision_id)
        )
    
    if event.event_state == "failed" and (event.output_hash is not None or event.output is not None):
        raise SemanticValidationError(
            f"event_state is 'failed' but output data is present",
            decision_id=str(event.decision_id)
        )


def _validate_timestamps(event: DecisionEvent) -> None:
    """
    Validate timestamp sanity.
    """
    now = datetime.now(timezone.utc)
    max_drift = timedelta(seconds=settings.max_timestamp_drift_seconds)
    max_age = timedelta(days=365)
    
    if event.start_timestamp is not None:
        if event.start_timestamp > now + max_drift:
            raise TimestampAnomalyError(
                f"start_timestamp is in the future: {event.start_timestamp}",
                decision_id=str(event.decision_id)
            )
        if event.start_timestamp < now - max_age:
            raise TimestampAnomalyError(
                f"start_timestamp is more than 1 year old: {event.start_timestamp}",
                decision_id=str(event.decision_id)
            )
            
    if event.end_timestamp is not None:
        if event.end_timestamp > now + max_drift:
            raise TimestampAnomalyError(
                f"end_timestamp is in the future: {event.end_timestamp}",
                decision_id=str(event.decision_id)
            )
            
    if event.start_timestamp is not None and event.end_timestamp is not None:
        if event.end_timestamp < event.start_timestamp:
            raise TimestampAnomalyError(
                f"end_timestamp ({event.end_timestamp}) is before start_timestamp ({event.start_timestamp})",
                decision_id=str(event.decision_id)
            )


def _validate_sdk_version(event: DecisionEvent) -> None:
    """
    Validate SDK version is in allowed list.
    """
    allowed_versions = settings.get_allowed_sdk_versions()
    
    sdk_version = None
    if event.runtime_fingerprint and event.runtime_fingerprint.sdk_version:
        sdk_version = event.runtime_fingerprint.sdk_version
    elif event.client_metadata and isinstance(event.client_metadata, dict):
        # Look inside client_metadata natively
        sdk_version = event.client_metadata.get('sdk_version')
        
    if sdk_version and sdk_version not in allowed_versions:
        raise SchemaValidationError(
            f"SDK version {sdk_version} is not allowed. "
            f"Allowed versions: {', '.join(allowed_versions)}",
            decision_id=str(event.decision_id)
        )


def _validate_execution_duration(event: DecisionEvent) -> None:
    """
    Validate execution duration is non-negative.
    """
    if event.execution_duration_ms is not None and event.execution_duration_ms < 0:
        raise SemanticValidationError(
            f"execution_duration_ms cannot be negative: {event.execution_duration_ms}",
            decision_id=str(event.decision_id)
        )
