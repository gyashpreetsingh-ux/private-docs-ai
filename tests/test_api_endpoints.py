"""
Private Docs AI - REST API Endpoint Tests
"""

import io
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Private Docs AI" in data["app_name"]


def test_document_lifecycle(client: TestClient):
    # 1. Upload a test TXT document
    file_content = b"Database Normalization reduces data redundancy and improves database integrity."
    response = client.post(
        "/api/documents/upload",
        files={"file": ("dbms_notes.txt", io.BytesIO(file_content), "text/plain")},
    )
    assert response.status_code == 201
    doc_data = response.json()["document"]
    doc_id = doc_data["id"]
    assert doc_data["filename"] == "dbms_notes.txt"

    # 2. List documents
    list_res = client.get("/api/documents")
    assert list_res.status_code == 200
    docs = list_res.json()
    assert any(d["id"] == doc_id for d in docs)

    # 3. Get single document
    get_res = client.get(f"/api/documents/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == doc_id

    # 4. Search
    search_res = client.get("/api/search?q=Normalization")
    assert search_res.status_code == 200
    assert "results" in search_res.json()

    # 5. Chat turn
    chat_res = client.post(
        "/api/chat",
        json={"message": "What does normalization reduce?", "document_ids": [doc_id]},
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "answer" in chat_data
    assert "conversation_id" in chat_data

    # 6. Delete document
    del_res = client.delete(f"/api/documents/{doc_id}")
    assert del_res.status_code == 200
