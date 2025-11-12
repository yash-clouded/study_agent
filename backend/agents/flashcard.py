# flashcard.py
import json
import re
from langchain import LLMChain, PromptTemplate
from langchain_openai import ChatOpenAI
from ..utils.google_llm import create_google_llm

FLASH_PROMPT = """You are a flashcard generator.
Given the following text chunk, produce between 1 and 6 question-answer pairs and return them as a valid JSON array (only the JSON array, nothing else).

Requirements:
- Output must be a valid JSON array using double quotes only.
- Each item must be an object with exactly two keys: "question" and "answer".
- Keep questions concise (<= 120 characters) and answers concise (<= 400 characters).
- Do NOT include any explanatory text, markdown, or code fences — output only the JSON array.
- If no suitable Q/A can be produced, return an empty array: []
- Escape any quotes or special characters so the JSON is valid.

Example output:
[
    {{"question": "What is X?", "answer": "X is ..."}},
    {{"question": "How does Y work?", "answer": "Y works by ..."}}
]

Text to use for generating flashcards:

{chunk}


Return strictly a JSON array.
"""

class FlashcardAgent:
    def __init__(self, llm=None):
        # If an explicit llm is provided (e.g., ChatOpenAI), use it. Otherwise
        # create a Google Gemini wrapper that exposes predict(). This keeps
        # backwards compatibility.
        if llm is None:
            self.llm = create_google_llm()
            # self.chain will be a thin wrapper that calls self.llm.predict
            self.chain = None
        else:
            self.llm = llm
            self.chain = LLMChain(llm=self.llm, prompt=PromptTemplate.from_template(FLASH_PROMPT))

    def _response_to_text(self, resp):
        """
        Normalize chain response into a string safely.
        Newer versions of LangChain may return dicts (mapping output keys -> values).
        Older versions may return a raw string.
        """
        if resp is None:
            return ""
        if isinstance(resp, str):
            return resp
        if isinstance(resp, dict):
            # try common keys
            for k in ("text", "output_text", "response", "result"):
                if k in resp and isinstance(resp[k], str):
                    return resp[k]
            # fallback: take the first string-like value
            for v in resp.values():
                if isinstance(v, str):
                    return v
            # last resort: convert to json string
            try:
                return json.dumps(resp)
            except Exception:
                return str(resp)
        return str(resp)

    def generate_from_chunks(self, chunks):
        print("***FlashcardAgent generating from chunks...")
        out = []
        for c in chunks:
            # Use .predict to avoid deprecated Chain.__call__/run usage.
            # LLMChain.predict accepts kwargs for template variables.
            print("***FlashcardAgent processing chunk...")
            # If using GoogleLLM wrapper, call predict directly; otherwise use chain
            try:
                if self.chain is None:
                    resp = self.llm.predict(FLASH_PROMPT.replace("{chunk}", c))
                else:
                    resp = self.chain.predict(chunk=c)
            except Exception as e:
                print("***FlashcardAgent exception during prediction/invocation", e)
                resp = ""
            text = self._response_to_text(resp)
            print(f"***FlashcardAgent processed text: {text}")
            # try strict JSON parse first
            try:
                parsed = json.loads(text)
                print(f"***FlashcardAgent parsed JSON: {parsed}")
                if isinstance(parsed, list):
                    out.extend(parsed)
                    continue
            except Exception:
                pass

            # salvage: find first JSON array in the output
            m = re.search(r'(\[.*\])', text, re.S)
            print(f"***FlashcardAgent regex search match: {m}")
            if m:
                try:
                    parsed = json.loads(m.group(1))
                    print(f"***FlashcardAgent salvaged parsed JSON: {parsed}")
                    if isinstance(parsed, list):
                        out.extend(parsed)
                        continue
                except Exception:
                    # final fallback: try to parse line-by-line Q: A:
                    pass

            # fallback: naive line extraction as last resort
            # split into QA pairs by lines containing '?' or 'Q:' / 'A:'
            lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
            print(f"***FlashcardAgent fallback lines: {lines}")
            qa = []
            cur_q = None
            for ln in lines:
                if ln.endswith("?") and not cur_q:
                    cur_q = ln
                elif ln.lower().startswith("q:"):
                    cur_q = ln[2:].strip()
                elif ln.lower().startswith("a:") and cur_q:
                    qa.append({"question": cur_q, "answer": ln[2:].strip()})
                    cur_q = None
            out.extend(qa)
        return out
