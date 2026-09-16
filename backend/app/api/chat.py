"""
Private Docs AI - Chat & Conversation API Endpoints
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationResponse,
    ConversationCreate,
    ConversationUpdate,
    ConversationDetailResponse,
)
from backend.app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat & Conversations"])


@router.post("", response_model=ChatResponse)
async def chat_message(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Send a message to the AI assistant with selected document context.
    Returns grounded answer and verified source citations.
    """
    service = ChatService(db)
    return await service.chat(request)


@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(db: Session = Depends(get_db)):
    """
    List all chat conversations with metadata and message counts.
    """
    service = ChatService(db)
    return service.list_conversations()


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(request: ConversationCreate, db: Session = Depends(get_db)):
    """
    Create a new conversation session.
    """
    service = ChatService(db)
    conv = service.create_conversation(title=request.title, selected_doc_ids=request.selected_doc_ids)
    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        selected_doc_ids=request.selected_doc_ids or [],
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        message_count=0,
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full message history and citations for a conversation.
    """
    service = ChatService(db)
    detail = service.get_conversation_detail(conversation_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return detail


@router.put("/conversations/{conversation_id}", response_model=ConversationResponse)
def update_conversation(conversation_id: str, request: ConversationUpdate, db: Session = Depends(get_db)):
    """
    Rename conversation or update active selected document filters.
    """
    service = ChatService(db)
    updated = service.update_conversation(
        conversation_id=conversation_id,
        title=request.title,
        selected_doc_ids=request.selected_doc_ids,
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    import json
    return ConversationResponse(
        id=updated.id,
        title=updated.title,
        selected_doc_ids=json.loads(updated.selected_doc_ids) if updated.selected_doc_ids else [],
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_200_OK)
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """
    Delete a conversation and all its messages.
    """
    service = ChatService(db)
    success = service.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}
