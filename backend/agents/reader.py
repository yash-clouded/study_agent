# reader.py
from utils.pdf_utils import extract_text_from_pdf
from langchain.text_splitter import RecursiveCharacterTextSplitter

class ReaderAgent:
    def __init__(self, chunk_size=1000, chunk_overlap=200):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, chunk_overlap=chunk_overlap
        )

    def read_pdf(self, path: str):
        raw = extract_text_from_pdf(path)
        cleaned = self.clean_text(raw)
        chunks = self.splitter.split_text(cleaned)
        # produce small topic-ish chunks
        return chunks

    def clean_text(self, text: str) -> str:
        # simple cleaning, can be extended
        text = text.replace("\r", "\n")
        return text
