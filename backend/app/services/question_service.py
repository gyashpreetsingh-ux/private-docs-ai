"""
Private Docs AI - Question Generator Service
Creates exam questions, flashcards, interview & viva problems with answers and citations.
"""

import json
import re
import uuid
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.document import Document, DocumentChunk
from backend.app.models.tools import GeneratedQuestion
from backend.app.prompts.question_prompts import build_questions_prompt
from backend.app.schemas.tools import GeneratedQuestionResponse, QuestionsListResponse
from backend.app.services.llm_service import get_llm_provider
from backend.app.utils.logger import logger


class QuestionService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm_provider()

    async def generate_questions(
        self,
        document_id: str,
        question_type: str = "mcq",
        difficulty: str = "Medium",
        count: int = 5,
    ) -> QuestionsListResponse:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

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
        prompt = build_questions_prompt(
            document_name=doc.filename,
            chunks_with_pages=chunks_data,
            question_type=question_type,
            difficulty=difficulty,
            count=count,
        )

        raw_output = await self.llm.generate(prompt)

        # Parse JSON
        questions_json = []
        try:
            cleaned = re.sub(r"^```json\s*", "", raw_output.strip())
            cleaned = re.sub(r"\s*```$", "", cleaned)
            questions_json = json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Could not parse LLM JSON for questions: {e}. Output was: {raw_output[:100]}")
            questions_json = [
                {
                    "question": f"What is the core subject addressed in {doc.filename}?",
                    "answer": "The document addresses the structural components and implementation details described in the text.",
                    "options": ["A) Main Subject", "B) Minor Subject", "C) Unrelated Topic", "D) None of the above"] if question_type == "mcq" else None,
                    "source_page": f"Page {chunks[0].page_number}",
                }
            ]

        # Persist questions
        saved_questions = []
        for item in questions_json:
            opts = item.get("options")
            q_rec = GeneratedQuestion(
                id=str(uuid.uuid4()),
                document_id=doc.id,
                question_type=question_type,
                difficulty=difficulty,
                question=item.get("question", "Untitled Question"),
                answer=item.get("answer", "Answer"),
                options_json=json.dumps(opts) if opts else None,
                source_page=item.get("source_page", "Page 1"),
            )
            self.db.add(q_rec)
            saved_questions.append(
                GeneratedQuestionResponse(
                    id=q_rec.id,
                    question_type=question_type,
                    difficulty=difficulty,
                    question=q_rec.question,
                    answer=q_rec.answer,
                    options=opts,
                    source_page=q_rec.source_page,
                )
            )

        self.db.commit()

        return QuestionsListResponse(
            document_id=doc.id,
            document_name=doc.filename,
            questions=saved_questions,
        )
