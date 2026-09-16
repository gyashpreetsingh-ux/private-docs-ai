"""
Private Docs AI - PDF Text Extraction Service
Extracts text page-by-page using PyMuPDF (fitz) with page metadata preservation.
"""

from pathlib import Path
from typing import Dict, List, Tuple
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from backend.app.utils.logger import logger


class PDFService:
    @staticmethod
    def extract_text(file_path: str | Path) -> Tuple[List[Dict], int, bool]:
        """
        Extracts text from a PDF file page by page.
        Returns:
            - pages_data: list of dicts with {"page_number": int, "text": str}
            - page_count: total page count
            - is_scanned: True if the document has very little extractable text
        """
        path_obj = Path(file_path)
        if not path_obj.exists():
            raise FileNotFoundError(f"PDF file not found at {file_path}")

        pages_data: List[Dict] = []
        total_text_length = 0

        try:
            doc = fitz.open(str(path_obj))
            page_count = len(doc)

            for page_idx in range(page_count):
                page = doc.load_page(page_idx)
                page_text = page.get_text("text") or ""
                cleaned_text = " ".join(page_text.split())
                pages_data.append({
                    "page_number": page_idx + 1,
                    "text": cleaned_text,
                })
                total_text_length += len(cleaned_text)

            doc.close()

            # Scanned PDF heuristic: If average characters per page is less than 50
            avg_chars = total_text_length / max(page_count, 1)
            is_scanned = page_count > 0 and avg_chars < 50

            if is_scanned:
                logger.warning(
                    f"PDF '{path_obj.name}' produced only {total_text_length} chars across {page_count} pages (likely scanned)."
                )

            return pages_data, page_count, is_scanned

        except Exception as e:
            logger.error(f"Error extracting PDF text from {path_obj.name}: {str(e)}")
            raise
