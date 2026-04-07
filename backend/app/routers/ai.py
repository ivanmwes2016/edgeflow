from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import anthropic
import os
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()



class AIRequest(BaseModel):
    nodes: List[dict]
    edges: List[dict]

@router.post("/suggest")
def suggest(payload: AIRequest):
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    node_descriptions = [
        f"{n.get('label')} ({n.get('type')})" for n in payload.nodes
    ]
    edge_descriptions = [
        f"{e.get('source')} → {e.get('target')}" for e in payload.edges
    ]

    prompt = f"""
You are a DevOps architecture advisor. A developer has designed the following
containerised system in a visual deployment tool:

Services: {", ".join(node_descriptions) or "none"}
Connections: {", ".join(edge_descriptions) or "none"}

Analyse this architecture and return ONLY a JSON array of 3-5 suggestions.
Each suggestion must have exactly these fields:
- "type": one of "info", "warning", or "success"
- "message": a single clear sentence of actionable advice

Return only raw JSON. No markdown, no backticks, no explanation.

Example:
[{{"type": "warning", "message": "No database detected — add persistent storage."}}]
"""

    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001", 
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}]
        )

        text = message.content[0].text.strip()

        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        suggestions = json.loads(text.strip())
        return {"suggestions": suggestions}

    except Exception as e:
        return {
            "suggestions": [
                {"type": "warning", "message": f"AI analysis unavailable: {str(e)}"}
            ]
        }