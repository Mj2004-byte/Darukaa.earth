import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.config import settings
from backend.db.database import Base, engine, init_db_on_demand
from backend.db.seed_data import seed_database
from backend.ml.predict import get_risk_model

from backend.api import auth, projects, sites, analytics, ai, agent, ml, dashboard

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="AI-Powered Geospatial Carbon & Biodiversity Platform API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure Database Table & Data Initialization Middleware for Vercel Serverless
@app.middleware("http")
async def serverless_db_init_middleware(request: Request, call_next):
    try:
        init_db_on_demand()
    except Exception as e:
        print(f"Middleware DB init warning: {e}")
    response = await call_next(request)
    return response

# Register API Routers under both /api and root / for Vercel path rewriting immunity
routers = [auth.router, projects.router, sites.router, analytics.router, ai.router, agent.router, ml.router, dashboard.router]
for r in routers:
    app.include_router(r, prefix=settings.API_V1_STR)
    app.include_router(r)

@app.on_event("startup")
def on_startup():
    print("Starting up Darukaa.Earth FastAPI Application...")
    try:
        init_db_on_demand()
    except Exception as e:
        print(f"Startup DB init warning: {e}")

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENV,
        "ai_demo_mode": settings.AI_DEMO_MODE,
    }

# SPA Fallback for static frontend files if dist directory exists
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        if full_path.startswith("api"):
            return None
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
