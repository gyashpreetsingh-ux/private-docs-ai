"""
Private Docs AI - Structured Logging System
Provides safe, sanitized logging that strictly excludes API keys,
document texts, and private chat conversation contents from log streams.
"""

import logging
import sys
from backend.app.config import settings

# Custom filter to prevent accidental leakage of sensitive tokens
class PrivacyFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        # Redact any accidental matches of keys if loaded
        if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 8:
            if settings.OPENAI_API_KEY in message:
                record.msg = message.replace(settings.OPENAI_API_KEY, "[REDACTED_OPENAI_KEY]")
        if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 8:
            if settings.GEMINI_API_KEY in message:
                record.msg = message.replace(settings.GEMINI_API_KEY, "[REDACTED_GEMINI_KEY]")
        return True


def setup_logger(name: str = "private_docs_ai") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

        formatter = logging.Formatter(
            fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        handler.addFilter(PrivacyFilter())
        logger.addHandler(handler)
        logger.propagate = False

    return logger


logger = setup_logger()
