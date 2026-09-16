"""
Private Docs AI - Important Topics Prompts
Extracts key topics, importance ratings, justifications, and real page citations.
"""

def build_topics_prompt(document_name: str, chunks_with_pages: list[dict]) -> str:
    """
    Build prompt to extract structured topics formatted as JSON for robust parsing.
    """
    text_corpus = []
    for chunk in chunks_with_pages:
        page = chunk.get("page_number", 1)
        txt = chunk.get("text", "")[:400]
        text_corpus.append(f"[Page {page}] {txt}")

    context_str = "\n".join(text_corpus[:30])  # Sample key chunks across document

    prompt = f"""You are an educational AI tutor analyzing the document "{document_name}".
Identify the most important conceptual topics discussed in this document.

For each topic:
1. topic: Name of the concept or topic.
2. importance: "High", "Medium", or "Low".
3. why_it_matters: Concise explanation of why this topic is essential according to the document.
4. relevant_pages: Page number(s) where this topic is discussed (e.g., "Page 4" or "Page 12-15"). Use ONLY the actual page numbers present in the document excerpt below. Do NOT invent page numbers.

DOCUMENT EXCERPTS:
==================================================
{context_str}
==================================================

Respond STRICTLY with a valid JSON array of objects, with no extra commentary:
[
  {{
    "topic": "Topic Name",
    "importance": "High",
    "why_it_matters": "Clear rationale based on the document.",
    "relevant_pages": "Page X"
  }}
]"""
    return prompt
