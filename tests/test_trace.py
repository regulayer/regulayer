"""
Tests for Regulayer SDK Trace Context Manager

Validates explicit capture, exception handling, and event generation.
"""

import pytest
import time
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock
from regulayer import trace, configure
from regulayer.hasher import hash_data
from regulayer.client import BackendClient


@pytest.fixture(autouse=True)
def setup_config():
    """Configure SDK for tests."""
    configure(
        api_key="test-api-key-12345",
        endpoint="https://test.regulayer.io/v1/events",
        log_level="ERROR"  # Reduce noise in tests
    )


@pytest.fixture
def mock_client(monkeypatch):
    """Mock the backend client."""
    mock = Mock(spec=BackendClient)
    mock.submit_event = Mock()
    
    # Patch get_client to return our mock
    monkeypatch.setattr("regulayer.trace.get_client", lambda: mock)
    
    return mock


class TestBasicTracing:
    """Test basic trace functionality."""
    
    def test_trace_completes(self, mock_client):
        """Trace should complete without errors."""
        with trace(
            system="test_system",
            risk="low",
            model_name="test_model",
            model_version="v1.0.0"
        ) as t:
            result = {"decision": "approve"}
            t.set_output(result)
        
        # Event should be submitted
        assert mock_client.submit_event.called
    
    def test_decision_id_generated(self, mock_client):
        """Each trace should generate a unique decision ID."""
        decision_ids = set()
        
        for _ in range(5):
            with trace(
                system="test",
                risk="low",
                model_name="model",
                model_version="v1"
            ) as t:
                decision_ids.add(t.decision_id)
        
        # All should be unique
        assert len(decision_ids) == 5
        
        # All should be valid UUIDs (36 characters)
        assert all(len(d_id) == 36 for d_id in decision_ids)
    
    def test_timestamps_captured(self, mock_client):
        """Start and end timestamps should be captured."""
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            time.sleep(0.01)  # Small delay
        
        # Check submitted event
        event = mock_client.submit_event.call_args[0][0]
        
        assert event.start_timestamp is not None
        assert event.end_timestamp is not None
        assert event.end_timestamp >= event.start_timestamp
        assert event.execution_duration_ms > 0


class TestExplicitCapture:
    """Test explicit-only input/output capture."""
    
    def test_explicit_input_capture(self, mock_client):
        """Input must be explicitly set."""
        input_data = {"user_id": "12345", "amount": 1000}
        
        with trace(
            system="test",
            risk="high",
            model_name="model",
            model_version="v1"
        ) as t:
            t.set_input(input_data)
        
        # Check event has input hash
        event = mock_client.submit_event.call_args[0][0]
        assert event.input_hash is not None
        assert len(event.input_hash) == 64  # SHA-256
        
        # Verify hash is correct
        expected_hash = hash_data(input_data)
        assert event.input_hash == expected_hash
    
    def test_explicit_output_capture(self, mock_client):
        """Output must be explicitly set."""
        output_data = {"decision": "approve", "confidence": 0.95}
        
        with trace(
            system="test",
            risk="high",
            model_name="model",
            model_version="v1"
        ) as t:
            t.set_output(output_data)
        
        # Check event has output hash
        event = mock_client.submit_event.call_args[0][0]
        assert event.output_hash is not None
        assert len(event.output_hash) == 64  # SHA-256
        
        # Verify hash is correct
        expected_hash = hash_data(output_data)
        assert event.output_hash == expected_hash
    
    def test_no_automatic_capture(self, mock_client):
        """SDK should NOT automatically capture anything."""
        # Variables in scope but not explicitly set
        input_data = {"user_id": "12345"}
        output_data = {"decision": "deny"}
        
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            # Don't call t.set_input() or t.set_output()
            _ = input_data  # Used to avoid unused variable warning
            _ = output_data
        
        # Event should have NO hashes
        event = mock_client.submit_event.call_args[0][0]
        assert event.input_hash is None
        assert event.output_hash is None
    
    def test_tool_calls_capture(self, mock_client):
        """Tool calls must be explicitly set."""
        tool_calls = [
            {"name": "search", "args": {"query": "test"}},
            {"name": "calculate", "args": {"expression": "2+2"}}
        ]
        
        with trace(
            system="test",
            risk="medium",
            model_name="model",
            model_version="v1"
        ) as t:
            t.set_tool_calls(tool_calls)
        
        # Check event has tool call hashes
        event = mock_client.submit_event.call_args[0][0]
        assert event.tool_calls_hashes is not None
        assert len(event.tool_calls_hashes) == 2
        assert all(len(h) == 64 for h in event.tool_calls_hashes)


