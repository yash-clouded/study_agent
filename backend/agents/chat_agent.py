# chat_agent.py
from langchain.chat_models import ChatOpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain

class ChatAgent:
    def __init__(self, faiss_index_path=None, llm=None, embeddings=None):
        self.embeddings = embeddings or OpenAIEmbeddings()
        self.llm = llm or ChatOpenAI(model_name="gpt-4o-mini", temperature=0.1)
        self.faiss_index_path = faiss_index_path
        # FAISS will be loaded outside — we accept a retriever during run

    def build_chain(self, retriever):
        return ConversationalRetrievalChain.from_llm(
            self.llm,
            retriever=retriever,
            return_source_documents=True
        )
