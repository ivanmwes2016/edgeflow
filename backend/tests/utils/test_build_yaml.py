from utils.utils import buildYAMLContent
from utils.types import *

def make_payload(nodes, edges):
    return GraphPayload(nodes=nodes, edges=edges)

def test_basic_yaml_generation():
    nodes = [Node(id="1", label="API", type="api")]
    yaml_output = buildYAMLContent(make_payload(nodes, []))

    assert "services:" in yaml_output
    assert "api_1:" in yaml_output  # label_id format

def test_dependency_mapping():
    nodes = [
        Node(id="1", label="DB", type="db"),
        Node(id="2", label="API", type="api"),
    ]
    edges = [EdgeData(source="1", target="2")]
    yaml_output = buildYAMLContent(make_payload(nodes, edges))

    assert "depends_on" in yaml_output
    assert "- db_1" in yaml_output  # resolves to service_name not label

def test_custom_image_used():
    nodes = [Node(id="1", label="API", type="api", image="my-api:latest")]
    yaml_output = buildYAMLContent(make_payload(nodes, []))

    assert "image: my-api:latest" in yaml_output

def test_default_image_used():
    nodes = [Node(id="1", label="API", type="api")]
    yaml_output = buildYAMLContent(make_payload(nodes, []))

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
    yaml_output = buildYAMLContent(make_payload(nodes, edges))

    assert "- db_1" in yaml_output
    assert "- cache_2" in yaml_output

def test_no_dependencies():
    nodes = [Node(id="1", label="API", type="api")]
    yaml_output = buildYAMLContent(make_payload(nodes, []))

    assert "depends_on" not in yaml_output

def test_label_normalization():
    nodes = [Node(id="1", label="My API Service", type="api")]
    yaml_output = buildYAMLContent(make_payload(nodes, []))

    assert "my_api_service_1" in yaml_output

def test_multiple_same_type_no_clash():
    nodes = [
        Node(id="1", label="Database", type="db"),
        Node(id="2", label="Database", type="db"),
    ]
    yaml_output = buildYAMLContent(make_payload(nodes, []))

    assert "database_1:" in yaml_output
    assert "database_2:" in yaml_output

def test_image_does_not_override_depends():
    nodes = [Node(id="1", label="API", type="api", image="my-api")]
    yaml_output = buildYAMLContent(make_payload(nodes, []))

    assert "depends_on" not in yaml_output