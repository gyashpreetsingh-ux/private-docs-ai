"""
Private Docs AI - OCR Service Abstraction
Modular OCR pipeline with Tesseract support and graceful fallback detection.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, List, Optional
from backend.app.utils.logger import logger


class BaseOCRProvider(ABC):
    @abstractmethod
    def extract_text_from_images(self, image_paths: List[Path]) -> List[Dict]:
        """Extract text from a list of page images."""
        pass


class TesseractOCRProvider(BaseOCRProvider):
    def __init__(self):
        self._available = False
        try:
            import pytesseract
            # Test if tesseract is installed in PATH
            pytesseract.get_tesseract_version()
            self._available = True
            logger.info("Tesseract OCR detected and enabled.")
        except Exception:
            self._available = False
            logger.info("Tesseract binary not detected in environment. Scanned PDFs will be flagged for OCR.")

    @property
    def is_available(self) -> bool:
        return self._available

    def extract_text_from_images(self, image_paths: List[Path]) -> List[Dict]:
        if not self._available:
            raise RuntimeError("OCR service requested but Tesseract is not available on this host.")

        import pytesseract
        from PIL import Image

        results = []
        for idx, img_path in enumerate(image_paths, 1):
            with Image.open(img_path) as img:
                text = pytesseract.image_to_string(img)
                results.append({"page_number": idx, "text": text.strip()})
        return results


class OCRService:
    def __init__(self):
        self.provider = TesseractOCRProvider()

    def is_ocr_available(self) -> bool:
        return self.provider.is_available

    def process_scanned_document(self, file_path: Path) -> Optional[List[Dict]]:
        if not self.is_ocr_available():
            return None
        # Modular extension point for rendering PDF pages to images and OCRing
        return None
