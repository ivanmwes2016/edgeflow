import tempfile
import subprocess
from jinja2 import Template
import os
from utils.types import *
from utils.constants import DEFAULT_IMAGES, DOCKER_COMPOSE_TEMPLATE
import random


def topologicalSort(nodes:List[Node], edges: List[EdgeData]) -> list:
    from collections import defaultdict, deque

    inDegree = {n.id:0 for n in nodes}
    graph = defaultdict(list)

    for e in edges:
        graph[e.target].append(e.source)
        inDegree[e.source] = inDegree.get(e.source, 0) + 1
    
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
            n["resolved_image"] = node.image
        else:
            n["resolved_image"] = DEFAULT_IMAGES.get(node.type, "nginx:latest")

        n["depends"] = dependsMap.get(node.id, [])
        nodesWithDependencies.append(n)

    return Template(DOCKER_COMPOSE_TEMPLATE).render(nodes=nodesWithDependencies)


def runDocker(jobs: dict, jobId: str, temp: tempfile._TemporaryFileWrapper):
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
    

def random_color():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))