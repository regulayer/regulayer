import pytest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.storage import get_governance_session

@pytest.fixture
def mock_session():
    session = AsyncMock()
    # Mock execute result
    mock_result = MagicMock()
    mock_result.scalars().first.return_value = None
    mock_result.scalars().all.return_value = []
    mock_result.all.return_value = []
    
    session.execute.return_value = mock_result
    return session

@pytest.fixture
def client(mock_session):
    async def override_get_db():
        yield mock_session
    
    app.dependency_overrides[get_governance_session] = override_get_db
    
    # Patch init_governance_db to prevent real DB connection during startup
    with patch("app.main.init_governance_db", new_callable=AsyncMock) as mock_init:
        yield TestClient(app)
        
    del app.dependency_overrides[get_governance_session]
