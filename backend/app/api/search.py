"""
Private Docs AI - Unified Document & Semantic Search API
Supports filename, metadata, full-text substring, and ChromaDB vector search.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.document import Document, DocumentChunk
from backend.app.schemas.tools import SearchResponse, SearchResultItem
from backend.app.services.embedding_service import get_embedding_provider
from backend.app.services.vector_service import get_vector_service

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
def search_documents(
    q: str = Query(..., min_length=1, description="Search term or semantic query"),
    db: Session = Depends(get_db),
):
    """
    Perform hybrid search across document titles, full-text contents, and ChromaDB semantic vectors.
    """
    results: List[SearchResultItem] = []
    seen_keys = set()

    # 1. Exact/Substring match in Document filenames
    matching_docs = db.query(Document).filter(Document.filename.ilike(f"%{q}%")).all()
    for doc in matching_docs:
        key = (doc.id, 1, 0)
        if key not in seen_keys:
            seen_keys.add(key)
            results.append(
                SearchResultItem(
                    document_id=doc.id,
                    filename=doc.filename,
                    page_number=1,
                    chunk_index=0,
                    snippet=f"Document filename match: {doc.filename} ({doc.file_type.upper()}, {doc.page_count} pages)",
                    score=1.0,
                    match_type="metadata",
                )
            )

    # 2. Substring match in DocumentChunk text
    text_chunks = (
        db.query(DocumentChunk, Document.filename)
        .join(Document, DocumentChunk.document_id == Document.id)
        .filter(DocumentChunk.text.ilike(f"%{q}%"))
        .limit(10)
        .all()
    )
    for chunk, filename in text_chunks:
        key = (chunk.document_id, chunk.page_number, chunk.chunk_index)
        if key not in seen_keys:
            seen_keys.add(key)
            snippet = chunk.text[:250] + "..." if len(chunk.text) > 250 else chunk.text
            results.append(
                SearchResultItem(
                    document_id=chunk.document_id,
                    filename=filename,
                    page_number=chunk.page_number,
                    chunk_index=chunk.chunk_index,
                    snippet=snippet,
                    score=0.9,
                    match_type="exact",
                )
            )

    # 3. Semantic Vector Search via ChromaDB
    try:
        embedding_provider = get_embedding_provider()
        vector_service = get_vector_service()
        query_vec = embedding_provider.embed_query(q)
        semantic_hits = vector_service.search(query_embedding=query_vec, top_k=8)

        for hit in semantic_hits:
            key = (hit["document_id"], hit["page_number"], hit["chunk_index"])
            if key not in seen_keys:
                seen_keys.add(key)
                score = round(1.0 - max(hit.get("distance", 0.0), 0.0), 3)
                snippet = hit["text"][:250] + "..." if len(hit["text"]) > 250 else hit["text"]
                results.append(
                    SearchResultItem(
                        document_id=hit["document_id"],
                        filename=hit["filename"],
                        page_number=hit["page_number"],
                        chunk_index=hit["chunk_index"],
                        snippet=snippet,
                        score=score,
                        match_type="semantic",
                    )
                )
    except Exception:
        pass

    return SearchResponse(
        query=q,
        total_results=len(results),
        results=results,
    )
