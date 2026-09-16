"""
Private Docs AI - Embedding Provider Abstraction
Modular support for local (Chroma/ONNX), OpenAI, and Google Gemini embeddings.
"""

from abc import ABC, abstractmethod
from typing import List
from backend.app.config import settings
from backend.app.utils.logger import logger


class BaseEmbeddingProvider(ABC):
    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Compute embeddings for a batch of text chunks."""
        pass

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Compute embedding for a single search query."""
        pass


class LocalEmbeddingProvider(BaseEmbeddingProvider):
    """
    Local privacy-first embedding provider using Chroma's built-in ONNX embeddings.
    Requires no API keys and sends zero data over the internet.
    """
    def __init__(self):
        try:
            from chromadb.utils import embedding_functions
            self.fn = embedding_functions.DefaultEmbeddingFunction()
            logger.info("LocalEmbeddingProvider initialized with DefaultEmbeddingFunction.")
        except Exception as e:
            logger.warning(f"Chroma default embedding function error: {e}. Using deterministic local vector fallback.")
            self.fn = None

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if self.fn:
            raw = self.fn(texts)
            return [vec.tolist() if hasattr(vec, "tolist") else list(vec) for vec in raw]
        # Deterministic lightweight fallback vector (384-d)
        return [self._hash_vector(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        if self.fn:
            raw = self.fn([text])[0]
            return raw.tolist() if hasattr(raw, "tolist") else list(raw)
        return self._hash_vector(text)

    def _hash_vector(self, text: str, dim: int = 384) -> List[float]:
        import hashlib
        import math
        vec = [0.0] * dim
        tokens = text.lower().split()
        if not tokens:
            return [0.0] * dim
        for tok in tokens:
            idx = int(hashlib.md5(tok.encode("utf-8")).hexdigest(), 16) % dim
            vec[idx] += 1.0
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [x / norm for x in vec]


class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured in .env.")
        from openai import OpenAI
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_EMBEDDING_MODEL

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # Clean newlines for optimal embedding
        cleaned_texts = [t.replace("\n", " ") for t in texts]
        resp = self.client.embeddings.create(input=cleaned_texts, model=self.model)
        return [item.embedding for item in resp.data]

    def embed_query(self, text: str) -> List[float]:
        resp = self.client.embeddings.create(input=[text.replace("\n", " ")], model=self.model)
        return resp.data[0].embedding


class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured in .env.")
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_EMBEDDING_MODEL

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        import google.generativeai as genai
        results = []
        for text in texts:
            res = genai.embed_content(
                model=f"models/{self.model}",
                content=text,
                task_type="retrieval_document"
            )
            results.append(res["embedding"])
        return results

    def embed_query(self, text: str) -> List[float]:
        import google.generativeai as genai
        res = genai.embed_content(
            model=f"models/{self.model}",
            content=text,
            task_type="retrieval_query"
        )
        return res["embedding"]


def get_embedding_provider() -> BaseEmbeddingProvider:
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "openai":
        try:
            return OpenAIEmbeddingProvider()
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAIEmbeddingProvider: {e}. Falling back to local.")
            return LocalEmbeddingProvider()
    elif provider == "gemini":
        try:
            return GeminiEmbeddingProvider()
        except Exception as e:
            logger.warning(f"Failed to initialize GeminiEmbeddingProvider: {e}. Falling back to local.")
            return LocalEmbeddingProvider()
    else:
        return LocalEmbeddingProvider()
