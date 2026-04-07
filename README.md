# EdgeFlow 🚀

> Visual deployment designer for multi-service containerised systems.

EdgeFlow lets you design system architectures on a visual canvas, then generates real Docker Compose configs and simulates deployments — step by step, service by service.

Built as a tech task demonstrating full-stack skills in React, TypeScript, and Python FastAPI.

---

![EdgeFlow](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)

---

## What it does

| Feature         | Description                                           |
| --------------- | ----------------------------------------------------- |
| Visual canvas   | Drag, drop, and connect service nodes on a live graph |
| 6 service types | Web App, API, Database, Cache, API Gateway, Worker    |
| Generate config | One-click `docker-compose.yml` from your graph        |
| Simulate deploy | Animated step-by-step deployment with a live log      |
| AI analysis     | Architecture suggestions (Claude API hookup included) |

---

## Tech Stack

### Frontend.

- **React 18** with TypeScript
- **React Flow** — node graph canvas
- **Tailwind CSS** — styling
- **Vite** — build tool
- **Vitest** — testing tool

### Backend

- **Python 3.12** with FastAPI
- **Jinja2** — docker-compose template rendering
- **Pydantic** — request validation
- **PyTest** - Testing
- Topological sort for correct service deployment ordering

### Infrastructure

- Docker + docker-compose
- Vite proxy to FastAPI (no CORS in dev)

---

## Quick Start

### Local dev (recommended)

**Backend:**

```bash
cd backend
make env
make install
make run
```

IMPORTANT: Please ensure your local docker is running.

# Testing

```bash
make test
make coverage
```

**Frontend (new terminal):**

```bash
cd frontend
npm install
npm run dev
```

# Testing

```bash
npm run test
npm run coverage
```

Open **http://localhost:5173**

---

### Docker (one command)

```bash
docker-compose up --build
```

Open **http://localhost:5173**

---

## How to use it

1. **Add services** — click any service in the left panel to place it on the canvas
2. **Connect them** — drag from the right handle of one node to the left handle of another
3. **Delete a node** — right-click it
4. **Simulate Deploy** — watch services deploy in dependency order with a live log
5. **Generate Config** — get a real `docker-compose.yml` you can copy or download
6. **AI Analyse** — get architecture suggestions based on your current graph

---

## API Reference

All endpoints accept and return JSON unless noted.

### `POST /api/deploy/generate`

Generates a `docker-compose.yml` from the graph.

**Request:**

```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "database",
      "label": "PostgreSQL",
      "port": 5432,
      "image": "postgres:16"
    }
  ],
  "edges": [{ "source": "node_1", "target": "node_2" }]
}
```

**Response:** `text/plain` — a valid `docker-compose.yml`

---

### `POST /api/deploy/run`

Returns ordered deployment steps using topological sort.

**Response:**

```json
{
  "steps": [
    {
      "nodeId": "node_1",
      "nodeLabel": "PostgreSQL",
      "message": "Starting database engine...",
      "status": "running"
    }
  ]
}
```

---

### `POST /api/ai/suggest`

Returns architecture suggestions for the current graph.

**Response:**

```json
{
  "suggestions": [
    {
      "type": "warning",
      "message": "No database detected. Consider adding persistent storage."
    }
  ]
}
```

---

### `GET /api/health`

```json
{ "status": "ok", "service": "EdgeFlow API" }
```

---

## Design decisions

**Why React Flow?**
React Flow provides a production-grade abstraction for graph-based UIs.

Built-in state management for nodes and edges
Handles drag, zoom, pan, and connections out of the box
Extensible via custom node/edge renderers
Used in real-world tools like workflow builders (e.g. internal tooling platforms)

👉 This allowed focusing on domain logic (deployment orchestration) instead of low-level canvas/event handling.

**Why topological sort for simulation?**
The system models real infrastructure dependencies:

API depends on database
Worker depends on queue
Web depends on API

Using Topological Sort ensures:

Services start in the correct order
No service starts before its dependencies are ready
The graph is validated implicitly (cycles can be detected)

👉 This mirrors real-world orchestration tools like Docker Compose and Kubernetes.

**Why Jinja2 for config generation?**
Generating YAML via string concatenation is:

error-prone ❌
hard to maintain ❌
difficult to extend ❌

Using Jinja2:

Separates logic from presentation
Produces clean, readable templates
Makes adding new service types trivial
Enables easier testing of output

👉 This makes the system extensible and production-friendly

**Why FastAPI for backend?**
FastAPI was chosen because it provides a modern, high-performance backend with minimal boilerplate while still being strongly typed and testable.

1. High performance (async-first)

FastAPI is built on: ASGI, async/await, starlette + Pydantic

This makes it ideal for:

handling concurrent requests
streaming logs (SSE)
non-blocking operations

In this case:
deployment runs in background
logs stream in real-time

-> FastAPI handled this cleanly.

## Author

Ivan — Full Stack Developer  
Tech task for a Full Stack Developer role (React, Python, TypeScript)
