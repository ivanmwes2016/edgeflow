
from utils.utils import buildYAMLContent
from utils.types import *

def make_payload(nodes, edges):
    return GraphPayload(nodes=nodes, edges=edges)

def test_basic_yaml_generation():
    nodes = [
        Node(id="1", label="API", type="api"),
    ]
    payload = make_payload(nodes, [])
    yaml_output = buildYAMLContent(payload)

    assert "services:" in yaml_output
    assert "api:" in yaml_output 

def test_dependency_mapping():
    nodes = [
        Node(id="1", label="DB", type="db"),
        Node(id="2", label="API", type="api"),
    ]
    edges = [
        EdgeData(source="1", target="2") 
    ]

    payload = make_payload(nodes, edges)
    yaml_output = buildYAMLContent(payload)

    assert "depends_on" in yaml_output
    assert "- db" in yaml_output 

def test_custom_image_used():
    nodes = [
        Node(id="1", label="API", type="api", image="my-api:latest"),
    ]
    payload = make_payload(nodes, [])
    yaml_output = buildYAMLContent(payload)

    assert "image: my-api:latest" in yaml_output


def test_default_image_used():
    nodes = [
        Node(id="1", label="API", type="api"),
    ]
    payload = make_payload(nodes, [])
    yaml_output = buildYAMLContent(payload)
    assert "image:" in yaml_output


def test_multiple_dependencies():
    nodes = [
        Node(id="1", label="DB", type="db"),
        Node(id="2", label="Cache", type="redis"),
        Node(id="3", label="API", type="api"),
    ]
    edges = [
        EdgeData(source="1", target="3"),
        EdgeData(source="2", target="3"),
    ]

    payload = make_payload(nodes, edges)
    yaml_output = buildYAMLContent(payload)

    assert "- db" in yaml_output
    assert "- cache" in yaml_output

def test_no_dependencies():
    nodes = [
        Node(id="1", label="API", type="api"),
    ]
    payload = make_payload(nodes, [])
    yaml_output = buildYAMLContent(payload)

    assert "depends_on" not in yaml_output

def test_label_normalization():
    nodes = [
        Node(id="1", label="My API Service", type="api"),
    ]
    payload = make_payload(nodes, [])
    yaml_output = buildYAMLContent(payload)

    assert "my_api_service" in yaml_output

# ensures no corruption -> Nodes without edges must NOT have depends_on, 
# no accidental dependencies
def test_image_does_not_override_depends():
    nodes = [
        Node(id="1", label="API", type="api", image="my-api"),
    ]
    payload = make_payload(nodes, [])
    yaml_output = buildYAMLContent(payload)

    assert "depends_on" not in yaml_output  