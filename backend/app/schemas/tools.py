"""
Private Docs AI - Pydantic Schemas for AI Tools (Summaries, Topics, Questions, Translation, Search)
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# --- SUMMARY SCHEMAS ---
class SummaryRequest(BaseModel):
    summary_type: str = Field("detailed", description="one_line | short | detailed | chapter_wise | takeaways | definitions")


class SummaryResponse(BaseModel):
    document_id: str
    document_name: str
    summary_type: str
    content: str
    created_at: datetime


class SummaryExportRequest(BaseModel):
    format: str = Field("markdown", description="markdown | txt")
    content: str
    filename: Optional[str] = "summary"


# --- IMPORTANT TOPICS SCHEMAS ---
class ImportantTopicResponse(BaseModel):
    id: Optional[str] = None
    topic: str
    importance: str  # High | Medium | Low
    why_it_matters: str
    relevant_pages: Optional[str] = None


class TopicsListResponse(BaseModel):
    document_id: str
    document_name: str
    topics: List[ImportantTopicResponse]


# --- QUESTION GENERATOR SCHEMAS ---
class GeneratedQuestionResponse(BaseModel):
    id: Optional[str] = None
    question_type: str  # mcq | short_answer | long_answer | interview | viva | flashcard
    difficulty: str     # Easy | Medium | Hard
    question: str
    answer: str
    options: Optional[List[str]] = None
    source_page: Optional[str] = None


class QuestionGenerateRequest(BaseModel):
    question_type: str = Field("mcq", description="mcq | short_answer | long_answer | interview | viva | flashcard")
    difficulty: str = Field("Medium", description="Easy | Medium | Hard")
    count: int = Field(5, ge=1, le=20)


class QuestionsListResponse(BaseModel):
    document_id: str
    document_name: str
    questions: List[GeneratedQuestionResponse]


# --- TRANSLATION SCHEMAS ---
class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1)
    target_language: str = Field("Hindi", description="Hindi | Punjabi | English | etc.")
    source_language: Optional[str] = "English"


class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str
    source_language: str


# --- SEARCH SCHEMAS ---
class SearchResultItem(BaseModel):
    document_id: str
    filename: str
    page_number: int
    chunk_index: int
    snippet: str
    score: Optional[float] = None
    match_type: str = "semantic"  # semantic | metadata | exact


class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchResultItem]


# --- DASHBOARD & SYSTEM SCHEMAS ---
class DashboardStatsResponse(BaseModel):
    total_documents: int
    ready_documents: int
    total_conversations: int
    total_chunks: int
    ai_provider: str
    embedding_provider: str
