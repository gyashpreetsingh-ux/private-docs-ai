"""
Private Docs AI - Document Chunking Service
Splits extracted document pages into semantic chunks while strictly preserving
page numbers and chunk sequences for precise source citations.
"""

import json
from typing import Any, Dict, List
from backend.app.config import settings
from backend.app.utils.logger import logger


class ChunkingService:
    def __init__(
        self,
        chunk_size_tokens: int = settings.CHUNK_SIZE_TOKENS,
        chunk_overlap_tokens: int = settings.CHUNK_OVERLAP_TOKENS,
    ):
        self.chunk_size_tokens = chunk_size_tokens
        self.chunk_overlap_tokens = chunk_overlap_tokens
        # Heuristic ratio: 1 token ~= 4 characters / 0.75 words
        self.max_chars_per_chunk = chunk_size_tokens * 4
        self.overlap_chars = chunk_overlap_tokens * 4

    def chunk_document_pages(
        self,
        document_id: str,
        filename: str,
        pages_data: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Splits a list of page dicts [{"page_number": int, "text": str}]
        into structured chunks, ensuring page_number citations are preserved.
        """
        chunks: List[Dict[str, Any]] = []
        global_chunk_idx = 0

        for page in pages_data:
            page_num = page.get("page_number", 1)
            raw_text = page.get("text", "").strip()

            if not raw_text:
                continue

            # If page text fits easily into a single chunk
            if len(raw_text) <= self.max_chars_per_chunk:
                chunks.append({
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": global_chunk_idx,
                    "page_number": page_num,
                    "text": raw_text,
                    "metadata": json.dumps({
                        "char_count": len(raw_text),
                        "word_count": len(raw_text.split()),
                        "page_number": page_num,
                    }),
                })
                global_chunk_idx += 1
            else:
                # Sliding window chunking with paragraph/sentence awareness
                page_chunks = self._split_text_with_overlap(raw_text)
                for snippet in page_chunks:
                    if not snippet.strip():
                        continue
                    chunks.append({
                        "document_id": document_id,
                        "filename": filename,
                        "chunk_index": global_chunk_idx,
                        "page_number": page_num,
                        "text": snippet.strip(),
                        "metadata": json.dumps({
                            "char_count": len(snippet),
                            "word_count": len(snippet.split()),
                            "page_number": page_num,
                        }),
                    })
                    global_chunk_idx += 1

        logger.info(
            f"Chunked document '{filename}' into {len(chunks)} chunks across {len(pages_data)} pages."
        )
        return chunks

    def _split_text_with_overlap(self, text: str) -> List[str]:
        """
        Splits large text blocks into chunks with token overlap,
        respecting paragraph and sentence boundaries.
        """
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = []
        current_len = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            para_len = len(para)
            if current_len + para_len > self.max_chars_per_chunk and current_chunk:
                joined = "\n\n".join(current_chunk)
                chunks.append(joined)
                # Apply overlap by taking trailing words
                words = joined.split()
                overlap_words = words[-max(self.chunk_overlap_tokens, 10):] if len(words) > 10 else []
                current_chunk = [" ".join(overlap_words)] if overlap_words else []
                current_len = sum(len(c) for c in current_chunk)

            current_chunk.append(para)
            current_len += para_len

        if current_chunk:
            chunks.append("\n\n".join(current_chunk))

        return chunks
