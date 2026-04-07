from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

PAYLOAD_MOCK = {
        "nodes": [
            {"id": "n1", "type": "database", "label": "Postgres", "port": 5432, "image": "postgres:16"},
            {"id": "n2", "type": "api",      "label": "API",      "port": 8000, "image": "python:3.12-slim"},
        ],
        "edges": [
            {"source": "n2", "target": "n1"}
        ]
    }

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_generate_config():
    res = client.post("/api/deploy/generate", json=PAYLOAD_MOCK)
    assert res.status_code == 200
    assert "postgres" in res.text
    assert "depends_on" in res.text



def test_ai():
    res = client.post("/api/ai/suggest", json=PAYLOAD_MOCK)
    assert res.status_code == 200



