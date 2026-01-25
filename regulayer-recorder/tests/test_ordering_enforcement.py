
import pytest
import sys
import os
from unittest.mock import AsyncMock, patch, MagicMock

# Fix import paths for tests running in isolated environment
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from pydantic import BaseModel

# MOCK regulayer_attestation with Pydantic models
mock_attestation = MagicMock()
mock_models = MagicMock()


class AttestationMetadata(BaseModel):
    algorithm: str
    identity_id: str
    signed_at: datetime

class AttestationEnvelope(BaseModel):
    pass

class AttestationIdentity(BaseModel):
    pass

# MOCK pydantic_settings
mock_settings = MagicMock()
class BaseSettings(BaseModel):
    pass
mock_settings.BaseSettings = BaseSettings
sys.modules["pydantic_settings"] = mock_settings

mock_models.AttestationMetadata = AttestationMetadata
mock_models.AttestationEnvelope = AttestationEnvelope
mock_models.AttestationIdentity = AttestationIdentity

mock_attestation.app = MagicMock()
mock_attestation.app.models = mock_models

sys.modules["regulayer_attestation"] = mock_attestation
sys.modules["regulayer_attestation.app"] = mock_attestation.app
sys.modules["regulayer_attestation.app.models"] = mock_models

from uuid import uuid4
from datetime import datetime, timezone
from app.recorder import record_decision
from app.models import DecisionEvent, RuntimeFingerprint
from app.errors import OrderingViolationError, DuplicateDecisionError

@pytest.fixture
def mock_session():
    return AsyncMock()

@pytest.fixture
def sample_event():
    return DecisionEvent(
        event_version="1.0",
        event_state="completed",
        decision_id=uuid4(),
        system_name="test_sys",
        risk_level="low",
        model_name="gpt-4",
        model_version="1.0",
        start_timestamp=datetime.now(timezone.utc),
        end_timestamp=datetime.now(timezone.utc),
        execution_duration_ms=100.0,
        runtime_fingerprint=RuntimeFingerprint(
            python_version="3.9",
            os="linux",
            sdk_version="1.0.0",
            sdk_instance_id=str(uuid4())
        ),
        sequence_number=None # Default
    )

@pytest.mark.asyncio
async def test_ordering_success_first_record(mock_session, sample_event):
    """Test first record in a project (seq=1) succeeds."""
    # Setup
    with patch("app.recorder.check_duplicate_decision", return_value=False), \
         patch("app.recorder.get_last_record", return_value=None), \
         patch("app.recorder.insert_record") as mock_insert:
        
        # Mock insert return
        mock_insert.return_value = MagicMock(
            record_id=1,
            decision_id=sample_event.decision_id,
            record_hash="hash",
            server_timestamp=datetime.now()
        )
        
        # Execute
        # Set sequence number 1
        event = sample_event.model_copy(update={"sequence_number": 1})
        
        await record_decision(mock_session, event, project_id="proj_A")
        
        # Verify
        mock_insert.assert_called_once()
        assert mock_insert.call_args[1]["sequence_number"] == 1
        assert mock_insert.call_args[1]["chain_id"] == "proj_A"

@pytest.mark.asyncio
async def test_ordering_success_mid_chain(mock_session, sample_event):
    """Test correctly ordered record (seq=N+1) succeeds."""
    # Setup
    last_record = MagicMock(sequence_number=5, record_hash="prev_hash")
    
    with patch("app.recorder.check_duplicate_decision", return_value=False), \
         patch("app.recorder.get_last_record", return_value=last_record), \
         patch("app.recorder.insert_record") as mock_insert:
        
        mock_insert.return_value = MagicMock(
            record_id=10,
            decision_id=sample_event.decision_id,
            record_hash="hash",
            server_timestamp=datetime.now()
        )
        
        # Execute
        event = sample_event.model_copy(update={"sequence_number": 6})
        
        await record_decision(mock_session, event, project_id="proj_A")
        
        # Verify
        mock_insert.assert_called_once()
        assert mock_insert.call_args[1]["sequence_number"] == 6

@pytest.mark.asyncio
async def test_ordering_violation_gap(mock_session, sample_event):
    """Test gap in sequence (seq=N+2) raises error."""
    # Setup
    last_record = MagicMock(sequence_number=5, record_hash="prev_hash")
    
    with patch("app.recorder.check_duplicate_decision", return_value=False), \
         patch("app.recorder.get_last_record", return_value=last_record):
        
        # Execute
        event = sample_event.model_copy(update={"sequence_number": 7}) # Gap!
        
        with pytest.raises(OrderingViolationError) as exc:
            await record_decision(mock_session, event, project_id="proj_A")
        
        assert "Expected 6, got 7" in str(exc.value)

@pytest.mark.asyncio
async def test_ordering_violation_replay(mock_session, sample_event):
    """Test duplicate/replay sequence (seq=N) raises error."""
    # Setup
    last_record = MagicMock(sequence_number=5, record_hash="prev_hash")
    
    with patch("app.recorder.check_duplicate_decision", return_value=False), \
         patch("app.recorder.get_last_record", return_value=last_record):
        
        # Execute
        event = sample_event.model_copy(update={"sequence_number": 5}) # Same as last
        
        with pytest.raises(OrderingViolationError):
            await record_decision(mock_session, event, project_id="proj_A")

@pytest.mark.asyncio
async def test_project_isolation(mock_session, sample_event):
    """Test that projects utilize different chains."""
    # Setup
    # Project A has 5 records
    last_record_A = MagicMock(sequence_number=5, record_hash="hash_A")
    # Project B has 0 records
    
    with patch("app.recorder.check_duplicate_decision", return_value=False), \
         patch("app.recorder.get_last_record") as mock_get_last, \
         patch("app.recorder.insert_record") as mock_insert:
         
        mock_insert.return_value = MagicMock(record_id=1, decision_id=uuid4(), record_hash="h", server_timestamp=datetime.now())

        # Define side_effect for get_last_record based on chain_id
        def get_last_side_effect(session, chain_id):
            if chain_id == "proj_A":
                return last_record_A
            return None
        mock_get_last.side_effect = get_last_side_effect
        
        # 1. Try valid next for A
        event_A = sample_event.model_copy(update={"sequence_number": 6})
        await record_decision(mock_session, event_A, project_id="proj_A")
        
        # 2. Try valid first for B
        event_B = sample_event.model_copy(update={"sequence_number": 1, "decision_id": uuid4()})
        await record_decision(mock_session, event_B, project_id="proj_B")
        
        assert mock_insert.call_count == 2
