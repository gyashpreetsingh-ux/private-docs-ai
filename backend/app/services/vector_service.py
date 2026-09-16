"""
Private Docs AI - ChromaDB Vector Database Service
Manages local vector storage, multi-document chunk indexing,
metadata filtering, and semantic similarity search.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from backend.app.config import settings
from backend.app.utils.logger import logger


class VectorService:
    def __init__(self, persist_directory: str = settings.CHROMA_PATH):
        self.persist_directory = persist_directory
        Path(persist_directory).mkdir(parents=True, exist_ok=True)

        logger.info(f"Connecting to persistent ChromaDB at {persist_directory}...")
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection_name = "private_docs_collection"
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "Private Docs AI Document Chunks"}
        )
        logger.info("ChromaDB persistent collection ready.")

    def add_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
    ) -> None:
        """
        Add document chunks and their precomputed embeddings to ChromaDB.
        """
        if not chunks:
            return

        ids = [c["id"] for c in chunks]
        texts = [c["text"] for c in chunks]
        metadatas = [
            {
                "document_id": str(c["document_id"]),
                "filename": str(c["filename"]),
                "page_number": int(c["page_number"]),
                "chunk_index": int(c["chunk_index"]),
            }
            for c in chunks
        ]

        # Ingest into Chroma in batches of 100 to avoid payload limits
        BATCH_SIZE = 100
        for i in range(0, len(chunks), BATCH_SIZE):
            end_idx = i + BATCH_SIZE
            self.collection.upsert(
                ids=ids[i:end_idx],
                embeddings=embeddings[i:end_idx],
                documents=texts[i:end_idx],
                metadatas=metadatas[i:end_idx],
            )

        logger.info(f"Successfully indexed {len(chunks)} chunks in ChromaDB.")

    def search(
        self,
        query_embedding: List[float],
        top_k: int = settings.TOP_K_RETRIEVAL,
        document_ids: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Perform vector similarity search against indexed document chunks.
        Supports multi-document filtering by document_ids.
        """
        where_clause = None
        if document_ids:
            if len(document_ids) == 1:
                where_clause = {"document_id": document_ids[0]}
            elif len(document_ids) > 1:
                where_clause = {"document_id": {"$in": document_ids}}

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, max(self.collection.count(), 1)),
            where=where_clause,
            include=["documents", "metadatas", "distances"],
        )

        matched_chunks: List[Dict[str, Any]] = []
        if results and results.get("ids") and results["ids"][0]:
            ids = results["ids"][0]
            docs = results["documents"][0] if results.get("documents") else []
            metas = results["metadatas"][0] if results.get("metadatas") else []
            distances = results["distances"][0] if results.get("distances") else []

            for i in range(len(ids)):
                matched_chunks.append({
                    "id": ids[i],
                    "text": docs[i] if i < len(docs) else "",
                    "document_id": metas[i].get("document_id") if i < len(metas) else "",
                    "filename": metas[i].get("filename") if i < len(metas) else "",
                    "page_number": metas[i].get("page_number", 1) if i < len(metas) else 1,
                    "chunk_index": metas[i].get("chunk_index", 0) if i < len(metas) else 0,
                    "distance": distances[i] if i < len(distances) else 0.0,
                })

        return matched_chunks

    def delete_document_chunks(self, document_id: str) -> None:
        """
        Purge all vector embeddings and chunk references for a document from ChromaDB.
        """
        try:
            self.collection.delete(where={"document_id": document_id})
            logger.info(f"Purged vector embeddings for document_id '{document_id}' from ChromaDB.")
        except Exception as e:
            logger.error(f"Error purging ChromaDB chunks for doc '{document_id}': {e}")


# Singleton instance
_vector_service_instance: Optional[VectorService] = None

def get_vector_service() -> VectorService:
    global _vector_service_instance
    if _vector_service_instance is None:
        _vector_service_instance = VectorService()
    return _vector_service_instance
