"""
Private Docs AI - Main FastAPI Application Server
Provides REST APIs for document ingestion, RAG search, chat, summaries,
tools, and system health.
"""

import sys
from pathlib import Path

# Ensure project root and backend dir are in sys.path regardless of execution directory
_backend_dir = Path(__file__).resolve().parent.parent
_project_root = _backend_dir.parent
for _p in [str(_project_root), str(_backend_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import init_db
from backend.app.utils.logger import logger
from backend.app.api.documents import router as documents_router
from backend.app.api.chat import router as chat_router
from backend.app.api.summaries import router as summaries_router
from backend.app.api.tools import router as tools_router
from backend.app.api.search import router as search_router
from backend.app.api.settings_api import router as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events: startup & shutdown.
    """
    logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode...")
    # Initialize SQLite database schema
    init_db()
    logger.info(f"Active AI Provider: {settings.AI_PROVIDER} | Embedding Provider: {settings.EMBEDDING_PROVIDER}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Private Docs AI - Grounded, privacy-first document chat & intelligence assistant.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler (Never expose raw stack traces to frontend)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request. Please check server logs.",
            "path": request.url.path,
        },
    )


# Health Check Endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """
    System health check returning operational status.
    """
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "ai_provider": settings.AI_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
    }


# Mount Routers under API_PREFIX (/api)
app.include_router(documents_router, prefix=settings.API_PREFIX)
app.include_router(chat_router, prefix=settings.API_PREFIX)
app.include_router(summaries_router, prefix=settings.API_PREFIX)
app.include_router(tools_router, prefix=settings.API_PREFIX)
app.include_router(search_router, prefix=settings.API_PREFIX)
app.include_router(settings_router, prefix=settings.API_PREFIX)


# =====================================================================
# Serve Static Frontend in Production (Single Container Deployment)
# =====================================================================
_frontend_dist = _project_root / "frontend" / "dist"
if not _frontend_dist.exists():
    _frontend_dist = Path("/app/frontend/dist")

if _frontend_dist.exists():
    logger.info(f"Mounting static frontend assets from {_frontend_dist}")
    _assets_dir = _frontend_dist / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_root():
        index_file = _frontend_dist / "index.html"
        if index_file.is_file():
            return FileResponse(str(index_file))
        return JSONResponse({"detail": "Frontend index not found"}, status_code=404)

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Ignore API and documentation paths
        if (
            full_path.startswith("api")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path.startswith("openapi.json")
        ):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        target_file = _frontend_dist / full_path
        if full_path and target_file.is_file():
            return FileResponse(str(target_file))
        index_file = _frontend_dist / "index.html"
        if index_file.is_file():
            return FileResponse(str(index_file))
        return JSONResponse({"detail": "Not Found"}, status_code=404)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