class TestEventState:
    """Test event_state field."""
    
    def test_completed_state_with_output(self, mock_client):
        """Event state should be 'completed' when output is set."""
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            t.set_output({"result": "success"})
        
        event = mock_client.submit_event.call_args[0][0]
        assert event.event_state == "completed"
        assert event.output_hash is not None
    
    def test_failed_state_without_output(self, mock_client):
        """Event state should be 'failed' when output is not set."""
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            t.set_input({"test": "data"})
            # No output set
        
        event = mock_client.submit_event.call_args[0][0]
        assert event.event_state == "failed"
        assert event.output_hash is None


class TestExceptionHandling:
    """Test exception handling and transparency."""
    
    def test_user_exception_propagated(self, mock_client):
        """User exceptions should be re-raised."""
        with pytest.raises(ValueError, match="Test error"):
            with trace(
                system="test",
                risk="high",
                model_name="model",
                model_version="v1"
            ) as t:
                t.set_input({"test": "data"})
                raise ValueError("Test error")
    
    def test_event_sent_despite_exception(self, mock_client):
        """Event should still be sent even if exception occurs."""
        try:
            with trace(
                system="test",
                risk="high",
                model_name="model",
                model_version="v1"
            ) as t:
                t.set_input({"test": "data"})
                raise ValueError("Test error")
        except ValueError:
            pass
        
        # Event should still be submitted
        assert mock_client.submit_event.called
        
        # Event should have input but no output (failed state)
        event = mock_client.submit_event.call_args[0][0]
        assert event.input_hash is not None
        assert event.output_hash is None
        assert event.event_state == "failed"
    
    def test_exception_before_input_set(self, mock_client):
        """Event should be sent even if exception before any capture."""
        try:
            with trace(
                system="test",
                risk="low",
                model_name="model",
                model_version="v1"
            ):
                raise RuntimeError("Early failure")
        except RuntimeError:
            pass
        
        # Event should still be submitted
        assert mock_client.submit_event.called
        
        # Event should have no hashes (failed state)
        event = mock_client.submit_event.call_args[0][0]
        assert event.input_hash is None
        assert event.output_hash is None
        assert event.event_state == "failed"


class TestSDKInstanceID:
    """Test SDK instance ID consistency."""
    
    def test_sdk_instance_id_consistent(self, mock_client):
        """SDK instance ID should be same within process."""
        events = []
        
        for _ in range(3):
            with trace(
                system="test",
                risk="low",
                model_name="model",
                model_version="v1"
            ):
                pass
            
            events.append(mock_client.submit_event.call_args[0][0])
        
        # All events should have same SDK instance ID
        instance_ids = [e.runtime_fingerprint.sdk_instance_id for e in events]
        assert len(set(instance_ids)) == 1  # All same
        assert len(instance_ids[0]) == 36  # Valid UUID


class TestEventVersioning:
    """Test event versioning."""
    
    def test_event_version_present(self, mock_client):
        """Event should have version field."""
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ):
            pass
        
        event = mock_client.submit_event.call_args[0][0]
        assert event.event_version == "1.0"


class TestMonotonicClock:
    """Test monotonic clock usage for duration."""
    
    def test_duration_positive(self, mock_client):
        """Duration should always be positive."""
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ):
            time.sleep(0.005)  # 5ms
        
        event = mock_client.submit_event.call_args[0][0]
        assert event.execution_duration_ms > 0
        assert event.execution_duration_ms >= 5.0  # At least 5ms
    
    def test_duration_accuracy(self, mock_client):
        """Duration should be reasonably accurate."""
        sleep_time = 0.05  # 50ms
        
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ):
            time.sleep(sleep_time)
        
        event = mock_client.submit_event.call_args[0][0]
        
        # Should be within reasonable range (accounting for overhead)
        assert 40 < event.execution_duration_ms < 100


class TestPromptHashing:
    """Test prompt hashing."""
    
    def test_prompt_hash_captured(self, mock_client):
        """Prompt should be hashed if provided."""
        prompt_text = "Analyze this loan application"
        
        with trace(
            system="test",
            risk="high",
            model_name="model",
            model_version="v1",
            prompt=prompt_text
        ):
            pass
        
        event = mock_client.submit_event.call_args[0][0]
        assert event.prompt_hash is not None
        assert len(event.prompt_hash) == 64
        
        # Verify hash is correct
        expected_hash = hash_data(prompt_text)
        assert event.prompt_hash == expected_hash
