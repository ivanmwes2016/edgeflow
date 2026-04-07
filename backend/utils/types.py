from pydantic import BaseModel
from typing import List, Optional

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