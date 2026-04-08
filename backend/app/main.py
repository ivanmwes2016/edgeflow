from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import deploy, ai, services

app = FastAPI(title="EdgeFlowAPI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(deploy.router, prefix="/api/deploy", tags=["deploy"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai_suggest"])
app.include_router(services.router, prefix="/api/services", tags=["services"])




@app.get("/api/health")
def health():
    return{"status": "ok", "service": "Edgeflow API"}