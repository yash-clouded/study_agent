# chat_agent.py
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain_openai import ChatOpenAI
import os
import sys

# Use absolute import for the utils module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.google_llm import create_google_llm


class ChatAgent:
    def __init__(self, faiss_index_path=None, llm=None, embeddings=None):
        self.embeddings = embeddings or OpenAIEmbeddings()
        
        # Use Google Gemini if GOOGLE_API_KEY is set, otherwise fall back to OpenAI
        if llm is None:
            if os.environ.get("GOOGLE_API_KEY"):
                self.llm = create_google_llm()
            else:
                self.llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.1)
        else:
            self.llm = llm
        
        self.faiss_index_path = faiss_index_path
        # FAISS will be loaded outside — we accept a retriever during run

    def build_chain(self, retriever):
        return ConversationalRetrievalChain.from_llm(
            self.llm,
            retriever=retriever,
            return_source_documents=True
        )
