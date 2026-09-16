"""
Private Docs AI - Multi-Language Translation Prompts
Supports high-quality document and answer translation (Hindi, Punjabi, English, and extensible).
"""

def build_translation_prompt(text: str, target_language: str, source_language: str = "English") -> str:
    """
    Build prompt to translate content accurately preserving technical terms where customary.
    """
    prompt = f"""You are a professional linguistic translator specializing in technical and educational literature.

TASK:
Translate the following text from {source_language} into fluent, natural {target_language}.
Maintain the original markdown formatting (such as bullet points, bold headers, and code snippets).
For specialized technical concepts (e.g. database keys, SQL terms, algorithm names), provide the accurate translation while keeping common technical terminology clear.

ORIGINAL TEXT:
==================================================
{text}
==================================================

Provide ONLY the translated text in {target_language} with no prefix, no explanations, and no extra commentary:"""
    return prompt
