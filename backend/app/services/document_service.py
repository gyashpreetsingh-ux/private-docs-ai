"""
Private Docs AI - Document Management Service
Orchestrates file uploads, background ingestion pipeline,
ChromaDB vectorization, metadata persistence, and cascading deletion.
"""

import os
import shutil
import uuid
from pathlib import Path
from typing import List, Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.models.document import Document, DocumentChunk, ProcessingJob
from backend.app.services.pdf_service import PDFService
from backend.app.services.docx_service import DOCXService
from backend.app.services.text_service import TextService
from backend.app.services.ocr_service import OCRService
from backend.app.services.chunking_service import ChunkingService
from backend.app.services.embedding_service import get_embedding_provider
from backend.app.services.vector_service import get_vector_service
from backend.app.utils.logger import logger
from backend.app.utils.security import sanitize_filename, validate_file_upload, ensure_safe_path


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.chunking_service = ChunkingService()
        self.embedding_provider = get_embedding_provider()
        self.vector_service = get_vector_service()
        self.ocr_service = OCRService()

    async def save_upload(self, file: UploadFile) -> Document:
        """
        Validates and saves an uploaded file to data/uploads/, creating a Document record.
        """
        cleaned_filename, ext = validate_file_upload(
            filename=file.filename or "unnamed_doc",
            file_size=file.size or 0,
            content_type=file.content_type,
        )

        doc_id = str(uuid.uuid4())
        safe_disk_name = f"{doc_id}_{cleaned_filename}"
        storage_path = ensure_safe_path(
            Path(settings.UPLOAD_DIR) / safe_disk_name,
            settings.UPLOAD_DIR,
        )

        # Stream save file to disk
        file_size = 0
        with open(storage_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                file_size += len(chunk)
                if file_size > settings.max_file_size_bytes:
                    buffer.close()
                    if storage_path.exists():
                        storage_path.unlink()
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB}MB.",
                    )
                buffer.write(chunk)

        # Create database record
        doc = Document(
            id=doc_id,
            filename=cleaned_filename,
            original_filename=file.filename or cleaned_filename,
            file_type=ext.replace(".", "").lower(),
            file_size=file_size,
            status="UPLOADING",
            storage_path=str(storage_path),
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)

        logger.info(f"Saved document '{cleaned_filename}' (ID: {doc_id}, Size: {file_size} bytes).")
        return doc

    def process_document(self, document_id: str) -> None:
        """
        Background ingestion pipeline:
        1. Extract text page-by-page
        2. Clean & segment into chunks
        3. Persist chunks to relational DB
        4. Generate embeddings
        5. Index into ChromaDB
        6. Transition status to READY
        """
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.error(f"Cannot process document: {document_id} not found.")
            return

        job = ProcessingJob(document_id=document_id, status="RUNNING", step="EXTRACTING")
        self.db.add(job)
        doc.status = "PROCESSING"
        self.db.commit()

        try:
            file_path = Path(doc.storage_path)
            ext = doc.file_type.lower()

            logger.info(f"Processing document '{doc.filename}' ({ext})...")

            # 1. Extraction
            if ext == "pdf":
                pages_data, page_count, is_scanned = PDFService.extract_text(file_path)
            elif ext == "docx":
                pages_data, page_count, is_scanned = DOCXService.extract_text(file_path)
            elif ext in ("txt", "md"):
                pages_data, page_count, is_scanned = TextService.extract_text(file_path)
            else:
                raise ValueError(f"Unsupported file type '{ext}'")

            doc.page_count = page_count
            doc.is_scanned = is_scanned

            if is_scanned:
                logger.warning(f"Document {doc.filename} appears to be scanned or empty.")
                doc.error_message = "Scanned PDF - OCR required for reliable search and Q&A."

            # 2. Chunking
            job.step = "CHUNKING"
            self.db.commit()

            raw_chunks = self.chunking_service.chunk_document_pages(
                document_id=doc.id,
                filename=doc.filename,
                pages_data=pages_data,
            )

            # 3. Store chunks in database
            db_chunks: List[DocumentChunk] = []
            for c in raw_chunks:
                chunk_obj = DocumentChunk(
                    id=str(uuid.uuid4()),
                    document_id=doc.id,
                    chunk_index=c["chunk_index"],
                    text=c["text"],
                    page_number=c["page_number"],
                    metadata_json=c["metadata"],
                )
                db_chunks.append(chunk_obj)

            self.db.bulk_save_objects(db_chunks)
            doc.chunk_count = len(db_chunks)
            self.db.commit()

            # 4. Generate embeddings and index in ChromaDB
            if raw_chunks:
                job.step = "EMBEDDING"
                self.db.commit()

                chunk_texts = [c["text"] for c in raw_chunks]
                embeddings = self.embedding_provider.embed_documents(chunk_texts)

                # Prepare payload for Chroma
                chroma_payload = []
                for i, c in enumerate(raw_chunks):
                    chroma_payload.append({
                        "id": db_chunks[i].id,
                        "document_id": doc.id,
                        "filename": doc.filename,
                        "chunk_index": c["chunk_index"],
                        "page_number": c["page_number"],
                        "text": c["text"],
                    })

                self.vector_service.add_chunks(chroma_payload, embeddings)

            # 5. Complete
            doc.status = "READY"
            job.status = "COMPLETED"
            job.step = "DONE"
            self.db.commit()
            logger.info(f"Document '{doc.filename}' processed successfully: {doc.chunk_count} chunks ready.")

        except Exception as e:
            logger.error(f"Failed to process document {doc.filename}: {str(e)}")
            doc.status = "FAILED"
            doc.error_message = f"Processing error: {str(e)}"
            job.status = "FAILED"
            job.error = str(e)
            self.db.commit()

    def get_document(self, document_id: str) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == document_id).first()

    def list_documents(self) -> List[Document]:
        return self.db.query(Document).order_by(Document.upload_date.desc()).all()

    def delete_document(self, document_id: str) -> bool:
        """
        Cascading deletion:
        1. Remove ChromaDB vectors
        2. Delete physical file from disk
        3. Delete document row from DB (cascades to chunks, summaries, topics, questions)
        """
        doc = self.get_document(document_id)
        if not doc:
            return False

        logger.info(f"Initiating full cascading deletion for document '{doc.filename}' (ID: {document_id})...")

        # 1. Purge from ChromaDB
        self.vector_service.delete_document_chunks(document_id)

        # 2. Remove file from storage
        try:
            if doc.storage_path and os.path.exists(doc.storage_path):
                os.remove(doc.storage_path)
                logger.info(f"Deleted physical file at {doc.storage_path}")
        except Exception as e:
            logger.warning(f"Could not remove physical file for doc {document_id}: {e}")

        # 3. Delete from database
        self.db.delete(doc)
        self.db.commit()
        logger.info(f"Document {document_id} and all relational associations deleted.")
        return True
