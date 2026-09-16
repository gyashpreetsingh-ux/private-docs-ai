"""
Private Docs AI - Important Topics Extraction Service
Extracts high-impact topics, importance ratings, justifications, and page numbers.
"""

import json
import re
import uuid
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.document import Document, DocumentChunk
from backend.app.models.tools import ImportantTopic
from backend.app.prompts.topic_prompts import build_topics_prompt
from backend.app.schemas.tools import ImportantTopicResponse, TopicsListResponse
from backend.app.services.llm_service import get_llm_provider
from backend.app.utils.logger import logger


class TopicService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm_provider()

    async def extract_topics(self, document_id: str) -> TopicsListResponse:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        # Check if already generated
        existing = (
            self.db.query(ImportantTopic)
            .filter(ImportantTopic.document_id == document_id)
            .all()
        )
        if existing:
            return TopicsListResponse(
                document_id=doc.id,
                document_name=doc.filename,
                topics=[
                    ImportantTopicResponse(
                        id=t.id,
                        topic=t.topic,
                        importance=t.importance,
                        why_it_matters=t.why_it_matters,
                        relevant_pages=t.relevant_pages,
                    )
                    for t in existing
                ],
            )

        chunks = (
            self.db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index.asc())
            .limit(30)
            .all()
        )

        if not chunks:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document has no content")

        chunks_data = [{"page_number": c.page_number, "text": c.text} for c in chunks]
        prompt = build_topics_prompt(doc.filename, chunks_data)

        raw_output = await self.llm.generate(prompt)

        # Parse JSON output robustly
        topics_json = []
        try:
            # Clean markdown code block if present
            cleaned = re.sub(r"^```json\s*", "", raw_output.strip())
            cleaned = re.sub(r"\s*```$", "", cleaned)
            topics_json = json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Could not parse LLM JSON for topics: {e}. Output was: {raw_output[:100]}")
            topics_json = [
                {
                    "topic": "Key Subject Matter",
                    "importance": "High",
                    "why_it_matters": "Central discussion topic from the document.",
                    "relevant_pages": f"Page {chunks[0].page_number}",
                }
            ]

        # Save to database
        saved_topics = []
        for item in topics_json:
            topic_record = ImportantTopic(
                id=str(uuid.uuid4()),
                document_id=doc.id,
                topic=item.get("topic", "Key Concept"),
                importance=item.get("importance", "High"),
                why_it_matters=item.get("why_it_matters", ""),
                relevant_pages=str(item.get("relevant_pages", "1")),
            )
            self.db.add(topic_record)
            saved_topics.append(
                ImportantTopicResponse(
                    id=topic_record.id,
                    topic=topic_record.topic,
                    importance=topic_record.importance,
                    why_it_matters=topic_record.why_it_matters,
                    relevant_pages=topic_record.relevant_pages,
                )
            )

        self.db.commit()

        return TopicsListResponse(
            document_id=doc.id,
            document_name=doc.filename,
            topics=saved_topics,
        )
