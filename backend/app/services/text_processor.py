import PyPDF2
from docx import Document
import io

class TextProcessor:
    def extract_text(self, file):
        """Extract text from various document formats"""
        filename = file.filename.lower()
        
        if filename.endswith('.pdf'):
            return self._process_pdf(file)
        elif filename.endswith('.docx'):
            return self._process_docx(file)
        elif filename.endswith('.txt'):
            return self._process_txt(file)
        else:
            raise ValueError('Unsupported file format')

    def _process_pdf(self, file):
        """Extract text from PDF files"""
        try:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")

    def _process_docx(self, file):
        """Extract text from DOCX files"""
        try:
            doc = Document(file)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error processing DOCX: {str(e)}")

    def _process_txt(self, file):
        """Extract text from TXT files"""
        try:
            text = file.read().decode('utf-8')
            return text.strip()
        except Exception as e:
            raise Exception(f"Error processing TXT: {str(e)}")

    def chunk_text(self, text, chunk_size=1000):
        """Split text into manageable chunks for TTS processing"""
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0

        for word in words:
            word_length = len(word) + 1  # +1 for space
            if current_length + word_length > chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_length = word_length
            else:
                current_chunk.append(word)
                current_length += word_length

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks
