"""
Private Docs AI - Document Processing & Security Tests
"""

from pathlib import Path
import pytest
from backend.app.services.text_service import TextService
from backend.app.services.pdf_service import PDFService
from backend.app.services.chunking_service import ChunkingService
from backend.app.utils.security import sanitize_filename, validate_file_upload, ensure_safe_path
from fastapi import HTTPException


def test_sanitize_filename():
    assert sanitize_filename("../../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\secret.pdf") == "secret.pdf"
    assert sanitize_filename("My File (2026).pdf") == "My File (2026).pdf" or "My_File__2026_.pdf"


def test_validate_file_upload_allowed():
    name, ext = validate_file_upload("test_notes.pdf", 1024)
    assert ext == ".pdf"
    assert "test_notes" in name


def test_validate_file_upload_rejected():
    with pytest.raises(HTTPException) as exc_info:
        validate_file_upload("malware.exe", 1024)
    assert exc_info.value.status_code == 400


def test_text_service_extraction(tmp_path):
    txt_file = tmp_path / "test.txt"
    txt_file.write_text("Chapter 1: Normalization\nNormalization reduces database redundancy.", encoding="utf-8")

    pages_data, count, is_scanned = TextService.extract_text(txt_file)
    assert count >= 1
    assert not is_scanned
    assert "Normalization reduces database redundancy" in pages_data[0]["text"]


def test_chunking_preserves_page_numbers():
    chunker = ChunkingService(chunk_size_tokens=50, chunk_overlap_tokens=10)
    pages = [
        {"page_number": 1, "text": "Page one text discussing DBMS fundamentals and relational algebra."},
        {"page_number": 2, "text": "Page two text discussing indexing, B-trees, and query optimization."},
    ]

    chunks = chunker.chunk_document_pages("doc-123", "test.pdf", pages)
    assert len(chunks) == 2
    assert chunks[0]["page_number"] == 1
    assert chunks[1]["page_number"] == 2
    assert chunks[0]["chunk_index"] == 0
    assert chunks[1]["chunk_index"] == 1
