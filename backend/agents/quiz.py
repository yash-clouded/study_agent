# quiz.py
import json
import re
from langchain import LLMChain, PromptTemplate
from langchain_openai import ChatOpenAI

# Use absolute import for the utils module
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.google_llm import create_google_llm

QUIZ_PROMPT = """
You are a quiz (MCQ) generator.
From this text chunk, create up to 5 multiple-choice questions.
Each question must have 4 options and one correct answer.

Return a JSON array of objects with keys: question, options, and answer.
Example (written as plain text to avoid template parsing issues):

Question: What is X?
Options: A) ...  B) ...  C) ...  D) ...
Answer: A

Text:

{chunk}

Return strictly a JSON array (only JSON, no extra text).
"""

class QuizAgent:
    def __init__(self, llm=None):
        if llm is None:
            self.llm = create_google_llm()
            self.chain = None
        else:
            self.llm = llm
            self.chain = LLMChain(llm=self.llm, prompt=PromptTemplate.from_template(QUIZ_PROMPT))

    def _response_to_text(self, resp):
        if resp is None:
            return ""
        if isinstance(resp, str):
            return resp
        if isinstance(resp, dict):
            for k in ("text", "output_text", "response", "result"):
                if k in resp and isinstance(resp[k], str):
                    return resp[k]
            for v in resp.values():
                if isinstance(v, str):
                    return v
            try:
                return json.dumps(resp)
            except Exception:
                return str(resp)
        return str(resp)

    def generate_from_chunks(self, chunks):
        out = []
        for c in chunks:
            # Prefer .predict to avoid deprecated Chain.__call__/run usage
            try:
                if self.chain is None:
                    text = self.llm.predict(QUIZ_PROMPT.replace("{chunk}", c))
                else:
                    resp = self.chain.predict(chunk=c)
                    text = self._response_to_text(resp)
            except Exception as e:
                print("***QuizAgent exception during predict/invoke:", e)
                text = ""

            # try strict JSON parse first
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    out.extend(parsed)
                    continue
            except Exception:
                pass

            # salvage JSON array from text
            m = re.search(r'(\[.*\])', text, re.S)
            if m:
                try:
                    parsed = json.loads(m.group(1))
                    if isinstance(parsed, list):
                        out.extend(parsed)
                        continue
                except Exception:
                    pass

            # last-resort parsing: attempt to split into questions (very naive)
            lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
            current = {}
            for ln in lines:
                if ln.lower().startswith("q:") or ln.endswith("?"):
                    if current:
                        out.append(current)
                        current = {}
                    current["question"] = ln[2:].strip() if ln.lower().startswith("q:") else ln
                elif ln.lower().startswith("a)") or ln.startswith("-") or ln.lower().startswith("option"):
                    current.setdefault("options", []).append(ln.split(")",1)[-1].strip() if ")" in ln else ln)
                elif ln.lower().startswith("answer:") and current:
                    current["answer"] = ln.split(":",1)[1].strip()
            if current:
                out.append(current)
        return out
