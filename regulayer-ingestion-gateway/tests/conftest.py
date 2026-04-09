import pytest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.auth import TenantContext
from uuid import uuid4

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_auth():
    with pytest.MonkeyPatch.context() as m:
        mock = AsyncMock()
        # Default valid context
        mock.return_value = TenantContext(
            key_id=uuid4(),
            project_id=uuid4(),
            org_id=uuid4(),
            org_status="active",
            scopes=["ingest"],
            environment="production",
            governance_mode="gate"
        )
        m.setattr("app.main.validate_request_headers", mock)
        yield mock

@pytest.fixture
def mock_rate_limit():
    with pytest.MonkeyPatch.context() as m:
        mock = MagicMock()
        m.setattr("app.main.check_rate_limit", mock)
        yield mock

@pytest.fixture
def mock_quota():
    with pytest.MonkeyPatch.context() as m:
        mock = AsyncMock()
        mock.return_value = 1000 # Remaining quota
        m.setattr("app.main.consume_quota", mock)
        yield mock

@pytest.fixture
def mock_forwarder():
    with pytest.MonkeyPatch.context() as m:
        mock = AsyncMock()
        mock.return_value = {"status": "recorded", "decision_id": str(uuid4())}
        m.setattr("app.main.forward_decision", mock)
        yield mock
