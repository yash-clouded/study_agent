# main.py
import os
import json
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from agents.reader import ReaderAgent
from agents.flashcard import FlashcardAgent
from agents.quiz import QuizAgent
from agents.planner import PlannerAgent
from agents.chat_agent import ChatAgent

from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import CharacterTextSplitter
from langchain.docstore.document import Document
from langchain_openai import ChatOpenAI

from dotenv import load_dotenv
load_dotenv()

OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_KEY:
    raise Exception("Set OPENAI_API_KEY in environment")

FAISS_INDEX_PATH = os.environ.get("FAISS_INDEX_PATH", "./outputs/faiss_index")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# instantiate agents
reader = ReaderAgent()
llm = ChatOpenAI(model_name=os.environ.get("LLM_MODEL", "gpt-4o-mini"), temperature=0.1)
embeddings = OpenAIEmbeddings()
flash_agent = FlashcardAgent(llm=llm)
quiz_agent = QuizAgent(llm=llm)
planner_agent = PlannerAgent()
chat_agent = ChatAgent(faiss_index_path=FAISS_INDEX_PATH, llm=llm, embeddings=embeddings)

# helper: persist outputs
os.makedirs("./outputs", exist_ok=True)

def store_json(obj, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

def create_faiss_from_chunks(chunks):
    docs = [Document(page_content=c) for c in chunks]
    # Create vectorstore
    db = FAISS.from_documents(docs, embeddings)
    db.save_local(FAISS_INDEX_PATH)
    return db

@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs allowed")
    tmp_path = f"./outputs/{file.filename}"
    with open(tmp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    chunks = reader.read_pdf(tmp_path)
    print("reader agent is successfully read and chunked the PDF, total chunks:", len(chunks))
    # Build vector store
    db = create_faiss_from_chunks(chunks)
    print("FAISS index created at", FAISS_INDEX_PATH)
    # Save a simple summary (first 3 chunks)
    summary = {"chunks_count": len(chunks), "sample": chunks[:3]}
    store_json(summary, "./outputs/reader_summary.json")
    print("Reader summary saved.")
    return {"status": "ok", "chunks": len(chunks)}

@app.post("/generate_all")
async def generate_all():
    # expects FAISS index to be present
    if not os.path.exists(FAISS_INDEX_PATH):
        raise HTTPException(status_code=400, detail="No uploaded materials found. Upload a PDF first.")
    # load index
    # We create the index ourselves, so allow deserialization of the pickled
    # docstore/index mapping when loading. Only enable this if you trust the
    # local `outputs` files (they were created by this app).
    db = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
    print("***FAISS index loaded.")
    # retrieve raw chunks
    docs = db._get_docs(list(range(db.index.ntotal))) if hasattr(db, "_get_docs") else None
    # fallback: we saved reader_summary.json
    print("***Retrieving chunks for generation...")
    try:
        with open("./outputs/reader_summary.json") as f:
            r = json.load(f)
            chunks = r.get("sample", [])
    except Exception:
        chunks = []

    # If chunks empty, retrieve a handful by doing a query-less scan (FAISS wrapper doesn't expose docs easily)
    # For MVP we'll ask user to re-upload if we can't access chunks
    if not chunks:
        raise HTTPException(status_code=500, detail="Could not load chunks from index. Re-upload PDF.")
    print(f"***Generating flashcards and quizzes from {len(chunks)} chunks...")
    flashcards = flash_agent.generate_from_chunks(chunks)
    print(f"***Generated {len(flashcards)} flashcards.")
    quizzes = quiz_agent.generate_from_chunks(chunks)
    print(f"***Generated {len(quizzes)} quizzes.")
    # simple topic list: get first lines of chunks as topics (naive)
    topics = []
    for c in chunks:
        first_line = c.split("\n")[0][:80]
        topics.append(first_line or "Topic")

    planner = planner_agent.plan_topics(topics)

    store_json(flashcards, "./outputs/flashcards.json")
    store_json(quizzes, "./outputs/quizzes.json")
    store_json(planner, "./outputs/planner.json")

    return {"flashcards": len(flashcards), "quizzes": len(quizzes), "plan_items": len(planner)}

@app.get("/flashcards")
async def get_flashcards():
    p = "./outputs/flashcards.json"
    if not os.path.exists(p):
        return JSONResponse(content=[])
    try:
        with open(p) as f:
            data = json.load(f)
    except (json.JSONDecodeError, ValueError):
        # empty or invalid JSON -> treat as no flashcards
        return JSONResponse(content=[])
    except Exception as e:
        # unexpected error reading the file
        raise HTTPException(status_code=500, detail=f"Error reading flashcards: {e}")
    return JSONResponse(content=data)

@app.get("/quizzes")
async def get_quizzes():
    p = "./outputs/quizzes.json"
    if not os.path.exists(p):
        return JSONResponse(content=[])
    try:
        with open(p) as f:
            data = json.load(f)
    except (json.JSONDecodeError, ValueError):
        # empty or invalid JSON -> treat as no quizzes
        return JSONResponse(content=[])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading quizzes: {e}")
    return JSONResponse(content=data)

@app.get("/planner")
async def get_planner():
    p = "./outputs/planner.json"
    if not os.path.exists(p):
        return JSONResponse(content=[])
    try:
        with open(p) as f:
            data = json.load(f)
    except (json.JSONDecodeError, ValueError):
        # empty or invalid JSON -> treat as no planner items
        return JSONResponse(content=[])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading planner: {e}")
    return JSONResponse(content=data)

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str
    # Use a factory for the default to avoid sharing a mutable default between requests
    chat_history: list = Field(default_factory=list)

@app.post("/chat")
async def chat(req: ChatRequest):
    if not os.path.exists(FAISS_INDEX_PATH):
        raise HTTPException(status_code=400, detail="No index found. Upload PDF first.")
    # Allow dangerous deserialization for the same reason as above: the index
    # was created locally by this service. Do NOT enable this if loading files
    # from untrusted sources.
    db = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
    retriever = db.as_retriever(search_kwargs={"k": 3})
    chain = chat_agent.build_chain(retriever)
    inputs = {"question": req.question, "chat_history": req.chat_history}
    # Validate and run the chain; provide a clearer error if inputs are wrong
    try:
        res = chain(inputs)
    except ValueError as e:
        # Include expected vs provided keys to help debugging
        expected = getattr(chain, "input_keys", None)
        provided = list(inputs.keys())
        msg = f"Chain input validation error: {e}. expected_keys={expected}, provided_keys={provided}"
        raise HTTPException(status_code=400, detail=msg)

    answer = res.get("answer")
    docs = res.get("source_documents", [])
    sources = [d.page_content[:400] for d in docs]
    return {"answer": answer, "sources": sources}

# simple health
@app.get("/health")
def health():
    return {"status": "ok"}
