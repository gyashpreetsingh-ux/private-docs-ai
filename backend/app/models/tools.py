"""
Private Docs AI - AI Document Tools Models (Summaries, Topics, Questions)
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class GeneratedSummary(Base):
    __tablename__ = "generated_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    summary_type = Column(String(64), nullable=False)  # "one_line", "short", "detailed", "chapter_wise", "takeaways", "definitions"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="summaries")


class ImportantTopic(Base):
    __tablename__ = "important_topics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    importance = Column(String(32), default="High", nullable=False)  # "High", "Medium", "Low"
    why_it_matters = Column(Text, nullable=False)
    relevant_pages = Column(String(64), nullable=True)  # e.g. "12-18" or "4"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="topics")


class GeneratedQuestion(Base):
    __tablename__ = "generated_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    question_type = Column(String(64), nullable=False)  # "mcq", "short_answer", "long_answer", "interview", "viva", "flashcard"
    difficulty = Column(String(32), default="Medium", nullable=False)  # "Easy", "Medium", "Hard"
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    options_json = Column(Text, nullable=True)  # JSON array for MCQs: ["A", "B", "C", "D"]
    source_page = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="questions")
