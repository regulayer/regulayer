"""
Tests for Validation Logic

Proves schema and semantic validation works correctly.
"""

import pytest
from datetime import datetime, timezone, timedelta
from uuid import uuid4

from app.validator import validate_decision_event
from app.models import DecisionEvent, RuntimeFingerprint
from app.errors import SemanticValidationError, TimestampAnomalyError, SchemaValidationError


@pytest.fixture
def valid_event():
    """Create a valid decision event."""
    now = datetime.now(timezone.utc)
    return DecisionEvent(
        event_version="1.0",
        event_state="completed",
        decision_id=uuid4(),
        system_name="test_system",
        risk_level="high",
        model_name="test_model",
        model_version="v1.0.0",
        input_hash="a" * 64,
        output_hash="b" * 64,
        prompt_hash=None,
        tool_calls_hashes=None,
        start_timestamp=now - timedelta(seconds=5),
        end_timestamp=now,
        execution_duration_ms=5000.0,
        runtime_fingerprint=RuntimeFingerprint(
            python_version="3.10.0",
            os="Linux",
            sdk_version="1.0.0",
            sdk_instance_id=str(uuid4())
        )
    )


class TestEventStateConsistency:
    """Test event_state consistency validation."""
    
    def test_completed_must_have_output_hash(self):
        """event_state='completed' requires output_hash."""
        now = datetime.now(timezone.utc)
        
        # completed but no output_hash
        with pytest.raises(SemanticValidationError, match="completed.*output_hash and output are null"):
            event = DecisionEvent(
                event_version="1.0",
                event_state="completed",  # Says completed
                decision_id=uuid4(),
                system_name="test",
                risk_level="low",
                model_name="model",
                model_version="v1",
                input_hash="a" * 64,
                output_hash=None,  # But no output
                start_timestamp=now,
                end_timestamp=now,
                execution_duration_ms=0.0,
                runtime_fingerprint=RuntimeFingerprint(
                    python_version="3.10.0",
                    os="Linux",
                    sdk_version="1.0.0",
                    sdk_instance_id=str(uuid4())
                )
            )
            validate_decision_event(event)
    
    def test_failed_must_not_have_output_hash(self):
        """event_state='failed' must not have output_hash."""
        now = datetime.now(timezone.utc)
        
        # failed but has output_hash
        with pytest.raises(SemanticValidationError, match="failed.*output data is present"):
            event = DecisionEvent(
                event_version="1.0",
                event_state="failed",  # Says failed
                decision_id=uuid4(),
                system_name="test",
                risk_level="low",
                model_name="model",
                model_version="v1",
                input_hash="a" * 64,
                output_hash="b" * 64,  # But has output
                start_timestamp=now,
                end_timestamp=now,
                execution_duration_ms=0.0,
                runtime_fingerprint=RuntimeFingerprint(
                    python_version="3.10.0",
                    os="Linux",
                    sdk_version="1.0.0",
                    sdk_instance_id=str(uuid4())
                )
            )
            validate_decision_event(event)
    
    def test_valid_completed_accepted(self, valid_event):
        """Valid completed event should pass."""
        # Should not raise
        validate_decision_event(valid_event)
    
    def test_valid_failed_accepted(self):
        """Valid failed event should pass."""
        now = datetime.now(timezone.utc)
        
        event = DecisionEvent(
            event_version="1.0",
            event_state="failed",
            decision_id=uuid4(),
            system_name="test",
            risk_level="low",
            model_name="model",
            model_version="v1",
            input_hash="a" * 64,
            output_hash=None,  # Correctly no output
            start_timestamp=now - timedelta(seconds=1),
            end_timestamp=now,
            execution_duration_ms=1000.0,
            runtime_fingerprint=RuntimeFingerprint(
                python_version="3.10.0",
                os="Linux",
                sdk_version="1.0.0",
                sdk_instance_id=str(uuid4())
            )
        )
        
        # Should not raise
        validate_decision_event(event)


