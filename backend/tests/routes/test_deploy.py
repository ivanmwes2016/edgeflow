
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.routers import deploy
from app.main import app

client = TestClient(app)

def sample_payload():
    return {
        "nodes": [
            {"id": "1", "label": "API", "type": "api"},
        ],
        "edges": []
    }

def test_generate_yaml_config(client):
    response = client.post("/api/deploy/generate", json=sample_payload())

    assert response.status_code == 200
    assert "services:" in response.text



@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    from app.main import app
    with TestClient(app) as c:
        yield c


@patch("app.routers.deploy.tempfile.NamedTemporaryFile")
@patch("app.routers.deploy.runDocker")
@patch("app.routers.deploy.threading.Thread")
@patch("app.routers.deploy.buildYAMLContent")
@patch("app.routers.deploy.topologicalSort")
def test_deploy_run(
    mock_topo,
    mock_yaml,
    mock_thread,
    mock_runDocker,
    mock_tempfile,
    client
):
    mock_yaml.return_value = "fake-yaml"
    mock_topo.return_value = [MagicMock(label="API")]

    # temp file
    mock_file = MagicMock()
    mock_file.name = "/tmp/test.yml"
    mock_tempfile.return_value = mock_file

    # thread
    mock_thread_instance = MagicMock()

    def fake_start():
        # simulate job finishing
        for job in deploy.jobs.values():
            job["done"] = True

    mock_thread_instance.start.side_effect = fake_start
    mock_thread.return_value = mock_thread_instance

    response = client.post("/api/deploy/run", json=sample_payload())

    assert response.status_code == 200
    data = response.json()

    assert "jobId" in data


def test_stream_logs(client):
    from app.routers import deploy

    job_id = "test-job"

    deploy.jobs[job_id] = {
        "logs": ["line1", "line2"],
        "done": True,
        "success": True,
        "ordered_nodes": []
    }

    with client.stream("GET", f"/api/deploy/stream/{job_id}") as response:
        chunks = list(response.iter_text())

    content = "".join(chunks)

    assert "line1" in content
    assert "line2" in content
    assert "event: done" in content


@patch("app.routers.deploy.subprocess.run")
@patch("app.routers.deploy.os.unlink")
def test_deploy_stop(mock_unlink, mock_run, client):
    mock_result = MagicMock()
    mock_result.returncode = 0
    mock_result.stdout = "stopped"
    mock_result.stderr = ""

    mock_run.return_value = mock_result

    response = client.post("/api/deploy/stop", json=sample_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert data["output"] == "stopped"

    mock_unlink.assert_called_once()