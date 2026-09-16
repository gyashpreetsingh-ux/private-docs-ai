"""
Private Docs AI - Multi-Language Translation Service
Translates text, summaries, and chat answers to Hindi, Punjabi, English, etc.
"""

from backend.app.prompts.translation_prompts import build_translation_prompt
from backend.app.schemas.tools import TranslationRequest, TranslationResponse
from backend.app.services.llm_service import get_llm_provider
from backend.app.utils.logger import logger

# Supported language catalog (extensible)
SUPPORTED_LANGUAGES = {
    "Hindi": "हिन्दी",
    "Punjabi": "ਪੰਜਾਬੀ",
    "English": "English",
    "Spanish": "Español",
    "French": "Français",
    "German": "Deutsch",
}


class TranslationService:
    def __init__(self):
        self.llm = get_llm_provider()

    async def translate(self, request: TranslationRequest) -> TranslationResponse:
        logger.info(f"Translating text ({len(request.text)} chars) to {request.target_language}...")
        prompt = build_translation_prompt(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language or "English",
        )

        translated = await self.llm.generate(prompt)

        return TranslationResponse(
            original_text=request.text,
            translated_text=translated.strip(),
            target_language=request.target_language,
            source_language=request.source_language or "English",
        )
