"""
Private Docs AI - API Routers Re-exports
"""

from backend.app.api.documents import router as documents_router
from backend.app.api.chat import router as chat_router
from backend.app.api.summaries import router as summaries_router
from backend.app.api.tools import router as tools_router
from backend.app.api.search import router as search_router
from backend.app.api.settings_api import router as settings_router

__all__ = [
    "documents_router",
    "chat_router",
    "summaries_router",
    "tools_router",
    "search_router",
    "settings_router",
]
