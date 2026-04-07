from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_generate_config():
    payload = {
        "nodes": [
            {"id": "n1", "type": "database", "label": "Postgres", "port": 5432, "image": "postgres:16"},
            {"id": "n2", "type": "api",      "label": "API",      "port": 8000, "image": "python:3.12-slim"},
        ],
        "edges": [
            {"source": "n2", "target": "n1"}
        ]
    }
    res = client.post("/api/config/generate", json=payload)
    assert res.status_code == 200
    assert "postgres" in res.text
    assert "depends_on" in res.text

def test_generate_config_empty():
    payload = {"nodes": [], "edges": []}
    res = client.post("/api/config/generate", json=payload)
    assert res.status_code == 200