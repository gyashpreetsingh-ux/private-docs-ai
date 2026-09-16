"""
Private Docs AI - Document & Chunk Database Models
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(32), nullable=False)  # pdf, docx, txt, md
    file_size = Column(Integer, nullable=False)     # in bytes
    upload_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(32), default="UPLOADING", nullable=False)  # UPLOADING, PROCESSING, READY, FAILED
    page_count = Column(Integer, default=0, nullable=False)
    chunk_count = Column(Integer, default=0, nullable=False)
    storage_path = Column(String(512), nullable=False)
    error_message = Column(Text, nullable=True)
    is_scanned = Column(Boolean, default=False, nullable=False)

    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    summaries = relationship("GeneratedSummary", back_populates="document", cascade="all, delete-orphan")
    topics = relationship("ImportantTopic", back_populates="document", cascade="all, delete-orphan")
    questions = relationship("GeneratedQuestion", back_populates="document", cascade="all, delete-orphan")
    jobs = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    page_number = Column(Integer, default=1, nullable=False)
    metadata_json = Column(Text, nullable=True)  # JSON metadata: char_count, headings, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="chunks")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default="PENDING", nullable=False)  # PENDING, RUNNING, COMPLETED, FAILED
    step = Column(String(64), default="QUEUED", nullable=False)
    error = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    document = relationship("Document", back_populates="jobs")
