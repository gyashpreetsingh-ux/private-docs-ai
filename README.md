# PRIVATE DOCS AI
> **Tagline:** *"Chat with your private documents."*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TS-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![ChromaDB](https://img.shields.io/badge/Vector%20Store-ChromaDB-orange.svg?style=flat)](https://www.trychroma.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-style, privacy-conscious full-stack AI application that combines the capabilities of **ChatGPT**, **NotebookLM**, and an enterprise document management system. Upload private documents (PDF, DOCX, TXT, Markdown), index them into a local vector database, and interact with your files through grounded chat, multi-document synthesis, source-cited answers, structured summaries, key topic extraction, question generation, and multi-language translation.

---

## Features

- **Document Ingestion & Multi-Format Parsing**:
  - Drag-and-drop upload for PDF, DOCX, TXT, and Markdown files (up to 25MB).
  - Page-by-page text extraction with PyMuPDF and python-docx.
  - Heuristic detection for scanned PDFs (`"Scanned PDF - OCR required"`).
- **Page-Aware Chunking & Local Embeddings**:
  - Token-aware sliding window chunking with preserved `page_number` metadata.
  - Local ONNX embeddings via ChromaDB (zero cloud calls required) or optional OpenAI/Gemini embeddings.
- **Interactive Multi-Turn RAG Chat**:
  - Filter queries across one, multiple, or all uploaded documents.
  - Verifiable source citations showing exact document filename and page numbers.
  - Anti-hallucination system prompt ("say information was not found instead of inventing facts").
  - Markdown formatting, code block syntax styling, and copy buttons.
- **AI Document Study Tools**:
  - **Summarizer**: One-line thesis, executive short, comprehensive detailed, section-by-section, key takeaways, and terminology definitions.
  - **Important Topics**: Automatic concept identification with High/Medium/Low priority ratings, justifications, and page citations.
  - **Question Generator**: Generates MCQs, short answers, long answers, interview questions, viva questions, and flashcards with Easy/Medium/Hard difficulty filters.
  - **Translation Engine**: Translates document excerpts, summaries, or AI answers to Hindi, Punjabi, English, and more.
- **Corpus & Semantic Search**:
  - Hybrid search combining filename match, SQLite substring match, and ChromaDB vector similarity.
- **Cascading Deletion**:
  - Deleting a document permanently removes the physical file from disk, purges vector embeddings from ChromaDB, and deletes all relational records.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | Modern, responsive SPA interface |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Dark mode AI SaaS design |
| **Backend API** | Python 3.12, FastAPI, Pydantic v2 | High-performance asynchronous REST API |
| **Database** | SQLite + SQLAlchemy ORM | Relational metadata, chat history, jobs |
| **Vector DB** | ChromaDB (Local Persistent) | Local vector storage and similarity search |
| **Document Parsers** | PyMuPDF (`pymupdf`), `python-docx` | Native page-aware PDF and DOCX parsing |
| **AI Providers** | OpenAI, Google Gemini, Ollama, Fallback | Modular LLM and embedding abstraction |
| **Testing** | Pytest, Pytest-Asyncio | Automated testing suite |
| **Containerization** | Docker, Docker Compose | Multi-container deployment |

---

## Monorepo Folder Structure

```
private-docs-ai/
├── .env.example              # Environment variables template
├── .gitignore                # Strict exclusion for private documents & DBs
├── README.md                 # Complete documentation
├── LICENSE                   # MIT License
├── CONTRIBUTING.md           # Developer guidelines
├── SECURITY.md               # Security boundaries and vulnerability reporting
├── docker-compose.yml        # Multi-container orchestration
├── Makefile                  # Developer command shortcuts
├── .vscode/                  # VS Code settings, extensions & launch configs
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
├── backend/                  # FastAPI Python backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py           # FastAPI entry point & CORS
│       ├── config.py         # Pydantic Settings
│       ├── database.py       # SQLAlchemy engine & session
│       ├── models/           # Document, Chat, and Tools ORM models
│       ├── schemas/          # Pydantic request/response validation
│       ├── prompts/          # Reusable grounded prompt templates
│       ├── services/         # Extraction, chunking, Chroma, RAG, and LLM services
│       ├── api/              # REST API endpoint routers
│       └── utils/            # Structured logging & security guards
├── frontend/                 # React + Vite TypeScript frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── App.tsx           # Main application state and router
│       ├── main.tsx          # React DOM root
│       ├── components/       # Dropzone, DocumentCard, ChatMessage, Citations
│       ├── layouts/          # RootLayout, Sidebar, Header
│       ├── pages/            # Dashboard, Documents, Chat, Summary, Tools, Settings
│       ├── services/         # Typed API client
│       └── types/            # TypeScript interfaces
├── data/                     # Persistent storage (EXCLUDED from Git)
│   ├── uploads/              # Local raw uploaded documents
│   ├── chroma/               # Local ChromaDB vector database
│   └── exports/              # Generated summary exports (.md, .txt)
├── docs/                     # Technical architecture documentation
│   ├── architecture.md       # Complete system architecture breakdown
│   └── rag.md                # Beginner-friendly guide to RAG
├── tests/                    # Pytest test suite
│   ├── conftest.py
│   ├── test_document_processing.py
│   ├── test_rag_pipeline.py
│   ├── test_api_endpoints.py
│   └── test_data/            # Sample non-private test documents
└── scripts/                  # Helper scripts
    ├── run_dev.ps1           # Windows PowerShell runner
    ├── run_dev.sh            # Linux/macOS bash runner
    └── seed_sample_docs.py   # Test document generator
```

---

## Privacy Architecture & Security Model

> [!IMPORTANT]
> **No system is 100% private or unconditionally secure.**
> Private Docs AI is designed with an explicit **local-first** security model to maximize user privacy.

1. **Where documents are stored**:
   - All uploaded raw files are stored locally on your hard drive in `data/uploads/`.
   - File paths are sanitized and mapped to UUIDs to prevent directory traversal attacks (`../`).
   - Uploaded files are treated strictly as data and are never executed.
2. **Where vector embeddings are stored**:
   - Embeddings and document chunk texts reside in a persistent ChromaDB database on your machine in `data/chroma/`.
3. **What data is sent to external AI APIs**:
   - **Local / Ollama Mode**: When `AI_PROVIDER=ollama` (or `fallback`) and `EMBEDDING_PROVIDER=local`, **ZERO document content or embeddings leave your computer**.
   - **Cloud Mode (OpenAI / Gemini)**: When configured with cloud API keys, only the top-K retrieved chunk excerpts relevant to your query are transmitted over HTTPS to generate answers. Raw documents are never sent in bulk.
4. **How to remove stored documents**:
   - Clicking **Delete** on any document executes a complete cascading deletion:
     1. The physical file is removed from `data/uploads/`.
     2. Vector embeddings and chunk texts are purged from ChromaDB.
     3. Relational records and generated summaries are deleted from SQLite.
5. **Git Protection**:
   - `.gitignore` strictly prevents `.env`, `data/uploads/*`, `data/chroma/*`, `*.db`, and generated exports from ever being committed to source control.

---

## Prerequisites

- **Python**: 3.11 or 3.12 recommended.
- **Node.js**: v18 or higher (v20+ recommended) and npm.
- **Git**
- *(Optional)* **Docker & Docker Compose** for containerized deployment.
- *(Optional)* **Ollama** if you wish to run local LLMs (e.g. `llama3.2`).

---

## Quick Start Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/private-docs-ai.git
cd private-docs-ai
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Windows PowerShell)*
```powershell
Copy-Item .env.example .env
```

