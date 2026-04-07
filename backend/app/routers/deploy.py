from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import uuid
import tempfile
import subprocess
import os
import threading

from utils.utils import runDocker, topologicalSort, buildYAMLContent
from utils.types import *


router = APIRouter()
jobs: dict = {} # This can be a redis service. just used a dictionary just for presentation purposes


@router.post("/run")
def deployRun(payload: GraphPayload):
    jobId = str(uuid.uuid4())
    yamlContent = buildYAMLContent(payload)
    orderedNodes = topologicalSort(payload.nodes, payload.edges)

    jobs[jobId] = {
        "logs": [],
        "done":False,
        "success": None,
        "ordered_nodes": [n.label for n in orderedNodes]
    }

    temp = tempfile.NamedTemporaryFile(mode="w", suffix=".yml", delete=False)
    temp.write(yamlContent)
    temp.close()    

    thread = threading.Thread(target=runDocker, args=(jobs, jobId, temp), daemon=True)
    thread.start()

    return {"jobId": jobId}


@router.get("/stream/{job_id}")
async def deploy_stream(job_id: str):
    import asyncio

    job = jobs.get(job_id)
    if not job:
        return {"error": "Job not found"}

    async def event_generator():
        sent = 0
        while True:
            logs = job["logs"]

         
            while sent < len(logs):
                yield f"data: {logs[sent]}\n\n"
                sent += 1

            
            if job["done"] and sent >= len(logs):
                yield "event: done\ndata: {}\n\n"
                del jobs[job_id]
                break

            await asyncio.sleep(0.3)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )

@router.post("/stop")
def deploy_stop(payload: GraphPayload):
    yaml_content = buildYAMLContent(payload)

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".yml", delete=False
    ) as f:
        f.write(yaml_content)
        tmp_path = f.name

    try:
        result = subprocess.run(
            ["docker", "compose", "-f", tmp_path, "down"],
            capture_output=True,
            text=True,
        )
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "errors": result.stderr,
        }
    finally:
        os.unlink(tmp_path)

@router.post("/generate")
def generateConfig(payload: GraphPayload):
    return buildYAMLContent(payload)





    




