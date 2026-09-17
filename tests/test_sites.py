import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def get_admin_headers():
    login_resp = client.post("/api/auth/google", json={"email": "admin@darukaa.earth", "name": "Admin User"})
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_sites_and_geojson_area():
    headers = get_admin_headers()
    # Fetch existing project
    projects_resp = client.get("/api/projects", headers=headers)
    project_id = projects_resp.json()[0]["id"]

    site_payload = {
        "name": "Integration Test Site Alpha",
        "description": "Polygon test plot",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-54.95, -3.20],
                [-54.85, -3.20],
                [-54.85, -3.30],
                [-54.95, -3.30],
                [-54.95, -3.20]
            ]]
        },
        "status": "ACTIVE"
    }

    create_resp = client.post(f"/api/projects/{project_id}/sites", json=site_payload, headers=headers)
    assert create_resp.status_code == 201
    site_data = create_resp.json()
    assert site_data["area_hectares"] > 0
    assert site_data["project_id"] == project_id

    # Clean up site
    site_id = site_data["id"]
    client.delete(f"/api/sites/{site_id}", headers=headers)
