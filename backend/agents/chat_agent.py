# chat_agent.py
import os
import sys

# Use absolute import for the utils module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.google_llm import create_google_llm
from utils.ollama_llm import create_ollama_llm

from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


class ChatAgent:
    def __init__(self, faiss_index_path=None, llm=None, embeddings=None):
        # Use Ollama embeddings by default (local, free, no quota)
        if embeddings is None:
            try:
                ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
                ollama_model = os.environ.get("OLLAMA_MODEL", "mistral")
                self.embeddings = OllamaEmbeddings(model=ollama_model, base_url=ollama_base_url)
                print("✅ Chat: Using Ollama Embeddings (local, zero quota)")
            except Exception as e:
                print(f"⚠️  Ollama embeddings failed: {e}")
                # Tier 2: Fall back to Google Embeddings
                if os.environ.get("GOOGLE_API_KEY"):
                    try:
                        from langchain_google_genai import GoogleGenerativeAIEmbeddings
                        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
                        print("✅ Chat: Using Google Embeddings (fallback)")
                    except Exception as e2:
                        print(f"⚠️  Google embeddings failed: {e2}")
                        # Tier 3: Fall back to OpenAI
                        try:
                            from langchain_openai import OpenAIEmbeddings
                            self.embeddings = OpenAIEmbeddings()
                            print("✅ Chat: Using OpenAI Embeddings (fallback)")
                        except Exception as e3:
                            print(f"❌ All embedding providers failed: {e3}")
                            raise
                else:
                    try:
                        from langchain_openai import OpenAIEmbeddings
                        self.embeddings = OpenAIEmbeddings()
                        print("✅ Chat: Using OpenAI Embeddings (fallback)")
                    except Exception as e3:
                        print(f"❌ All embedding providers failed: {e3}")
                        raise
        else:
            self.embeddings = embeddings
        
        # Three-tier LLM provider selection for Chat
        if llm is None:
            # Tier 1: Try Ollama first
            try:
                print("🔵 Chat: Attempting Tier 1 (Ollama)")
                self.llm = create_ollama_llm()
                print("✅ Chat: Using Ollama LLM")
            except Exception as e:
                print(f"❌ Chat: Ollama failed: {e}")
                self.llm = None
            
            # Tier 2: Try Google Gemini
            if self.llm is None and os.environ.get("GOOGLE_API_KEY"):
                try:
                    print("🔵 Chat: Attempting Tier 2 (Google Gemini)")
                    self.llm = create_google_llm()
                    print("✅ Chat: Using Google Gemini LLM")
                except Exception as e:
                    print(f"❌ Chat: Google Gemini failed: {e}")
                    self.llm = None
            
            # Tier 3: Try OpenAI
            if self.llm is None and os.environ.get("OPENAI_API_KEY"):
                try:
                    print("🔵 Chat: Attempting Tier 3 (OpenAI)")
                    self.llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.1)
                    print("✅ Chat: Using OpenAI LLM")
                except Exception as e:
                    print(f"❌ Chat: OpenAI failed: {e}")
                    self.llm = None
            
            # If all tiers failed
            if self.llm is None:
                print("❌ Chat: All LLM providers failed!")
                raise RuntimeError("No available LLM provider for Chat Agent")
        else:
            self.llm = llm
        
        self.faiss_index_path = faiss_index_path
        # FAISS will be loaded outside — we accept a retriever during run

    def build_chain(self, retriever):
        # Simple conversational chain using retriever + LLM
        # For newer LangChain versions without ConversationalRetrievalChain
        system_prompt = """You are a helpful study assistant. Use the provided context to answer questions.
If you don't know the answer from the context, say so."""
        
        # Simple chain: retriever context + prompt + LLM
        class SimpleConversationalChain:
            def __init__(self, llm, retriever, system_prompt):
                self.llm = llm
                self.retriever = retriever
                self.system_prompt = system_prompt
            
            def __call__(self, *args, **kwargs):
                print("***ChatAgent SimpleConversationalChain called...")
                question = kwargs.get("question") or (args[0] if args else "")
                chat_history = kwargs.get("chat_history", [])
                print(f"***ChatAgent question: {question}")
                print(f"***ChatAgent chat_history: {chat_history}") 
                # Retrieve relevant docs using modern .invoke() instead of deprecated .get_relevant_documents()
                docs = self.retriever.invoke(question)
                context = "\n".join([doc.page_content for doc in docs])
                print(f"***ChatAgent retrieved context: {context}")
                # Build prompt
                messages = [
                    {"role": "system", "content": self.system_prompt},
                ]
                if chat_history:
                    for q, a in chat_history:
                        messages.append({"role": "user", "content": q})
                        messages.append({"role": "assistant", "content": a})
                
                messages.append({"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"})
                
                # Get response using modern .invoke() instead of deprecated __call__
                response = self.llm.invoke(messages)
                print(f"***ChatAgent LLM response: {response}")
                return {
                    "output_text": response.content if hasattr(response, 'content') else str(response),
                    "source_documents": docs
                }
        
        return SimpleConversationalChain(self.llm, retriever, system_prompt)
