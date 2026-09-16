# Security Policy & Privacy Architecture

## Security Philosophy

Private Docs AI is engineered with a **local-first, privacy-conscious** architecture. However, in security and software engineering, **no system is 100% private or unconditionally impenetrable**. This document details our security model, data storage boundaries, external API transmission policies, and vulnerability reporting procedures.

---

## Data Boundary & Storage Locations

1. **Uploaded Raw Documents**:
   - Stored on the local file system under `data/uploads/`.
   - File paths are sanitized using cryptographically secure UUID identifiers to eliminate directory traversal risks (`../`).
   - Files are stored with safe permissions and are NEVER executed.

2. **Vector Embeddings**:
   - Stored locally in a persistent ChromaDB database under `data/chroma/`.
   - Embeddings and associated chunk text reside in your local environment.

3. **Metadata & Chat History**:
   - Persisted in a local SQLite database (`data/app.db`).
   - Conversations, chunk references, and summaries are stored locally.

4. **External API Transmission**:
   - **Local / Ollama Mode**: When `AI_PROVIDER=ollama` and `EMBEDDING_PROVIDER=local`, **ZERO document data or embeddings leave your local machine**.
   - **OpenAI / Gemini Mode**: When an external cloud provider is selected, relevant retrieved chunks and user prompts are transmitted over HTTPS to OpenAI or Google Gemini solely to generate answers. The full raw document is never transmitted in bulk.
   - API keys are loaded via environment variables (`.env`) and never exposed in frontend bundles or API error messages.

5. **Complete Document Deletion**:
   - Deleting a document triggers a permanent 3-way cascade:
     1. Physical file removed from disk in `data/uploads/`.
     2. Vector embeddings and chunk texts purged from the ChromaDB collection.
     3. Metadata, chunks, summaries, and topics deleted from the relational database (`data/app.db`).

---

## Known Limitations

- Multi-tenant encryption at rest is not enabled by default in the SQLite MVP.
- If using third-party AI APIs (OpenAI / Google), queries are subject to their respective data retention and privacy policies.
- Ensure the server host has disk encryption (e.g. BitLocker or LUKS) enabled if local physical tampering is a risk.

---

## Reporting Vulnerabilities

Please do NOT file public GitHub issues for security vulnerabilities.
To report security concerns, send a detailed advisory to `security@privatedocs.ai` or submit a private security advisory through GitHub.
