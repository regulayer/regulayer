from fastapi import status

def test_signup_flow(client):
    # Act
    response = client.post("/v1/auth/signup", json={
        "email": "test@example.com",
        "password": "password123",
        "orgName": "Test Org"
    })
    
    # Assert
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["org"]["name"] == "Test Org"
    
    # Verify we can login
    login_resp = client.post("/v1/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200

def test_create_project_and_key(client):
    # 1. Signup
    signup_resp = client.post("/v1/auth/signup", json={
        "email": "dev@example.com",
        "password": "securePass!",
        "orgName": "Dev Org"
    })
    token = signup_resp.json()["token"]
    org_id = signup_resp.json()["user"]["org"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Project
    project_resp = client.post(f"/v1/orgs/{org_id}/projects", json={
        "name": "My Project",
        "environment": "dev"
    }, headers=headers)
    
    assert project_resp.status_code == 200
    project_id = project_resp.json()["id"]
    
    # 3. Create API Key
    key_resp = client.post(f"/v1/projects/{project_id}/keys", json={
        "name": "Test Key",
        "scopes": ["ingest", "verify"]
    }, headers=headers)
    
    assert key_resp.status_code == 200
    key_data = key_resp.json()
    assert key_data["key_secret"].startswith("rl_")
    
    # 4. Validate Key
    api_key = key_data["key_secret"]
    validate_resp = client.post("/v1/auth/validate", params={"api_key": api_key})
    
    assert validate_resp.status_code == 200
    validation = validate_resp.json()
    assert validation["valid"] is True
    assert validation["project_id"] == project_id
    assert "ingest" in validation["scopes"]

def test_invalid_login(client):
    response = client.post("/v1/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrong"
    })
    assert response.status_code == 401
