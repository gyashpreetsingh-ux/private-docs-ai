"""
Private Docs AI - Dashboard Stats & Settings API Endpoints
"""

from typing import Dict, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.chat import Conversation
from backend.app.models.document import Document, DocumentChunk
from backend.app.schemas.tools import DashboardStatsResponse

router = APIRouter(prefix="/settings", tags=["Settings & Stats"])


class ProviderConfigRequest(BaseModel):
    ai_provider: Optional[str] = None
    openai_api_key: Optional[str] = None
    openai_model: Optional[str] = None
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None
    embedding_provider: Optional[str] = None
    chunk_size_tokens: Optional[int] = None
    top_k_retrieval: Optional[int] = None


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Fetch high-level metrics for the user dashboard.
    """
    total_docs = db.query(Document).count()
    ready_docs = db.query(Document).filter(Document.status == "READY").count()
    total_convs = db.query(Conversation).count()
    total_chunks = db.query(DocumentChunk).count()

    return DashboardStatsResponse(
        total_documents=total_docs,
        ready_documents=ready_docs,
        total_conversations=total_convs,
        total_chunks=total_chunks,
        ai_provider=settings.AI_PROVIDER,
        embedding_provider=settings.EMBEDDING_PROVIDER,
    )


@router.get("/config")
def get_current_config() -> Dict:
    """
    Returns non-sensitive configuration parameters.
    """
    return {
        "app_name": settings.APP_NAME,
        "app_env": settings.APP_ENV,
        "ai_provider": settings.AI_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "openai_configured": bool(settings.OPENAI_API_KEY),
        "openai_model": settings.OPENAI_MODEL,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "gemini_model": settings.GEMINI_MODEL,
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "ollama_model": settings.OLLAMA_MODEL,
        "chunk_size_tokens": settings.CHUNK_SIZE_TOKENS,
        "chunk_overlap_tokens": settings.CHUNK_OVERLAP_TOKENS,
        "top_k_retrieval": settings.TOP_K_RETRIEVAL,
        "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
    }


@router.post("/config")
def update_config(req: ProviderConfigRequest) -> Dict:
    """
    Allows user to switch active AI provider, model, or set API keys at runtime.
    """
    if req.ai_provider:
        settings.AI_PROVIDER = req.ai_provider
    if req.openai_api_key:
        settings.OPENAI_API_KEY = req.openai_api_key
    if req.openai_model:
        settings.OPENAI_MODEL = req.openai_model
    if req.gemini_api_key:
        settings.GEMINI_API_KEY = req.gemini_api_key
    if req.gemini_model:
        settings.GEMINI_MODEL = req.gemini_model
    if req.ollama_base_url:
        settings.OLLAMA_BASE_URL = req.ollama_base_url
    if req.ollama_model:
        settings.OLLAMA_MODEL = req.ollama_model
    if req.embedding_provider:
        settings.EMBEDDING_PROVIDER = req.embedding_provider
    if req.chunk_size_tokens:
        settings.CHUNK_SIZE_TOKENS = req.chunk_size_tokens
    if req.top_k_retrieval:
        settings.TOP_K_RETRIEVAL = req.top_k_retrieval

    return {"message": "Configuration updated successfully", "active_provider": settings.AI_PROVIDER}
