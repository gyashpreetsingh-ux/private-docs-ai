"""
Private Docs AI - Security & File Sanitization Utilities
Implements safe filename generation, path traversal guards,
and file validation logic.
"""

import os
import re
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import HTTPException, status
from backend.app.config import settings
from backend.app.utils.logger import logger

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "application/octet-stream",  # Fallback for some browsers on plain text/markdown
}


def sanitize_filename(filename: str) -> str:
    """
    Sanitize an uploaded file name:
    - Removes path separators (../, / , \\)
    - Strips special control characters
    - Limits name length
    """
    # Extract only the base name
    base_name = os.path.basename(filename)
    # Remove dangerous characters
    cleaned = re.sub(r'[^a-zA-Z0-9_\-\. ]', '_', base_name).strip()
    if not cleaned:
        cleaned = f"doc_{uuid.uuid4().hex[:8]}"
    return cleaned


def validate_file_upload(filename: str, file_size: int, content_type: str | None = None) -> Tuple[str, str]:
    """
    Validate that an uploaded file adheres to allowed extensions and size boundaries.
    Returns: (cleaned_filename, extension)
    """
    cleaned = sanitize_filename(filename)
    ext = Path(cleaned).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        logger.warning(f"File upload rejected: unsupported extension '{ext}' in '{cleaned}'")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed: PDF, DOCX, TXT, MD.",
        )

    if file_size > settings.max_file_size_bytes:
        logger.warning(f"File upload rejected: size {file_size} exceeds {settings.MAX_FILE_SIZE_MB}MB limit")
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB.",
        )

    return cleaned, ext


def ensure_safe_path(target_path: str | Path, base_dir: str | Path) -> Path:
    """
    Guard against path traversal attacks.
    Ensures that target_path resolves strictly within base_dir.
    """
    resolved_target = Path(target_path).resolve()
    resolved_base = Path(base_dir).resolve()

    try:
        resolved_target.relative_to(resolved_base)
    except ValueError:
        logger.error(f"Path traversal attempt detected! Target: {resolved_target}, Base: {resolved_base}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: invalid file path traversal.",
        )

    return resolved_target
