import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def get_auth_headers():
    login_resp = client.post("/api/auth/google", json={"email": "analyst@darukaa.earth"})
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_agent_biodiversity_query():
    headers = get_auth_headers()
    payload = {"query": "Which site has shown the largest improvement in biodiversity?"}
    response = client.post("/api/agent/query", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "final_answer" in data
    assert len(data["tool_logs"]) >= 1
    assert data["data_points_used"] > 0

def test_agent_project_area_query():
    headers = get_auth_headers()
    payload = {"query": "Which project has the largest area?"}
    response = client.post("/api/agent/query", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "final_answer" in data
    assert "get_projects" in [log["tool_name"] for log in data["tool_logs"]]