class TestTimestampValidation:
    """Test timestamp sanity checks."""
    
    def test_future_timestamp_rejected(self):
        """Timestamps in the future should be rejected."""
        future = datetime.now(timezone.utc) + timedelta(hours=1)
        
        with pytest.raises(TimestampAnomalyError, match="in the future"):
            event = DecisionEvent(
                event_version="1.0",
                event_state="completed",
                decision_id=uuid4(),
                system_name="test",
                risk_level="low",
                model_name="model",
                model_version="v1",
                input_hash="a" * 64,
                output_hash="b" * 64,
                start_timestamp=future,  # In future!
                end_timestamp=future,
                execution_duration_ms=0.0,
                runtime_fingerprint=RuntimeFingerprint(
                    python_version="3.10.0",
                    os="Linux",
                    sdk_version="1.0.0",
                    sdk_instance_id=str(uuid4())
                )
            )
            validate_decision_event(event)
    
    def test_very_old_timestamp_rejected(self):
        """Timestamps >1 year old should be rejected."""
        very_old = datetime.now(timezone.utc) - timedelta(days=400)
        
        with pytest.raises(TimestampAnomalyError, match="more than 1 year old"):
            event = DecisionEvent(
                event_version="1.0",
                event_state="completed",
                decision_id=uuid4(),
                system_name="test",
                risk_level="low",
                model_name="model",
                model_version="v1",
                input_hash="a" * 64,
                output_hash="b" * 64,
                start_timestamp=very_old,
                end_timestamp=very_old,
                execution_duration_ms=0.0,
                runtime_fingerprint=RuntimeFingerprint(
                    python_version="3.10.0",
                    os="Linux",
                    sdk_version="1.0.0",
                    sdk_instance_id=str(uuid4())
                )
            )
            validate_decision_event(event)
    
    def test_end_before_start_rejected(self):
        """end_timestamp must be >= start_timestamp."""
        now = datetime.now(timezone.utc)
        
        with pytest.raises(TimestampAnomalyError, match="before start_timestamp"):
            event = DecisionEvent(
                event_version="1.0",
                event_state="completed",
                decision_id=uuid4(),
                system_name="test",
                risk_level="low",
                model_name="model",
                model_version="v1",
                input_hash="a" * 64,
                output_hash="b" * 64,
                start_timestamp=now,
                end_timestamp=now - timedelta(seconds=10),  # Before start!
                execution_duration_ms=0.0,
                runtime_fingerprint=RuntimeFingerprint(
                    python_version="3.10.0",
                    os="Linux",
                    sdk_version="1.0.0",
                    sdk_instance_id=str(uuid4())
                )
            )
            validate_decision_event(event)


class TestSDKVersionValidation:
    """Test SDK version control."""
    
    def test_allowed_version_accepted(self, valid_event):
        """Allowed SDK version should pass."""
        # 1.0.0 is in default allowed list
        validate_decision_event(valid_event)
    
    def test_disallowed_version_rejected(self):
        """Disallowed SDK version should be rejected."""
        now = datetime.now(timezone.utc)
        
        with pytest.raises(SchemaValidationError, match="SDK version.*not allowed"):
            event = DecisionEvent(
                event_version="1.0",
                event_state="completed",
                decision_id=uuid4(),
                system_name="test",
                risk_level="low",
                model_name="model",
                model_version="v1",
                input_hash="a" * 64,
                output_hash="b" * 64,
                start_timestamp=now,
                end_timestamp=now,
                execution_duration_ms=0.0,
                runtime_fingerprint=RuntimeFingerprint(
                    python_version="3.10.0",
                    os="Linux",
                    sdk_version="99.99.99",  # Not allowed
                    sdk_instance_id=str(uuid4())
                )
            )
            validate_decision_event(event)


class TestExecutionDuration:
    """Test execution duration validation."""
    
    def test_negative_duration_rejected(self):
        """Negative execution_duration_ms should be rejected."""
        now = datetime.now(timezone.utc)
        
        with pytest.raises(SemanticValidationError, match="execution_duration_ms cannot be negative"):
            event = DecisionEvent(
                event_version="1.0",
                event_state="completed",
                decision_id=uuid4(),
                system_name="test",
                risk_level="low",
                model_name="model",
                model_version="v1",
                input_hash="a" * 64,
                output_hash="b" * 64,
                start_timestamp=now,
                end_timestamp=now,
                execution_duration_ms=-100.0,  # Negative!
                runtime_fingerprint=RuntimeFingerprint(
                    python_version="3.10.0",
                    os="Linux",
                    sdk_version="1.0.0",
                    sdk_instance_id=str(uuid4())
                )
            )
            validate_decision_event(event)
