import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from regulayer_attestation.app.attestation import create_attestation_envelope
from app.recorder import record_decision
from app.models import DecisionEvent
from datetime import datetime
import uuid

@pytest.mark.asyncio
async def test_mixed_chain_linking(signer, identity, sample_event, mock_registry):
    # We will test app.recorder.record_decision
    # We need to mock storage functions imported in app.recorder
    
    session = AsyncMock()
    
    # helper to create event
    def make_event(id, model):
        ev = sample_event.copy()
        ev["decision_id"] = str(id)
        ev["model_name"] = model
        return DecisionEvent(**ev)

    # 1. First: Legacy Event
    event1 = make_event(uuid.uuid4(), "legacy-1")
    
    # Mock storage for first call
    # check_duplicate -> False
    # get_last_record -> None (Genesis)
    # insert_record -> return Record
    
    with patch("app.recorder.check_duplicate_decision", return_value=False), \
         patch("app.recorder.get_last_record", return_value=None), \
         patch("app.recorder.insert_record") as mock_insert:
        
        # Use MagicMock for the RETURNED object from await insert_record, because it's not awaited further
        # Wait, insert_record IS awaited. 
        # await insert_record(...) returns the value.
        # So mock_insert.return_value must be the object (or a coroutine returning checks?)
        # If mock_insert is AsyncMock (default for async function patch?), awaiting it returns side_effect or return_value.
        # So mock_insert.return_value should be the RESULT object.
        
        mock_insert.return_value = MagicMock(
            record_id=1,
            record_hash="hash_1",
            decision_id=event1.decision_id,
            server_timestamp=datetime.utcnow()
        )
        
        conf1 = await record_decision(session, event1)
        
        # Verify insert_record called with previous_record_hash=None
        args, kwargs = mock_insert.call_args
        assert kwargs["previous_record_hash"] is None
        assert kwargs["signature_algorithm"] is None # Legacy
        
        # Capture hash for next step
        hash1 = "hash_1"

    # 2. Second: Attested Event
    event2 = make_event(uuid.uuid4(), "attested-2")
    envelope = create_attestation_envelope(event2.model_dump(mode='json'), signer, identity)
    attestation = envelope.attestation
    
    # Mock storage for second call
    # get_last_record -> Record(hash_1)
    last_record_mock = MagicMock(record_hash=hash1)
    
    with patch("app.recorder.check_duplicate_decision", return_value=False), \
         patch("app.recorder.get_last_record", return_value=last_record_mock), \
         patch("app.recorder.insert_record") as mock_insert:
         
        mock_insert.return_value = MagicMock(
            record_id=2,
            record_hash="hash_2",
            decision_id=event2.decision_id,
            server_timestamp=datetime.utcnow()
        )
        
        conf2 = await record_decision(session, event2, attestation=attestation)
        
        # Verify linking
        args, kwargs = mock_insert.call_args
        assert kwargs["previous_record_hash"] == hash1
        
        # Verify attestation storage
        assert kwargs["identity_id"] == identity.id
        assert kwargs["signature_algorithm"] == "Ed25519"
        assert kwargs["attestation_payload"] is not None
        
        hash2 = "hash_2"

    # 3. Third: Legacy Event again
    event3 = make_event(uuid.uuid4(), "legacy-3")
    
    last_record_mock_2 = MagicMock(record_hash=hash2)
    
    with patch("app.recorder.check_duplicate_decision", return_value=False), \
         patch("app.recorder.get_last_record", return_value=last_record_mock_2), \
         patch("app.recorder.insert_record") as mock_insert:
         
        mock_insert.return_value = MagicMock(
            record_id=3,
            record_hash="hash_3",
            decision_id=event3.decision_id,
            server_timestamp=datetime.utcnow()
        )
        
        conf3 = await record_decision(session, event3)
        
        # Verify linking
        args, kwargs = mock_insert.call_args
        assert kwargs["previous_record_hash"] == hash2
        assert kwargs["signature_algorithm"] is None # Legacy
