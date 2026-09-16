# System Architecture - Private Docs AI

Private Docs AI is engineered with a modular, privacy-conscious full-stack architecture. The system ensures that private user documents are parsed, chunked, and embedded into a local persistent vector database with rigorous citation preservation and anti-hallucination bounds.

---

## 1. High-Level Flow Diagram

```
+-----------------------------------------------------------------------------------+
|                              REACT + VITE FRONTEND                                |
|  - Dashboard: System metrics, quick actions, recent activity                      |
|  - Ingestion: Dropzone with MIME & 25MB validation                                |
|  - Chat UI: Multi-doc filter, source citation cards, markdown code highlight      |
|  - Tools: Summaries (6 styles), Topics, Study Questions, Translation              |
+-----------------------------------------+-----------------------------------------+
                                          | HTTP REST / JSON
+-----------------------------------------v-----------------------------------------+
|                               FASTAPI BACKEND                                     |
|  - Security Layer: Filename sanitizer, path traversal guard, MIME validator       |
|  - Background Tasks: Asynchronous document ingestion and vectorization            |
|  - Database: SQLAlchemy ORM with SQLite (PostgreSQL-ready schema)                 |
+-------------------+---------------------+-------------------+---------------------+
                    |                     |                   |
        +-----------v----------+  +-------v---------+  +------v---------------+
        |  DOCUMENT EXTRACTORS |  |  VECTOR & RAG   |  |   AI PROVIDERS       |
        |  - PyMuPDF (PDF)     |  |  - ChromaDB     |  |   - OpenAI Provider  |
        |  - python-docx (DOCX)|  |  - Sliding-wind |  |   - Gemini Provider  |
        |  - Text/MD Parser    |  |    chunking     |  |   - Ollama Provider  |
        |  - Scanned PDF check |  |  - Page-aware   |  |   - Grounded Fallback|
        |    & OCR abstraction |  |    retrieval    |  |     Provider         |
        +-----------+----------+  +-------+---------+  +------+---------------+
                    |                     |                   |
+-------------------v---------------------v-------------------v---------------------+
|                         LOCAL STORAGE LAYER (PROTECTED)                           |
|  - Physical Files: data/uploads/{uuid}_{safe_filename}                            |
|  - Vector Store: data/chroma/ (embeddings & excerpt index)                        |
|  - Metadata DB: data/app.db (documents, chunks, chats, topics, questions)         |
|  - Exports: data/exports/ (generated summaries in .md or .txt)                    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Ingestion & Document Processing Pipeline

1. **Upload & Sanitization**:
   - The user submits PDF, DOCX, TXT, or MD files.
   - `security.py` removes dangerous directory traversal characters (`../`, special symbols) and verifies that file sizes remain within 25MB.
   - Raw files are stored under `data/uploads/` with a unique UUID prefix and are marked as non-executable data.

2. **Text Extraction & Page Tracking**:
   - **PDFs**: Extracted page-by-page using PyMuPDF (`fitz`). Page numbers are stored alongside every text block.
   - **DOCXs**: Extracted paragraph-by-paragraph and table-by-table using `python-docx`, sectioned into logical reading pages.
   - **TXT & MD**: Parsed with automated fallback encoding detection (`utf-8`, `latin-1`, `cp1252`).
   - **Scanned Document Detection**: If a PDF contains fewer than 50 characters per page, the system flags the document as `"Scanned PDF - OCR required"` rather than producing corrupted embeddings.

3. **Semantic Chunking**:
   - The `ChunkingService` processes text with a sliding window (default 600 tokens with 100 token overlap).
   - Paragraph and sentence boundaries are preserved.
   - Crucially, **every chunk retains its source `page_number` and `chunk_index`** in relational database records.

4. **Embedding Generation**:
   - Chunks are vectorized using the configured `BaseEmbeddingProvider`:
     - **Local (Default)**: ChromaDB built-in ONNX miniLM embeddings, running 100% locally on CPU without network calls or API keys.
     - **OpenAI**: `text-embedding-3-small` (1536 dimensions).
     - **Google Gemini**: `text-embedding-004`.

5. **ChromaDB Indexing**:
   - Chunks and embedding vectors are upserted into persistent ChromaDB storage (`data/chroma/`).
   - Metadata indexed includes `document_id`, `filename`, `page_number`, and `chunk_index`.

---

## 3. RAG Retrieval & Synthesis Pipeline

```
USER QUESTION
      |
      v
1. Embed Question using EmbeddingProvider
      |
      v
2. Vector Similarity Search in ChromaDB (with optional Document ID filter)
      |
      v
3. Retrieve Top-K Relevant Chunks (default K = 6)
      |
      v
4. Format Strict Grounded Context Prompt with Page Markers
      |
      v
5. Invoke LLM (OpenAI / Gemini / Ollama / Local Fallback)
      |
      v
6. Output Grounded Answer + Verifiable Source Citations (Filename & Page Number)
```

---

## 4. Multi-Turn Conversation Persistence

- Conversations and messages are saved in `data/app.db`.
- Assistant messages store full source citations as JSON (`[{document_id, filename, page_number, text_snippet}]`).
- Renaming and deleting conversations is supported through REST APIs.
- Deleting a document triggers a cascading delete across disk files, ChromaDB embeddings, and database rows.
