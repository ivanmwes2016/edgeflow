import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from utils.dbConfig import Base
from app.models.services import Service
from app.seed import seed_data_to_db

# --- Test DB setup ---
TEST_DATABASE_URL = "sqlite:///./test_seed.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(autouse=True)
def setup_db(monkeypatch):
    import app.seed as seed_module
    monkeypatch.setattr(seed_module, "engine", test_engine)
    monkeypatch.setattr(seed_module, "SessionLocal", TestSession)

    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


def test_seed_inserts_services():
    seed_data_to_db()
    db = TestSession()
    services = db.query(Service).all()
    db.close()
    assert len(services) == 5


def test_seed_correct_types():
    seed_data_to_db()
    db = TestSession()
    types = {s.type for s in db.query(Service).all()}
    db.close()
    assert types == {"web", "api", "gateway", "database", "cache"}


def test_seed_correct_ports():
    seed_data_to_db()
    db = TestSession()
    ports = {s.port for s in db.query(Service).all()}
    db.close()
    assert ports == {3000, 8000, 8080, 5432, 6379}


def test_seed_does_not_duplicate(capsys):
    seed_data_to_db()
    seed_data_to_db()

    db = TestSession()
    count = db.query(Service).count()
    db.close()

    assert count == 5 
    captured = capsys.readouterr()
    assert "already seeded" in captured.out


def test_seed_correct_images():
    seed_data_to_db()
    db = TestSession()
    images = {s.image for s in db.query(Service).all()}
    db.close()
    assert "nginx:alpine" in images
    assert "postgres:16" in images
    assert "redis:7-alpine" in images


def test_seed_all_have_icons():
    seed_data_to_db()
    db = TestSession()
    services = db.query(Service).all()
    db.close()
    assert all(s.icon for s in services)


def test_seed_prints_success(capsys):
    seed_data_to_db()
    captured = capsys.readouterr()
    assert "Seeded successfully" in captured.out