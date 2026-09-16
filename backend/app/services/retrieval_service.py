"""
Private Docs AI - RAG Retrieval Service
Coordinates vector search, multi-document filtering, context synthesis,
LLM grounding, and structured source citation extraction.
"""

from typing import Any, Dict, List, Optional, Tuple
from backend.app.config import settings
from backend.app.prompts.chat_prompts import CHAT_SYSTEM_PROMPT, build_rag_context_prompt
from backend.app.schemas.chat import SourceCitation
from backend.app.services.embedding_service import get_embedding_provider
from backend.app.services.llm_service import get_llm_provider
from backend.app.services.vector_service import get_vector_service
from backend.app.utils.logger import logger


class RetrievalService:
    def __init__(self):
        self.embedding_provider = get_embedding_provider()
        self.vector_service = get_vector_service()
        self.llm_provider = get_llm_provider()

    async def retrieve_and_generate(
        self,
        question: str,
        document_ids: Optional[List[str]] = None,
        top_k: int = settings.TOP_K_RETRIEVAL,
    ) -> Tuple[str, List[SourceCitation]]:
        """
        Executes the end-to-end RAG retrieval pipeline:
        1. Embed user query
        2. Retrieve top-k chunks matching selected document_ids
        3. Build strict anti-hallucination prompt
        4. Generate response via LLM
        5. Return answer paired with verifiable source citations
        """
        logger.info(f"RAG query received: '{question[:60]}...' for doc_ids: {document_ids}")

        # 1. Embed query
        query_vector = self.embedding_provider.embed_query(question)

        # 2. Vector search with document ID filter
        matched_chunks = self.vector_service.search(
            query_embedding=query_vector,
            top_k=top_k,
            document_ids=document_ids,
        )

        # 3. Format source citations
        sources: List[SourceCitation] = []
        seen_citations = set()

        for chunk in matched_chunks:
            citation_key = (chunk["filename"], chunk["page_number"])
            if citation_key not in seen_citations:
                seen_citations.add(citation_key)
                snippet = chunk["text"][:220] + "..." if len(chunk["text"]) > 220 else chunk["text"]
                sources.append(
                    SourceCitation(
                        document_id=chunk["document_id"],
                        filename=chunk["filename"],
                        page_number=chunk["page_number"],
                        chunk_index=chunk["chunk_index"],
                        text_snippet=snippet,
                        relevance_score=round(1.0 - max(chunk.get("distance", 0.0), 0.0), 3),
                    )
                )

        # 4. Synthesize context prompt
        prompt = build_rag_context_prompt(question, matched_chunks)

        # 5. Invoke LLM
        answer = await self.llm_provider.generate(
            prompt=prompt,
            system_prompt=CHAT_SYSTEM_PROMPT,
        )

        return answer, sources
