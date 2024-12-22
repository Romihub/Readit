import PyPDF2
from docx import Document
import os
import json
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

class TextParser:
    def __init__(self):
        self.supported_formats = {
            '.pdf': self._parse_pdf,
            '.docx': self._parse_docx,
            '.txt': self._parse_txt
        }

    def parse_document(self, file) -> Dict:
        """Parse document and return structured content"""
        try:
            filename = file.filename.lower()
            ext = os.path.splitext(filename)[1]
            
            logger.info(f"Parsing document: {filename}")

            if ext not in self.supported_formats:
                error_msg = f"Unsupported file format: {ext}"
                logger.error(error_msg)
                raise ValueError(error_msg)

            parser = self.supported_formats[ext]
            content = parser(file)

            # Structure the content into segments
            segments = self._create_segments(content)
            
            result = {
                'segments': segments,
                'total_segments': len(segments),
                'metadata': {
                    'filename': filename,
                    'format': ext,
                    'word_count': sum(len(seg.split()) for seg in segments)
                }
            }
            
            logger.info(f"Successfully parsed document {filename} with {len(segments)} segments")
            return result
            
        except Exception as e:
            error_msg = f"Error parsing document: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise ValueError(error_msg)

    def _create_segments(self, text: str, words_per_segment: int = 100) -> List[str]:
        """Split text into manageable segments"""
        try:
            words = text.split()
            segments = []
            
            for i in range(0, len(words), words_per_segment):
                segment = ' '.join(words[i:i + words_per_segment])
                segments.append(segment)
            
            return segments
        except Exception as e:
            error_msg = f"Error creating segments: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise ValueError(error_msg)

    def _parse_pdf(self, file) -> str:
        try:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            error_msg = f"Error parsing PDF: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise ValueError(error_msg)

    def _parse_docx(self, file) -> str:
        try:
            doc = Document(file)
            return " ".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            error_msg = f"Error parsing DOCX: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise ValueError(error_msg)

    def _parse_txt(self, file) -> str:
        try:
            return file.read().decode('utf-8')
        except Exception as e:
            error_msg = f"Error parsing TXT: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise ValueError(error_msg)
