from utils.utils import topologicalSort
from utils.types import *
from pydantic import BaseModel

class EdgeData(BaseModel):
    source: str
    target: str


def make_nodes(*args):
    """Helper — pass tuples of (id, label, type)"""
    return [Node(id=id, label=label, type=type) for id, label, type in args]

def make_edges(*args):
    """Helper — pass tuples of (source, target)"""
    return [EdgeData(source=s, target=t) for s, t in args]


# --- Basic ordering ---

def test_single_node():
    nodes = make_nodes(("n1", "Postgres", "database"))
    result = topologicalSort(nodes, [])
    assert len(result) == 1
    assert result[0].id == "n1"

def test_no_nodes():
    result = topologicalSort([], [])
    assert result == []

def test_linear_chain():
    # DB → API → Web
    nodes = make_nodes(
        ("n1", "Postgres", "database"),
        ("n2", "API",      "api"),
        ("n3", "Web",      "web"),
    )
    edges = make_edges(("n2", "n1"), ("n3", "n2"))
    result = topologicalSort(nodes, edges)
    ids = [n.id for n in result]

    # DB must come before API, API before Web
    assert ids.index("n1") < ids.index("n2")
    assert ids.index("n2") < ids.index("n3")

def test_database_before_api():
    nodes = make_nodes(
        ("n1", "Postgres", "database"),
        ("n2", "API",      "api"),
    )
    edges = make_edges(("n2", "n1"))  # API depends on DB
    result = topologicalSort(nodes, edges)
    ids = [n.id for n in result]

    assert ids.index("n1") < ids.index("n2")

def test_all_nodes_returned():
    nodes = make_nodes(
        ("n1", "Postgres", "database"),
        ("n2", "API",      "api"),
        ("n3", "Web",      "web"),
        ("n4", "Cache",    "cache"),
    )
    edges = make_edges(("n2", "n1"), ("n3", "n2"))
    result = topologicalSort(nodes, edges)

    assert len(result) == 4

def test_no_edges_returns_all_nodes():
    nodes = make_nodes(
        ("n1", "Postgres", "database"),
        ("n2", "API",      "api"),
        ("n3", "Web",      "web"),
    )
    result = topologicalSort(nodes, [])
    assert len(result) == 3

def test_multiple_independent_nodes():
    # Two services with no connection — both should appear
    nodes = make_nodes(
        ("n1", "Postgres", "database"),
        ("n2", "Redis",    "cache"),
    )
    result = topologicalSort(nodes, [])
    ids = [n.id for n in result]
    assert "n1" in ids
    assert "n2" in ids

def test_diamond_dependency():
    # API and Worker both depend on DB
    # Web depends on both API and Worker
    nodes = make_nodes(
        ("n1", "Postgres", "database"),
        ("n2", "API",      "api"),
        ("n3", "Worker",   "worker"),
        ("n4", "Web",      "web"),
    )
    edges = make_edges(
        ("n2", "n1"),  # <- API depends on DB
        ("n3", "n1"),  # <-  Worker depends on DB
        ("n4", "n2"),  # <- Web depends on API
        ("n4", "n3"),  # <- Web depends on Worker
    )
    result = topologicalSort(nodes, edges)
    ids = [n.id for n in result]

    assert ids.index("n1") < ids.index("n2")
    assert ids.index("n1") < ids.index("n3")
    assert ids.index("n2") < ids.index("n4")
    assert ids.index("n3") < ids.index("n4")

def test_preserves_node_data():
    nodes = make_nodes(("n1", "Postgres", "database"))
    result = topologicalSort(nodes, [])
    assert result[0].label == "Postgres"
    assert result[0].type == "database"