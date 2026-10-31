"""
PDF and Document Content Extractor using PyMuPDF (fitz) and pdfplumber.
Extracts full text, geometric header regions (letterhead blocks), and document metadata.
"""
import base64
import re
from typing import Dict, Any, Tuple, Optional
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from src.utils.logger import get_logger

logger = get_logger("DocumentExtractor")

class DocumentExtractor:
    @staticmethod
    def decode_base64_payload(payload_str: str) -> bytes:
        """
        Decodes raw or data-URI base64 string to bytes.
        """
        if "," in payload_str:
            payload_str = payload_str.split(",")[1]
        payload_str = payload_str.strip()
        # Fix padding if needed
        missing_padding = len(payload_str) % 4
        if missing_padding:
            payload_str += "=" * (4 - missing_padding)
        return base64.b64decode(payload_str)

    @classmethod
    def extract_document(
        cls,
        doc_bytes: bytes,
        file_name: str = "document.pdf"
    ) -> Dict[str, Any]:
        """
        Opens document and extracts structural regions with special focus on top letterhead zone.
        """
        ext = file_name.split(".")[-1].lower() if "." in file_name else "pdf"
        
        # If plain text file
        if ext in ["txt", "csv"]:
            try:
                text = doc_bytes.decode("utf-8", errors="replace")
                lines = [l.strip() for l in text.splitlines() if l.strip()]
                header_text = " \n ".join(lines[:6]) if lines else ""
                return {
                    "full_text": text,
                    "header_text": header_text,
                    "page_count": 1,
                    "metadata": {"format": "text"},
                    "has_images": False
                }
            except Exception as e:
                logger.error(f"Error parsing text file: {e}")
                return {"full_text": "", "header_text": "", "page_count": 0, "metadata": {}, "has_images": False}

        # PyMuPDF (fitz) extraction for PDF and image formats
        try:
            filetype = "pdf" if ext == "pdf" else (ext if ext in ["png", "jpg", "jpeg", "webp"] else "pdf")
            doc = fitz.open(stream=doc_bytes, filetype=filetype)
            page_count = len(doc)
            
            full_text_parts = []
            header_text_parts = []
            has_images = False

            for page_idx in range(page_count):
                page = doc[page_idx]
                page_height = page.rect.height
                
                # Check for images/stamps
                images = page.get_images()
                if images:
                    has_images = True
                
                # Extract text blocks with coordinates: (x0, y0, x1, y1, text, block_no, block_type)
                blocks = page.get_text("blocks")
                page_text_blocks = []
                
                for b in blocks:
                    if len(b) >= 5:
                        x0, y0, x1, y1, text = b[0], b[1], b[2], b[3], b[4]
                        clean_block = text.strip()
                        if clean_block:
                            page_text_blocks.append(clean_block)
                            # Top 28% vertical area of page 1 is strictly letterhead territory
                            if page_idx == 0 and y0 < (page_height * 0.28):
                                header_text_parts.append(clean_block)

                page_full_text = page.get_text()
                if page_full_text.strip():
                    full_text_parts.append(page_full_text.strip())
                elif page_text_blocks:
                    full_text_parts.append(" \n ".join(page_text_blocks))

            # If no blocks caught in first 28%, take top 400 characters of page 1 as header
            if not header_text_parts and full_text_parts:
                first_page = full_text_parts[0]
                lines = [l.strip() for l in first_page.splitlines() if l.strip()]
                header_text_parts = lines[:5]

            metadata = doc.metadata or {}
            doc.close()

            return {
                "full_text": "\n\n".join(full_text_parts),
                "header_text": "\n".join(header_text_parts),
                "page_count": page_count,
                "metadata": metadata,
                "has_images": has_images
            }

        except Exception as pdf_err:
            logger.warn(f"fitz PDF parsing fallback: {pdf_err}")
            # Text decoding fallback
            try:
                raw_text = doc_bytes.decode("latin-1", errors="ignore")
                # extract printable ascii sequences
                printable = re.findall(r'[A-Za-z0-9\s\.,\-\:\$\#\/]{4,}', raw_text)
                combined = " ".join(printable[:100])
                return {
                    "full_text": combined,
                    "header_text": " ".join(printable[:15]),
                    "page_count": 1,
                    "metadata": {},
                    "has_images": False
                }
            except Exception:
                return {
                    "full_text": "",
                    "header_text": "",
                    "page_count": 0,
                    "metadata": {},
                    "has_images": False
                }
