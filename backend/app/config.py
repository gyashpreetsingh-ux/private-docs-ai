"""
Private Docs AI - Application Configuration
Centralized settings management using Pydantic Settings.
Loads environment variables safely without hardcoded secrets.
"""

from pathlib import Path
from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Project Root Directory (one level above backend/)
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application Mode
    APP_NAME: str = "Private Docs AI"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_PREFIX: str = "/api"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # AI Provider Selection: "openai" | "gemini" | "ollama" | "fallback"
    AI_PROVIDER: str = "fallback"

    # OpenAI Settings
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Google Gemini Settings
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Ollama / Local LLM Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # Embedding Settings: "local" | "openai" | "gemini"
    EMBEDDING_PROVIDER: str = "local"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"

    # Storage Paths
    DATABASE_URL: str = f"sqlite:///{PROJECT_ROOT / 'data' / 'app.db'}"
    CHROMA_PATH: str = str(PROJECT_ROOT / "data" / "chroma")
    UPLOAD_DIR: str = str(PROJECT_ROOT / "data" / "uploads")
    EXPORT_DIR: str = str(PROJECT_ROOT / "data" / "exports")

    # Document Processing Parameters
    MAX_FILE_SIZE_MB: int = 25
    CHUNK_SIZE_TOKENS: int = 600
    CHUNK_OVERLAP_TOKENS: int = 100
    TOP_K_RETRIEVAL: int = 6

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS_ORIGINS string into a list of origins."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def max_file_size_bytes(self) -> int:
        """Convert MAX_FILE_SIZE_MB to bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    def ensure_directories(self) -> None:
        """Ensure all storage folders exist on disk."""
        Path(self.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
        Path(self.CHROMA_PATH).mkdir(parents=True, exist_ok=True)
        Path(self.EXPORT_DIR).mkdir(parents=True, exist_ok=True)
        # Ensure database directory exists if using sqlite
        if self.DATABASE_URL.startswith("sqlite:///"):
            db_path = Path(self.DATABASE_URL.replace("sqlite:///", ""))
            db_path.parent.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_directories()
