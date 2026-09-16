"""
Private Docs AI - Document Management API Endpoints
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.document import (
    DocumentResponse,
    DocumentUploadResponse,
    DocumentProcessResponse,
    DocumentChunkResponse,
)
from backend.app.models.document import DocumentChunk
from backend.app.services.document_service import DocumentService
from backend.app.utils.logger import logger

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a document (PDF, DOCX, TXT, MD) and enqueue background ingestion.
    """
    service = DocumentService(db)
    doc = await service.save_upload(file)

    # Trigger background ingestion pipeline (non-blocking)
    background_tasks.add_task(service.process_document, doc.id)

    return DocumentUploadResponse(
        message=f"Document '{doc.filename}' uploaded successfully. Processing started in background.",
        document=DocumentResponse.model_validate(doc),
    )


@router.get("", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    """
    List all uploaded documents with metadata, page count, chunk count, and processing status.
    """
    service = DocumentService(db)
    docs = service.list_documents()
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    """
    Retrieve document details and processing status by ID.
    """
    service = DocumentService(db)
    doc = service.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentResponse.model_validate(doc)


@router.get("/{document_id}/chunks", response_model=List[DocumentChunkResponse])
def get_document_chunks(document_id: str, db: Session = Depends(get_db)):
    """
    Retrieve all chunks and page numbers for a document.
    """
    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index.asc())
        .all()
    )
    return [DocumentChunkResponse.model_validate(c) for c in chunks]


@router.post("/{document_id}/process", response_model=DocumentProcessResponse)
def reprocess_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Manually re-trigger processing for a document.
    """
    service = DocumentService(db)
    doc = service.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    background_tasks.add_task(service.process_document, doc.id)
    return DocumentProcessResponse(
        message=f"Processing queued for '{doc.filename}'",
        document_id=doc.id,
        status="PROCESSING",
    )


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """
    Permanently delete a document, its physical file, database records, and ChromaDB vector embeddings.
    """
    service = DocumentService(db)
    success = service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return {"message": "Document and all associated data permanently deleted."}
