"""
Private Docs AI - Question Generator Prompts
Generates MCQs, short answers, long answers, interview questions, viva questions, and flashcards.
"""

def build_questions_prompt(
    document_name: str,
    chunks_with_pages: list[dict],
    question_type: str,
    difficulty: str,
    count: int = 5
) -> str:
    """
    Build prompt to generate study questions formatted as a JSON array.
    """
    text_corpus = []
    for chunk in chunks_with_pages:
        page = chunk.get("page_number", 1)
        txt = chunk.get("text", "")[:350]
        text_corpus.append(f"[Page {page}] {txt}")

    context_str = "\n".join(text_corpus[:30])

    type_instructions = {
        "mcq": "Multiple Choice Questions with 4 options (A, B, C, D) and an indicated correct answer.",
        "short_answer": "Concise conceptual questions requiring a 2-3 sentence answer.",
        "long_answer": "In-depth analytical or essay questions with a thorough model answer.",
        "interview": "Industry-standard interview questions testing practical comprehension of concepts.",
        "viva": "Rapid-fire academic oral examination (viva voce) questions with direct, sharp answers.",
        "flashcard": "Two-sided flashcard with a front prompt (Question) and back summary (Answer)."
    }

    instruction = type_instructions.get(question_type, type_instructions["mcq"])

    prompt = f"""You are a master educator analyzing the document "{document_name}".
Generate exactly {count} high-quality study questions of type: {question_type} ({instruction}).
Difficulty level: {difficulty}.

Every question and answer MUST be grounded strictly in the document excerpts below.
Include the real source page number in the source_page field.

DOCUMENT EXCERPTS:
==================================================
{context_str}
==================================================

Respond STRICTLY with a valid JSON array of objects, with no additional markdown text:
[
  {{
    "question": "Question text here?",
    "answer": "Accurate answer grounded in the document.",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],  // include options array ONLY if question_type is mcq, otherwise null
    "source_page": "Page X"
  }}
]"""
    return prompt
