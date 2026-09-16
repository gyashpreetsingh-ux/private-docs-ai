"""
Private Docs AI - Document Summary Prompts
Provides templates for one-line, short, detailed, section-wise, takeaways, and definition summaries.
"""

def build_summary_prompt(document_name: str, document_text: str, summary_type: str) -> str:
    """
    Build prompt for generating document summaries based on summary_type.
    """
    instructions = {
        "one_line": "Generate a single, impactful, comprehensive one-sentence summary capturing the core thesis of the document.",
        "short": "Provide an executive summary of 2-3 paragraphs highlighting the primary purpose, methodology/main concepts, and concluding outcomes.",
        "detailed": """Generate a comprehensive, structured document summary with the following markdown sections:
# Document Summary: {doc_name}

## 1. Executive Overview
(High-level summary of the entire document)

## 2. Key Concepts & Architecture
(Detailed breakdown of primary ideas, methodologies, or findings)

## 3. Critical Key Points
- Bullet 1
- Bullet 2

## 4. Important Definitions & Terminology
- **Term 1**: Definition based on the text
- **Term 2**: Definition based on the text

## 5. Key Takeaways & Actionable Insights
- Takeaway 1
- Takeaway 2
""",
        "chapter_wise": "Break down the document section by section or topic by topic. Provide a structured section-by-section breakdown summarizing each part.",
        "takeaways": "Extract the top 5 to 10 most critical, high-impact takeaways from this document as bullet points.",
        "definitions": "Identify all key technical or specialized terms and definitions introduced in the document. Format as markdown glossary: '**Term**: Definition'."
    }

    instruction = instructions.get(summary_type, instructions["detailed"])
    if "{doc_name}" in instruction:
        instruction = instruction.replace("{doc_name}", document_name)

    prompt = f"""You are an expert document analyst.
Summarize the document "{document_name}" based ONLY on its actual text provided below.

INSTRUCTION:
{instruction}

DOCUMENT CONTENT:
==================================================
{document_text}
==================================================

Generate the summary now adhering strictly to the above instruction:"""
    return prompt
