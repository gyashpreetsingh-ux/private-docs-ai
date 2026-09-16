"""
Private Docs AI - Pydantic Schemas for Documents
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    file_type: str
    file_size: int


class DocumentChunkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    chunk_index: int
    page_number: int
    text: str


class DocumentResponse(DocumentBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    upload_date: datetime
    status: str
    page_count: int
    chunk_count: int
    error_message: Optional[str] = None
    is_scanned: bool = False


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentResponse


class DocumentProcessResponse(BaseModel):
    message: str
    document_id: str
    status: str