By default, `AI_PROVIDER=fallback` and `EMBEDDING_PROVIDER=local`. This allows you to test document uploads, chunking, and grounded Q&A immediately without needing any API keys!

To connect external models, edit `.env`:
```ini
# For OpenAI:
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here

# Or for Google Gemini:
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Or for local Ollama:
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

---

## Running Locally (Development Mode)

### Running Backend
```bash
cd backend
# Create virtual environment (Python 3.12 recommended)
py -3.12 -m venv .venv

# Activate virtual environment:
# On Windows:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Start backend server:
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Server: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### Running Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Frontend application will open at: `http://localhost:5173`

### One-Click Development Scripts
- **Windows**: Run `powershell -ExecutionPolicy Bypass -File scripts\run_dev.ps1`
- **Linux/macOS**: Run `./scripts/run_dev.sh`

---

## Running with Docker

You can run the entire stack with a single command:
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Data directories (`data/uploads` and `data/chroma`) are mounted as persistent volumes on your host.

To stop the containers:
```bash
docker compose down
```

---

## Running Tests

Run the complete Pytest suite from the project root:
```bash
.\backend\.venv\Scripts\pytest tests\ -v
```
All 9 unit and integration tests verify:
- File upload validation and security path traversal guards
- PDF, DOCX, and TXT page-aware text extraction
- Chunking algorithm and page number retention
- ChromaDB vector indexing and retrieval
- End-to-end API lifecycle (Upload -> Chunk -> Search -> Chat -> Delete)

---

## Example User Workflow

1. **Upload**: Drop `sample_dbms_notes.pdf` into the upload zone on the **Documents** page.
2. **Processing**: The backend extracts text page-by-page, generates semantic chunks, computes embeddings, and stores them in ChromaDB. Status turns **Ready**.
3. **Chat**: Click **Chat** and ask:
   > *"Explain database normalization and what 2NF eliminates."*
4. **Answer & Citations**: The assistant returns a grounded explanation and cites:
   ```
   Sources:
   📄 sample_dbms_notes.pdf — Page 2 (100% match)
   ```
   Click the citation to reveal the exact excerpt retrieved.
5. **Summarize**: Click **Summarize** to generate a comprehensive markdown summary, section breakdown, or key takeaways, and click **Export .MD** to download.
6. **Important Topics**: Navigate to **Important Topics** to see an automated breakdown of key concepts and page citations.
7. **Translate**: Click **Translate** to translate summaries or explanations into Hindi (हिन्दी) or Punjabi (ਪੰਜਾਬੀ).

---

## Troubleshooting

- **Error: Scanned PDF - OCR required**:
  The uploaded PDF contains bitmap scans without embedded text. Install Tesseract OCR on your machine or upload a digital text PDF.
- **Port 8000 already in use**:
  Change `PORT=8001` in `.env` and update `frontend/vite.config.ts` proxy target.
- **ChromaDB C++ build error during pip install**:
  Ensure you are using Python 3.12 (`py -3.12 -m venv .venv`). Precompiled binary wheels for ChromaDB and onnxruntime are available out-of-the-box for Python 3.12 on Windows.

---

## License

This project is licensed under the [MIT License](LICENSE).
