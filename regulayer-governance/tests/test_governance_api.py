from unittest.mock import MagicMock
from app.models import GovernanceReviewState
from app.config import settings
import uuid

def test_get_capabilities(client):
    headers = {"X-Internal-Auth": settings.internal_secret}
    response = client.get("/v1/governance/roles/admin/capabilities", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
    # Admins can view but NOT approve or change state
    assert data["capabilities"]["can_view"] is True
    assert data["capabilities"]["can_approve"] is False

def test_get_governance_metadata(client, mock_session):
    # Use valid UUID
    mock_id = str(uuid.uuid4())
    headers = {"X-Internal-Auth": settings.internal_secret}
    response = client.get(f"/v1/governance/{mock_id}", headers=headers)
    
    # If the mock returns empty lists by default (as configured in conftest), 
    # it should return a valid GovernanceMetadata with defaults.
    assert response.status_code == 200
    data = response.json()
    assert data["review_state"] == "unreviewed"

def test_add_annotation_headers(client, mock_session):
    # Should fail without internal auth
    mock_id = str(uuid.uuid4())
    response = client.post(
        f"/v1/governance/{mock_id}/annotations",
        json={"author_role": "analyst", "note": "Test note"}
    )
    assert response.status_code == 403

def test_add_annotation_frozen(client, mock_session):
    # Should fail if org is frozen
    mock_id = str(uuid.uuid4())
    headers = {
        "X-Internal-Auth": settings.internal_secret,
        "X-Org-Status": "frozen"
    }
    response = client.post(
        f"/v1/governance/{mock_id}/annotations",
        json={"author_role": "analyst", "note": "Test note"},
        headers=headers
    )
    assert response.status_code == 403

def test_review_transition_conflict(client, mock_session):
    # Transition UNREVIEWED -> ESCALATED is invalid (must go to IN_REVIEW)
    mock_id = str(uuid.uuid4())
    headers = {
        "X-Internal-Auth": settings.internal_secret,
        "X-Actor-Role": "compliance" # Use Compliance role as Admins cannot review
    }
    
    # We assume current state is UNREVIEWED (default mock)
    
    response = client.post(
        f"/v1/governance/{mock_id}/reviews",
        json={"new_state": "escalated"},
        headers=headers
    )
    import json
    with open("test_err.json", "w") as f:
        json.dump(response.json(), f)
    assert response.status_code == 409
