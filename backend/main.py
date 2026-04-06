from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import  deploy


app = FastAPI(title="EdgeFlowAPI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(deploy.router, prefix="/api/deploy", tags=["deploy"])




@app.get("/api/health")
def health():
    return{"status": "ok", "service": "Edgeflow API"}