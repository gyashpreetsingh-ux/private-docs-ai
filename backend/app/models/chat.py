"""
Private Docs AI - User & Chat Database Models
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(64), unique=True, nullable=False, default="local_user")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), default="New Conversation", nullable=False)
    selected_doc_ids = Column(Text, nullable=True)  # Comma-separated or JSON list of active doc IDs
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(32), nullable=False)  # "user" | "assistant" | "system"
    content = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True)  # JSON array of cited sources: [{doc_id, filename, page, text}]
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
