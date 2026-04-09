import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from utils.dbConfig import get_db, Base
from app.models.services import Service
from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError

# --- Test DB setup ---
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_db():
    db = TestingSessionLocal()
    db.query(Service).delete()
    db.commit()
    db.close()

@pytest.fixture
def sample_service():
    return {
        "type": "api",
        "label": "Test API",
        "port": 8080,
        "image": "nginx:latest",
        "icon": "🌐",
        "color": "#ff0000",
    }

def test_get_services_empty():
    res = client.get("/api/services/")
    assert res.status_code == 200
    assert res.json() == []

def test_get_services_returns_all(sample_service):
    client.post("/api/services/", json=sample_service)
    client.post("/api/services/", json={**sample_service, "label": "Second API", "port": 8081})
    res = client.get("/api/services/")
    assert res.status_code == 200
    assert len(res.json()) == 2

# --- GET /{id} ---
def test_get_service_by_id(sample_service):
    created = client.post("/api/services/", json=sample_service).json()
    res = client.get(f"/api/services/{created['id']}")
    assert res.status_code == 200
    assert res.json()["label"] == "Test API"

def test_get_service_not_found():
    res = client.get("/api/services/999")
    assert res.status_code == 404
    assert res.json()["detail"] == "Service not found"

# --- POST / ---
def test_create_service(sample_service):
    res = client.post("/api/services/", json=sample_service)
    assert res.status_code == 200
    data = res.json()
    assert data["label"] == "Test API"
    assert data["port"] == 8080
    assert "id" in data

def test_create_service_persists(sample_service):
    client.post("/api/services/", json=sample_service)
    res = client.get("/api/services/")
    assert len(res.json()) == 1

# --- PUT /{id} ---
def test_update_service(sample_service):
    created = client.post("/api/services/", json=sample_service).json()
    res = client.put(f"/api/services/{created['id']}", json={"label": "Updated API"})
    assert res.status_code == 200
    assert res.json()["label"] == "Updated API"

def test_update_service_not_found():
    res = client.put("/api/services/999", json={"label": "Ghost"})
    assert res.status_code == 404
    assert res.json()["detail"] == "Service not found"

def test_update_service_partial(sample_service):
    created = client.post("/api/services/", json=sample_service).json()
    res = client.put(f"/api/services/{created['id']}", json={"port": 9090})
    assert res.status_code == 200
    assert res.json()["port"] == 9090
    assert res.json()["label"] == "Test API"  # unchanged

# --- DELETE /{id} ---
def test_delete_service(sample_service):
    created = client.post("/api/services/", json=sample_service).json()
    res = client.delete(f"/api/services/{created['id']}")
    assert res.status_code == 200
    assert res.json()["deleted"] == created["id"]

def test_delete_service_not_found():
    res = client.delete("/api/services/999")
    assert res.status_code == 404

def test_delete_service_removes_from_db(sample_service):
    created = client.post("/api/services/", json=sample_service).json()
    client.delete(f"/api/services/{created['id']}")
    res = client.get(f"/api/services/{created['id']}")
    assert res.status_code == 404


    # Testing for Error Handling
def test_get_services_db_error():
    with patch("app.routers.services.Service", side_effect=SQLAlchemyError("fail")):
        res = client.get("/api/services/")
        assert res.status_code == 500

def test_get_service_db_error():
    with patch("app.routers.services.Service", side_effect=SQLAlchemyError("fail")):
        res = client.get("/api/services/1")
        assert res.status_code == 500


def test_create_service_db_error(sample_service):
    with patch("app.routers.services.Service", side_effect=SQLAlchemyError("fail")):
        res = client.post("/api/services/", json=sample_service)
        assert res.status_code == 500

def test_update_service_db_error(sample_service):
    created = client.post("/api/services/", json=sample_service).json()
    with patch("sqlalchemy.orm.Query.first", side_effect=SQLAlchemyError("fail")):
        res = client.put(f"/api/services/{created['id']}", json={"label": "fail"})
        assert res.status_code == 500

def test_delete_service_db_error(sample_service):
    created = client.post("/api/services/", json=sample_service).json()
    with patch("sqlalchemy.orm.Session.delete", side_effect=SQLAlchemyError("fail")):
        res = client.delete(f"/api/services/{created['id']}")
        assert res.status_code == 500