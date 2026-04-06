from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import json
import uuid


router = APIRouter()

class Node(BaseModel):
    id: str
    label:str
    type: str

class SimulationPayload(BaseModel):
    nodes: List[Node]
    edges: List[dict]



STEP_MESSAGES = {
    "database": ["Initialising volume...", "Starting database engine...", "Awaiting connections..."],
    "cache":    ["Allocating memory...", "Starting cache server...", "Cache ready..."],
    "api":      ["Loading environment...", "Binding port...", "Service healthy..."],
    "web":      ["Building assets...", "Starting server...", "Serving traffic..."],
    "gateway":  ["Configuring routes...", "Starting proxy...", "Gateway live..."],
    "worker":   ["Connecting to queue...", "Starting workers...", "Processing jobs..."],
    "default":  ["Pulling image...", "Starting container...", "Container running..."],
}

jobs:dict = {}

@router.post("/run")
async def runSimulation(payload: SimulationPayload):
    steps = []
    jobId = str(uuid.uuid4())
    order = topologicalSort(payload.nodes, payload.edges)
    for node in order:
        messages = STEP_MESSAGES.get(node.type, STEP_MESSAGES["default"])
        for i, msg in enumerate(messages):
             steps.append({
                "nodeId": node.id,
                "nodeLabel": node.label,
                "message": msg,
                "status": "success" if i == len(messages) - 1 else "running",
                "stepIndex": i,
            })
    jobs[jobId] = steps
    return {"jobId": jobId, "steps": steps}



@router.get("/stream/{jobId}")
async def simulate_stream(jobId:str):
    steps = jobs.get(jobId)

    if not steps:
        return {"error": "No job found"}
    
    async def event_generator():
        for step in steps:
            await asyncio.sleep(0.6)
            yield f"data: {json.dumps(step)}\n\n"
            
        yield "event: done\ndata:{}\n\n"

        del jobs[jobId]

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
             "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no", 
        }
    )
    


def topologicalSort(nodes:List[Node], edges) -> list:
    from collections import defaultdict, deque

    inDegree = {n.id:0 for n in nodes}
    graph = defaultdict(list)

    for e in edges:
        graph[e["source"]].append(e["target"])
        inDegree[e["target"]] = inDegree.get(e["target"], 0) + 1
    
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
    
  

    

  

   



    
    
