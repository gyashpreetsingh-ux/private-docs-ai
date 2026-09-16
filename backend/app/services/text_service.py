"""
Private Docs AI - Plain Text & Markdown Extraction Service
Parses .txt and .md files with robust encoding detection.
"""

from pathlib import Path
from typing import Dict, List, Tuple
from backend.app.utils.logger import logger


class TextService:
    @staticmethod
    def extract_text(file_path: str | Path) -> Tuple[List[Dict], int, bool]:
        """
        Extracts content from TXT or Markdown files.
        Partitions into logical pages of approx 350-400 words.
        """
        path_obj = Path(file_path)
        if not path_obj.exists():
            raise FileNotFoundError(f"File not found at {file_path}")

        encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
        content = None

        for enc in encodings:
            try:
                with open(path_obj, "r", encoding=enc) as f:
                    content = f.read()
                break
            except (UnicodeDecodeError, UnicodeError):
                continue

        if content is None:
            # Fallback binary decode with replacement
            with open(path_obj, "rb") as f:
                content = f.read().decode("utf-8", errors="replace")

        cleaned = content.strip()
        if not cleaned:
            return [{"page_number": 1, "text": ""}], 1, True

        # Group words into logical pages
        WORDS_PER_PAGE = 350
        words = cleaned.split()
        pages_data: List[Dict] = []
        page_num = 1

        for i in range(0, max(len(words), 1), WORDS_PER_PAGE):
            chunk_words = words[i : i + WORDS_PER_PAGE]
            pages_data.append({
                "page_number": page_num,
                "text": " ".join(chunk_words),
            })
            page_num += 1

        return pages_data, len(pages_data), False
