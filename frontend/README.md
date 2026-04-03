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

### Frontend

- **React 18** with TypeScript
- **React Flow** — node graph canvas
- **Tailwind CSS** — styling
- **Vite** — build tool

### Backend

- **Python 3.12** with FastAPI
- **Jinja2** — docker-compose template rendering
- **Pydantic** — request validation
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
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend (new terminal):**

```bash
cd frontend
npm install
npm run dev
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

### `POST /api/config/generate`

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

### `POST /api/simulate/run`

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

## Project Structure

```
edgeflow/
├── frontend/
│   └── src/
│       ├── App.tsx                 # Main app + React Flow setup
│       ├── types/index.ts          # Shared types + service configs
│       ├── nodes/
│       │   └── ServiceNode.tsx     # Custom node component
│       └── components/
│           ├── Sidebar.tsx         # Service palette
│           ├── Toolbar.tsx         # Action buttons
│           ├── SimPanel.tsx        # Deployment log panel
│           ├── ConfigModal.tsx     # YAML viewer + download
│           └── AIPanel.tsx         # AI suggestion cards
├── backend/
│   ├── main.py                     # FastAPI app + CORS
│   └── routes/
│       ├── config.py               # docker-compose generation
│       ├── simulate.py             # Deployment simulation + topo sort
│       └── ai.py                   # AI suggestions (Claude API hook)
├── docker-compose.yml
└── README.md
```

---

## Adding Claude AI

The AI endpoint is ready to wire up. In `backend/routes/ai.py`, replace the heuristic logic with:

```python
import anthropic

client = anthropic.Anthropic(api_key="YOUR_CLAUDE_API_KEY")

@router.post("/suggest")
def suggest(payload: AIRequest):
    prompt = f"""
    Analyse this system architecture and return 3-5 improvement suggestions as JSON.
    Architecture: {payload.dict()}
    Return only: [{{"type": "info|warning|success", "message": "..."}}]
    """
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    suggestions = json.loads(message.content[0].text)
    return {"suggestions": suggestions}
```

---

## Design decisions

**Why React Flow?** It's the most production-grade graph library for React — used by tools like n8n and Retool. Handles node state, edge connections, and custom renderers out of the box.

**Why topological sort for simulation?** Services have real dependencies — a database must be healthy before an API can connect to it. The backend sorts the graph so deployment always happens in the correct order.

**Why Jinja2 for config generation?** YAML generation via string concatenation is brittle. Jinja2 templates are readable, testable, and easy to extend with new service types.

---

## Author

Ivan — Full Stack Developer  
Tech task for a Full Stack Developer role (React, Python, TypeScript)
