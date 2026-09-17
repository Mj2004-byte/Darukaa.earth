import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_google_auth_demo_callback():
    payload = {
        "email": "test.admin@darukaa.earth",
        "name": "Test Admin User",
        "sub": "google-sub-test-12345"
    }
    response = client.post("/api/auth/google", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test.admin@darukaa.earth"
    assert data["user"]["role"] in ["ADMIN", "ANALYST"]

def test_get_current_user_me():
    login_resp = client.post("/api/auth/google", json={"email": "test.admin@darukaa.earth"})
    token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "test.admin@darukaa.earth"
