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
{% for node in nodes %}  {{ node.service_name }}:
    image: {{ node.resolved_image }}
    container_name: {{ node.service_name }}
{% if node.port %}    ports:
      - "{{ node.port }}:{{ node.port }}"
{% endif %}{% if node.env %}    environment:
{% for k, v in node.env.items() %}      {{ k }}: "{{ v }}"
{% endfor %}{% endif %}{% if node.depends %}    depends_on:
{% for dep in node.depends %}      - {{ nodeIdToName[dep] }}
{% endfor %}{% endif %}    networks:
      - edgeflow_net
{% endfor %}
networks:
  edgeflow_net:
    driver: bridge
"""
