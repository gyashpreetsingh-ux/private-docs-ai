"""
Private Docs AI - Chat & RAG Prompt Templates
Enforces grounded answers, citation preservation, and zero hallucination.
"""

CHAT_SYSTEM_PROMPT = """You are a document-grounded AI assistant for Private Docs AI.

Core Instructions:
1. Use ONLY the provided retrieved context to answer questions about the user's uploaded documents.
2. If the answer is not present or cannot be directly inferred from the retrieved context, clearly and politely say that you could not find the answer in the uploaded documents instead of inventing or assuming information.
3. Never invent facts, page numbers, citations, statistics, or quotations.
4. When stating facts or synthesizing ideas from the context, explicitly reference the source document name and page number (for example: "[Document: DBMS_Notes.pdf, Page: 4]").
5. Structure answers cleanly with Markdown headings, bullet points, or code blocks when helpful.
6. If the user asks a greeting or general conversational remark, reply courteously and guide them to ask questions regarding their uploaded documents.
"""

def build_rag_context_prompt(question: str, context_chunks: list[dict]) -> str:
    """
    Format retrieved document chunks with clear boundary markers and metadata.
    """
    if not context_chunks:
        context_str = "NO RELEVANT DOCUMENT CONTEXT FOUND."
    else:
        formatted_chunks = []
        for i, chunk in enumerate(context_chunks, 1):
            doc_name = chunk.get("filename", "Unknown Document")
            page_num = chunk.get("page_number", 1)
            text = chunk.get("text", "").strip()
            formatted_chunks.append(
                f"--- EXCERPT {i} [File: {doc_name} | Page: {page_num}] ---\n{text}\n"
            )
        context_str = "\n".join(formatted_chunks)

    prompt = f"""RETRIEVED DOCUMENT CONTEXT:
==================================================
{context_str}
==================================================

USER QUESTION:
{question}

Provide a well-structured, clear answer grounded strictly in the context above. If the context does not contain enough information, explain that the information was not found in the uploaded documents."""
    return prompt
