"""
Private Docs AI - Document Tools API Endpoints (Topics, Questions, Translation)
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.tools import (
    TopicsListResponse,
    QuestionGenerateRequest,
    QuestionsListResponse,
    TranslationRequest,
    TranslationResponse,
)
from backend.app.services.topic_service import TopicService
from backend.app.services.question_service import QuestionService
from backend.app.services.translation_service import TranslationService

router = APIRouter(prefix="/tools", tags=["AI Tools"])


@router.post("/topics/{document_id}", response_model=TopicsListResponse)
async def extract_topics(document_id: str, db: Session = Depends(get_db)):
    """
    Analyze document to extract high-impact topics, importance ratings, and page citations.
    """
    service = TopicService(db)
    return await service.extract_topics(document_id)


@router.post("/questions/{document_id}", response_model=QuestionsListResponse)
async def generate_questions(
    document_id: str,
    request: QuestionGenerateRequest,
    db: Session = Depends(get_db),
):
    """
    Generate study questions (MCQs, Short/Long Answers, Interview/Viva, Flashcards) with answers and source pages.
    """
    service = QuestionService(db)
    return await service.generate_questions(
        document_id=document_id,
        question_type=request.question_type,
        difficulty=request.difficulty,
        count=request.count,
    )


@router.post("/translate", response_model=TranslationResponse)
async def translate_content(request: TranslationRequest):
    """
    Translate text, summaries, or chat responses to Hindi, Punjabi, English, or other supported languages.
    """
    service = TranslationService()
    return await service.translate(request)
