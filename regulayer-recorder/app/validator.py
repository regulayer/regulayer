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
    Validate that event_state matches output_hash presence.
    
    Rules:
        - event_state == "completed" ⟺ output_hash is not None
        - event_state == "failed" ⟺ output_hash is None
    """
    if event.event_state == "completed" and event.output_hash is None:
        raise SemanticValidationError(
            f"event_state is 'completed' but output_hash is null",
            decision_id=str(event.decision_id)
        )
    
    if event.event_state == "failed" and event.output_hash is not None:
        raise SemanticValidationError(
            f"event_state is 'failed' but output_hash is present",
            decision_id=str(event.decision_id)
        )


def _validate_timestamps(event: DecisionEvent) -> None:
    """
    Validate timestamp sanity.
    
    Rules:
        - Timestamps must not be in the future
        - Timestamps must not be absurdly old (>1 year)
        - end_timestamp >= start_timestamp
        - Timestamps must be within acceptable drift from server time
    """
    now = datetime.now(timezone.utc)
    max_drift = timedelta(seconds=settings.max_timestamp_drift_seconds)
    max_age = timedelta(days=365)
    
    # Check if timestamps are in future
    if event.start_timestamp > now + max_drift:
        raise TimestampAnomalyError(
            f"start_timestamp is in the future: {event.start_timestamp}",
            decision_id=str(event.decision_id)
        )
    
    if event.end_timestamp > now + max_drift:
        raise TimestampAnomalyError(
            f"end_timestamp is in the future: {event.end_timestamp}",
            decision_id=str(event.decision_id)
        )
    
    # Check if timestamps are absurdly old
    if event.start_timestamp < now - max_age:
        raise TimestampAnomalyError(
            f"start_timestamp is more than 1 year old: {event.start_timestamp}",
            decision_id=str(event.decision_id)
        )
    
    # Check temporal ordering
    if event.end_timestamp < event.start_timestamp:
        raise TimestampAnomalyError(
            f"end_timestamp ({event.end_timestamp}) is before start_timestamp ({event.start_timestamp})",
            decision_id=str(event.decision_id)
        )


def _validate_sdk_version(event: DecisionEvent) -> None:
    """
    Validate SDK version is in allowed list.
    
    This allows controlled upgrades and prevents rogue SDK versions.
    """
    allowed_versions = settings.get_allowed_sdk_versions()
    
    if event.runtime_fingerprint.sdk_version not in allowed_versions:
        raise SchemaValidationError(
            f"SDK version {event.runtime_fingerprint.sdk_version} is not allowed. "
            f"Allowed versions: {', '.join(allowed_versions)}",
            decision_id=str(event.decision_id)
        )


def _validate_execution_duration(event: DecisionEvent) -> None:
    """
    Validate execution duration is non-negative.
    
    This is a basic sanity check.
    """
    if event.execution_duration_ms < 0:
        raise SemanticValidationError(
            f"execution_duration_ms cannot be negative: {event.execution_duration_ms}",
            decision_id=str(event.decision_id)
        )
