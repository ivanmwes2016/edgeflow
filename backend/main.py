from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import simulate


app = FastAPI(title="EdgeFlowAPI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate.router, prefix="/api/simulate", tags=["simulate"])




@app.get("/api/health")
def health():
    return{"status": "ok", "service": "Edgeflow API"}