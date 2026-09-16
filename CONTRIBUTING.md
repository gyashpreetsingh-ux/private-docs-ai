# Contributing to Private Docs AI

Thank you for your interest in contributing to **Private Docs AI**!

## Development Guidelines

1. **Privacy-First Mindset**:
   - Never commit sensitive documents, test files containing PII, or API keys.
   - Any new storage feature must clearly document where user data is written and how it can be deleted.

2. **Branching & Commits**:
   - Follow semantic commit conventions (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
   - Write tests for any new parser, chunker, or RAG retriever functionality.

3. **Code Style**:
   - Backend: Python 3.12, PEP 8, formatted with Black/Ruff, full type hints.
   - Frontend: TypeScript, strict mode, Tailwind CSS utility conventions.

## Running Tests
```bash
# Backend tests
pytest tests/ -v

# Frontend build check
cd frontend
npm run build
```
