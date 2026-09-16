"""
Private Docs AI - Pydantic Schemas for Conversations & Chat
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class SourceCitation(BaseModel):
    document_id: str
    filename: str
    page_number: int
    chunk_index: int
    text_snippet: str
    relevance_score: Optional[float] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    conversation_id: str
    role: str
    content: str
    sources: List[SourceCitation] = []
    created_at: datetime


class ConversationBase(BaseModel):
    title: str = "New Conversation"


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    selected_doc_ids: Optional[List[str]] = []


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    selected_doc_ids: Optional[List[str]] = None


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    selected_doc_ids: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime
    message_count: int = 0


class ConversationDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    selected_doc_ids: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    document_ids: Optional[List[str]] = None  # None or empty = all ready documents


class ChatResponse(BaseModel):
    conversation_id: str
    user_message_id: str
    assistant_message_id: str
    answer: str
    sources: List[SourceCitation] = []
