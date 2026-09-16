"""
Private Docs AI - DOCX Extraction Service
Extracts paragraphs, headings, and table contents from DOCX files.
"""

from pathlib import Path
from typing import Dict, List, Tuple
from docx import Document as DocxDocument
from backend.app.utils.logger import logger


class DOCXService:
    @staticmethod
    def extract_text(file_path: str | Path) -> Tuple[List[Dict], int, bool]:
        """
        Extracts content from a DOCX file.
        Groups text into logical reading blocks (approx 400 words per virtual page).
        """
        path_obj = Path(file_path)
        if not path_obj.exists():
            raise FileNotFoundError(f"DOCX file not found at {file_path}")

        try:
            doc = DocxDocument(str(path_obj))
            all_text_blocks: List[str] = []

            # Extract paragraphs and headings
            for p in doc.paragraphs:
                text = p.text.strip()
                if text:
                    all_text_blocks.append(text)

            # Extract table cells
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        all_text_blocks.append(row_text)

            full_corpus = "\n\n".join(all_text_blocks)
            if not full_corpus.strip():
                return [{"page_number": 1, "text": ""}], 1, True

            # Group into logical pages (approx 2000 characters or 350-400 words)
            WORDS_PER_PAGE = 350
            words = full_corpus.split()
            pages_data: List[Dict] = []
            page_num = 1

            for i in range(0, len(words), WORDS_PER_PAGE):
                chunk_words = words[i : i + WORDS_PER_PAGE]
                pages_data.append({
                    "page_number": page_num,
                    "text": " ".join(chunk_words),
                })
                page_num += 1

            page_count = len(pages_data)
            return pages_data, page_count, False

        except Exception as e:
            logger.error(f"Error extracting DOCX text from {path_obj.name}: {str(e)}")
            raise
