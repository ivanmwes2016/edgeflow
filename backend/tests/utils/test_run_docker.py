import tempfile
from unittest.mock import patch, MagicMock
from utils.utils import runDocker

def fake_job():
    return {
        "logs": [],
        "done": False,
        "success": None,
        "ordered_nodes": ["db", "api"]
    }


@patch("app.routers.deploy.os.unlink")
@patch("app.routers.deploy.subprocess.Popen")
def test_run_docker_success(mock_popen, mock_unlink):
    mock_process = MagicMock()
    mock_process.stdout = ["Pulling...\n", "Starting...\n"]
    mock_process.wait.return_value = 0
    mock_process.returncode = 0

    mock_popen.return_value = mock_process

    jobs = {"job1": fake_job()}

    temp = tempfile.NamedTemporaryFile(delete=False)

    runDocker(jobs, "job1", temp)

    logs = jobs["job1"]["logs"]

    assert "Generated docker-compose.yml" in logs
    assert "Running: docker compose up -d..." in logs
    assert "Pulling..." in logs
    assert jobs["job1"]["success"] is True
    assert jobs["job1"]["done"] is True

    mock_unlink.assert_called_once_with(temp.name)


@patch("app.routers.deploy.os.unlink")
@patch("app.routers.deploy.subprocess.Popen")
def test_run_docker_failure(mock_popen, mock_unlink):
    mock_process = MagicMock()
    mock_process.stdout = ["Error occurred\n"]
    mock_process.wait.return_value = 0
    mock_process.returncode = 1

    mock_popen.return_value = mock_process

    jobs = {"job1": fake_job()}
    temp = tempfile.NamedTemporaryFile(delete=False)

    runDocker(jobs, "job1", temp)

    logs = jobs["job1"]["logs"]

    assert any("❌ Failed" in log for log in logs)
    assert jobs["job1"]["success"] is False
    assert jobs["job1"]["done"] is True

    mock_unlink.assert_called_once_with(temp.name)


@patch("app.routers.deploy.os.unlink")
@patch("app.routers.deploy.subprocess.Popen", side_effect=FileNotFoundError)
def test_run_docker_not_found(mock_popen, mock_unlink):
    jobs = {"job1": fake_job()}
    temp = tempfile.NamedTemporaryFile(delete=False)

    runDocker(jobs, "job1", temp)

    logs = jobs["job1"]["logs"]

    assert any("Docker not found" in log for log in logs)
    assert jobs["job1"]["success"] is False
    assert jobs["job1"]["done"] is True

    mock_unlink.assert_called_once_with(temp.name)


# Ensure that logs are streamed correctly
@patch("app.routers.deploy.os.unlink")
@patch("app.routers.deploy.subprocess.Popen")
def test_run_docker_streams_logs(mock_popen, mock_unlink):
    mock_process = MagicMock()
    mock_process.stdout = ["line1\n", "\n", "line2\n"]  # includes empty line
    mock_process.wait.return_value = 0
    mock_process.returncode = 0

    mock_popen.return_value = mock_process

    jobs = {"job1": fake_job()}
    temp = tempfile.NamedTemporaryFile(delete=False)

    runDocker(jobs, "job1", temp)

    logs = jobs["job1"]["logs"]

    assert "line1" in logs
    assert "line2" in logs
    assert "" not in logs