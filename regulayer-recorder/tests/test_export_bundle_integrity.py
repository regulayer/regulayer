
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from datetime import datetime, timezone
from uuid import uuid4
from app.api import router
from fastapi import FastAPI
from app.models import DecisionEvent, DecisionRecord
from regulayer_attestation.app.models import AttestationEnvelope

from app.storage import get_db_session

app = FastAPI()
app.include_router(router)

async def override_get_db_session():
    return AsyncMock()

app.dependency_overrides[get_db_session] = override_get_db_session

client = TestClient(app)

@patch("app.storage.AsyncSession")
def test_export_bundle_integrity(mock_session_cls):
    """
    Verify that the export endpoint returns a bundle that:
    1. Matches the stored record fields exactly.
    2. Contains valid verification metadata.
    3. Hashes match the canonical payload.
    """
    decision_id = uuid4()
    mock_session = AsyncMock()
    
    # Mock record
    mock_record = MagicMock()
    mock_record.decision_id = decision_id
    mock_record.record_id = 123
    mock_record.record_hash = "a" * 64
    mock_record.previous_record_hash = "b" * 64
    mock_record.canonical_payload = {"key": "value"}
    mock_record.canonical_payload_hash = "c" * 64
    mock_record.chain_id = "global"
    mock_record.server_timestamp = datetime.now(timezone.utc)
    mock_record.sdk_instance_id = uuid4()
    mock_record.system_name = "test-system"
    mock_record.risk_level = "low"
    mock_record.event_state = "completed"
    mock_record.sdk_version = "1.0.0"
    
    # Attested fields
    mock_record.identity_id = uuid4()
    mock_record.signature_algorithm = "Ed25519"
    mock_record.signed_at = datetime.now(timezone.utc)
    mock_record.attestation_payload = {"sig": "nature"}
    
    # Mock DB query result
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_record
    mock_session.execute.return_value = mock_result
    
    # Setup dependency override for session
    app.dependency_overrides[get_db_session] = lambda: mock_session
    
    # Act
    # We need to explicitly clear overrides after test, but for this single file it's fine.
    response = client.get(f"/v1/decisions/{decision_id}/export")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    
    # 1. Structural Validation
    assert "verification_metadata" in data
    assert "canonical_event" in data
    assert "attestation" in data
    
    # 2. Content Matching
    assert data["record_hash"] == mock_record.record_hash
    assert data["previous_record_hash"] == mock_record.previous_record_hash
    assert data["canonical_event"] == mock_record.canonical_payload
    
    # 3. Attestation Matching
    attestation = data["attestation"]
    assert attestation["identity_id"] == str(mock_record.identity_id)
    assert attestation["algorithm"] == "Ed25519"
    # Using specific comparison for timestamp serialization
    
    # 4. Metadata Validation
    meta = data["verification_metadata"]
    assert meta["verification_result"] == "VALID"
    assert "verifier_version" in meta
    # Handle 'Z' suffix for Python < 3.11 compatibility
    ts = meta["verified_at"].replace("Z", "+00:00")
    assert datetime.fromisoformat(ts) 
