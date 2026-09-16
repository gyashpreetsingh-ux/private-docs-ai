"""
Private Docs AI - RAG Pipeline & Vector Search Tests
"""

import pytest
from backend.app.services.embedding_service import get_embedding_provider
from backend.app.services.vector_service import get_vector_service
from backend.app.services.retrieval_service import RetrievalService


def test_embedding_provider():
    provider = get_embedding_provider()
    vec = provider.embed_query("What is database normalization?")
    assert isinstance(vec, list)
    assert len(vec) > 0


@pytest.mark.asyncio
async def test_retrieval_pipeline_execution():
    retrieval = RetrievalService()
    answer, sources = await retrieval.retrieve_and_generate(
        question="What is this document about?",
        document_ids=None,
    )
    assert isinstance(answer, str)
    assert len(answer) > 0
    assert isinstance(sources, list)
