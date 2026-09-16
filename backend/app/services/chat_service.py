"""
Private Docs AI - Chat & Conversation Management Service
Handles multi-turn conversation persistence, context routing,
and RAG response generation.
"""

import json
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models.chat import Conversation, Message
from backend.app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationResponse,
    ConversationDetailResponse,
    MessageResponse,
    SourceCitation,
)
from backend.app.services.retrieval_service import RetrievalService
from backend.app.utils.logger import logger


class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.retrieval_service = RetrievalService()

    def create_conversation(
        self,
        title: Optional[str] = "New Conversation",
        selected_doc_ids: Optional[List[str]] = None,
    ) -> Conversation:
        conv = Conversation(
            id=str(uuid.uuid4()),
            title=title or "New Conversation",
            selected_doc_ids=json.dumps(selected_doc_ids or []),
        )
        self.db.add(conv)
        self.db.commit()
        self.db.refresh(conv)
        return conv

    def list_conversations(self) -> List[ConversationResponse]:
        conversations = self.db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
        results = []
        for c in conversations:
            selected_docs = json.loads(c.selected_doc_ids) if c.selected_doc_ids else []
            msg_count = self.db.query(Message).filter(Message.conversation_id == c.id).count()
            results.append(
                ConversationResponse(
                    id=c.id,
                    title=c.title,
                    selected_doc_ids=selected_docs,
                    created_at=c.created_at,
                    updated_at=c.updated_at,
                    message_count=msg_count,
                )
            )
        return results

    def get_conversation_detail(self, conversation_id: str) -> Optional[ConversationDetailResponse]:
        conv = self.db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            return None

        selected_docs = json.loads(conv.selected_doc_ids) if conv.selected_doc_ids else []
        db_messages = self.db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()

        messages = []
        for m in db_messages:
            sources = []
            if m.sources_json:
                try:
                    raw_sources = json.loads(m.sources_json)
                    sources = [SourceCitation(**s) for s in raw_sources]
                except Exception:
                    sources = []
            messages.append(
                MessageResponse(
                    id=m.id,
                    conversation_id=m.conversation_id,
                    role=m.role,
                    content=m.content,
                    sources=sources,
                    created_at=m.created_at,
                )
            )

        return ConversationDetailResponse(
            id=conv.id,
            title=conv.title,
            selected_doc_ids=selected_docs,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            messages=messages,
        )

    def delete_conversation(self, conversation_id: str) -> bool:
        conv = self.db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            return False
        self.db.delete(conv)
        self.db.commit()
        return True

    def update_conversation(
        self, conversation_id: str, title: Optional[str] = None, selected_doc_ids: Optional[List[str]] = None
    ) -> Optional[Conversation]:
        conv = self.db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            return None
        if title is not None:
            conv.title = title
        if selected_doc_ids is not None:
            conv.selected_doc_ids = json.dumps(selected_doc_ids)
        self.db.commit()
        self.db.refresh(conv)
        return conv

    async def chat(self, request: ChatRequest) -> ChatResponse:
        """
        Execute RAG conversation turn:
        1. Obtain or create conversation
        2. Persist user message
        3. Execute vector search and context assembly
        4. Generate grounded LLM response
        5. Persist assistant response with verified sources
        """
        # Ensure conversation exists
        if request.conversation_id:
            conv = self.db.query(Conversation).filter(Conversation.id == request.conversation_id).first()
            if not conv:
                conv = self.create_conversation(title=request.message[:40], selected_doc_ids=request.document_ids)
        else:
            conv = self.create_conversation(title=request.message[:40], selected_doc_ids=request.document_ids)

        # Update title if it's currently generic
        if conv.title in ("New Conversation", "New Chat") and request.message:
            conv.title = request.message[:35].strip() + ("..." if len(request.message) > 35 else "")

        # 1. Save user message
        user_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conv.id,
            role="user",
            content=request.message,
        )
        self.db.add(user_msg)
        self.db.commit()

        # 2. Retrieve context & generate answer
        doc_ids = request.document_ids
        if not doc_ids and conv.selected_doc_ids:
            try:
                parsed_ids = json.loads(conv.selected_doc_ids)
                if parsed_ids:
                    doc_ids = parsed_ids
            except Exception:
                pass

        answer, sources = await self.retrieval_service.retrieve_and_generate(
            question=request.message,
            document_ids=doc_ids,
        )

        # 3. Save assistant message
        sources_dicts = [s.model_dump() for s in sources]
        assistant_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conv.id,
            role="assistant",
            content=answer,
            sources_json=json.dumps(sources_dicts),
        )
        self.db.add(assistant_msg)
        self.db.commit()

        return ChatResponse(
            conversation_id=conv.id,
            user_message_id=user_msg.id,
            assistant_message_id=assistant_msg.id,
            answer=answer,
            sources=sources,
        )
