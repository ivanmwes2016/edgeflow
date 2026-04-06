from fastapi import APIRouter
from fastapi.responses import PlainTextResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from jinja2 import Template
import uuid
import tempfile
import subprocess
import os
import threading

router = APIRouter()

class Node(BaseModel):
    id: str
    type: str
    label: str
    port: Optional[int] = None
    image: Optional[str] = None
    env: Optional[dict] = None

class EdgeData(BaseModel):
    source: str
    target: str

class GraphPayload(BaseModel):
    nodes: List[Node]
    edges: List[EdgeData]

DEFAULT_IMAGES = {
     "api": "nginx:latest",
    "frontend": "nginx:latest",
    "backend": "python:3.11-slim",
    "db": "postgres:15",
    "redis": "redis:7",
    "worker": "busybox",
}


DOCKER_COMPOSE_TEMPLATE = """

services:
{% for node in nodes %}  {{ node.label | lower | replace(' ', '_') }}:
    image: {{ node.resolved_image }}
    container_name: {{ node.label | lower | replace(' ', '_') }}
{% if node.port %}    ports:
      - "{{ node.port }}:{{ node.port }}"
{% endif %}{% if node.env %}    environment:
{% for k, v in node.env.items() %}      {{ k }}: "{{ v }}"
{% endfor %}{% endif %}{% if node.depends %}    depends_on:
{% for dep in node.depends %}      - {{ dep }}
{% endfor %}{% endif %}    networks:
      - edgeflow_net
{% endfor %}
networks:
  edgeflow_net:
    driver: bridge
"""


jobs: dict = {}

def buildYAMLContent(payload: GraphPayload) -> str:
    dependsMap ={}
    for edge in payload.edges:
        target = edge.target
        sourceNode = next((n for n in payload.nodes if n.id == edge.source), None)
        if sourceNode:
            if target not in dependsMap:
                dependsMap[target] = []
            dependsMap[target].append(sourceNode.label.lower().replace(" ", "_"))
    

    nodesWithDependencies = []
    for node in payload.nodes:
        n = node.model_dump()

        if node.image:
            n["depends"] = node.image
        else:
            n["resolved_image"] = DEFAULT_IMAGES.get(node.type, "nginx:latest")

        n["depends"] = dependsMap.get(node.id, [])
        nodesWithDependencies.append(n)

    return Template(DOCKER_COMPOSE_TEMPLATE).render(nodes=nodesWithDependencies)



def topologicalSort(nodes:List[Node], edges: List[EdgeData]) -> list:
    from collections import defaultdict, deque

    inDegree = {n.id:0 for n in nodes}
    graph = defaultdict(list)

    for e in edges:
        graph[e.source].append(e.target)
        inDegree[e.target] = inDegree.get(e.target, 0) + 1
    
    queue = deque([n for n in nodes if inDegree[n.id] == 0])
    result = []
    nodeMap = {n.id:n for n in nodes}
    
    while queue:
        n = queue.popleft()
        result.append(n)

        for neighbor_in in graph[n.id]:
            inDegree[neighbor_in] -= 1
            if inDegree[neighbor_in] == 0:
                queue.append(nodeMap[neighbor_in])
    
    return result
    
  


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


    # Let run docker in a backgroudn thread so we dont block
    def runDocker():
        jobs[jobId]["logs"].append("Generated docker-compose.yml")
        jobs[jobId]["logs"].append(f"Deploy order: {' → '.join(jobs[jobId]['ordered_nodes'])}")
        jobs[jobId]["logs"].append("Running: docker compose up -d...")

        try:
            process = subprocess.Popen(
                ["docker", "compose", "-f", temp.name, "up", "-d", "--pull", "missing"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
                )
            
            for line in process.stdout:
                line = line.strip()
                if line:
                    jobs[jobId]["logs"].append(line)

            process.wait()
            success = process.returncode == 0
            jobs[jobId]["success"] = success
            jobs[jobId]["logs"].append(
                "✅ All services running" if success else f"❌ Failed (code {process.returncode})"
            )

        except FileNotFoundError:
            jobs[jobId]["logs"].append("❌ Docker not found — is Docker Desktop running?")
            jobs[jobId]["success"] = False
        finally:
            jobs[jobId]["done"] = True
            os.unlink(temp.name)

    thread = threading.Thread(target=runDocker, daemon=True)
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


    




