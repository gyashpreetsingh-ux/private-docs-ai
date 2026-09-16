"""
Private Docs AI - Document Summary Service
Generates one-line, executive, detailed, chapter-wise, takeaways, and terminology summaries.
Supports exporting summaries to markdown and plain text files.
"""

import uuid
from pathlib import Path
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.config import settings
from backend.app.models.document import Document, DocumentChunk
from backend.app.models.tools import GeneratedSummary
from backend.app.prompts.summary_prompts import build_summary_prompt
from backend.app.schemas.tools import SummaryResponse
from backend.app.services.llm_service import get_llm_provider
from backend.app.utils.logger import logger


class SummaryService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm_provider()

    async def generate_summary(self, document_id: str, summary_type: str = "detailed") -> SummaryResponse:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        # Load chunks
        chunks = (
            self.db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index.asc())
            .all()
        )

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document has no text chunks. Please ensure it was processed.",
            )

        # Assemble corpus (capping at ~12,000 characters to fit standard LLM context)
        corpus_parts = []
        char_total = 0
        for c in chunks:
            corpus_parts.append(f"[Page {c.page_number}] {c.text}")
            char_total += len(c.text)
            if char_total > 15000:
                break

        full_corpus = "\n\n".join(corpus_parts)

        # Build prompt
        prompt = build_summary_prompt(
            document_name=doc.filename,
            document_text=full_corpus,
            summary_type=summary_type,
        )

        # Generate summary
        summary_content = await self.llm.generate(prompt)

        # Save to database
        record = GeneratedSummary(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            summary_type=summary_type,
            content=summary_content,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)

        return SummaryResponse(
            document_id=doc.id,
            document_name=doc.filename,
            summary_type=summary_type,
            content=summary_content,
            created_at=record.created_at,
        )

    def export_summary(self, content: str, filename: str, export_format: str = "markdown") -> Path:
        """
        Saves summary to data/exports/ as .md or .txt
        """
        ext = ".md" if export_format.lower() == "markdown" else ".txt"
        safe_name = f"{filename}_{uuid.uuid4().hex[:6]}{ext}"
        export_path = Path(settings.EXPORT_DIR) / safe_name
        with open(export_path, "w", encoding="utf-8") as f:
            f.write(content)
        return export_path
