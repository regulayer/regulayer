from unittest.mock import AsyncMock, patch, MagicMock
from regulayer_attestation.app.attestation import create_attestation_envelope
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
from app.api import router
from fastapi import FastAPI
import pytest

from app.api import get_db_session

@pytest.fixture(autouse=True)
def mock_db_session(client):
    async def override_get_db_session():
        yield AsyncMock()
    
    client.app.dependency_overrides[get_db_session] = override_get_db_session
    yield
    client.app.dependency_overrides = {}

@patch("app.api.record_decision")
def test_revocation_blocked_at_ingestion(mock_record, signer, identity, sample_event, override_guard, mock_registry, client):
    # Setup revoked identity
    # signed_at is NOW (by default in create_attestation_envelope)
    # revoked_at = NOW - 1 hour
    # signed_at > revoked_at -> REJECT
    
    revocation_time = datetime.now(timezone.utc) - timedelta(hours=1)
    identity.revoked_at = revocation_time
    identity.status = "active" # Allow signing
    
    # 1. Sign AFTER revocation (Should fail)
    # create_attestation_envelope checks status.
    envelope = create_attestation_envelope(sample_event, signer, identity)
    
    # Now update identity to be revoked in registry
    identity.status = "revoked"
    mock_registry.get_identity.return_value = identity
    
    request_payload = {
        "ingestion_type": "attested",
        "payload": envelope.model_dump(mode='json')
    }
    
    response = client.post("/v1/decisions", json=request_payload)
    
    assert response.status_code == 401, f"Expected 401, got {response.status_code}. Details: {response.text}"
    assert "verification failed" in response.json()["detail"]["message"].lower() or "revoked" in response.json()["detail"]["message"].lower()
    assert not mock_record.called

@patch("app.api.record_decision")
def test_historical_revocation_accepted(mock_record, signer, identity, sample_event, override_guard, mock_registry, client):
    # Setup revoked identity where revocation is in FUTURE relative to signing.
    # signed_at is NOW
    # revoked_at = NOW + 1 hour
    # signed_at < revoked_at -> ACCEPT (Valid)
    
    # Note: identity.status should logically be "active" or "revoked"? 
    # If "revoked", verify() checks timestamp.
    # If "active", verify() doesn't check revoked_at (usually).
    # But here we simulate an identity that IS revoked, but the signature is historical.
    # So status="revoked", but revoked_at > current_time? 
    # Logic:
    # Verifier checks: if identity.status == "revoked":
    #    if signed_at > revoked_at: FAIL
    #    else: OK (revoked_after)
    
    revocation_time = datetime.now(timezone.utc) + timedelta(hours=1)
    identity.revoked_at = revocation_time
    identity.status = "active" # Allow signing
    
    # 2. Sign BEFORE revocation (Should pass)
    envelope = create_attestation_envelope(sample_event, signer, identity)
    
    # Now update identity to be revoked in registry
    identity.status = "revoked"
    mock_registry.get_identity.return_value = identity
    
    request_payload = {
        "ingestion_type": "attested",
        "payload": envelope.model_dump(mode='json')
    }
    
    # Mock record
    # Use MagicMock for result object
    mock_record.return_value = MagicMock(
        record_id=1, 
        decision_id=sample_event["decision_id"],
        record_hash="hash",
        server_timestamp=datetime.now(timezone.utc)
    )
    
    response = client.post("/v1/decisions", json=request_payload)
    
    assert response.status_code == 201, f"Expected 201, got {response.status_code}. Details: {response.text}"
    assert mock_record.called
