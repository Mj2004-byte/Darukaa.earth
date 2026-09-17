import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def get_admin_headers():
    login_resp = client.post("/api/auth/google", json={"email": "admin@darukaa.earth", "name": "Admin User"})
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_list_projects():
    headers = get_admin_headers()
    response = client.get("/api/projects", headers=headers)
    assert response.status_code == 200
    projects = response.json()
    assert isinstance(projects, list)
    assert len(projects) >= 1

def test_create_and_delete_project():
    headers = get_admin_headers()
    project_payload = {
        "name": "Integration Test Mangrove Reserve",
        "description": "Test rainforest canopy conservation zone.",
        "project_type": "Wetland",
        "status": "ACTIVE",
        "country": "Costa Rica",
        "region": "Guanacaste"
    }
    create_resp = client.post("/api/projects", json=project_payload, headers=headers)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["name"] == project_payload["name"]
    project_id = created["id"]

    # Delete
    del_resp = client.delete(f"/api/projects/{project_id}", headers=headers)
    assert del_resp.status_code == 204
