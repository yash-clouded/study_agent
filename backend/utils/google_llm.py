import os
import google.generativeai as genai

# Configure with API key from environment
API_KEY = os.environ.get("GOOGLE_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

# Simple wrapper to provide a predict(prompt) method similar to ChatOpenAI
class GoogleLLM:
    def __init__(self, model: str = "gpt-4o-mini"):
        # choose appropriate Gemini model name; default to "gpt-4o-mini" for parity
        self.model = model

    def predict(self, prompt: str):
        """Return model text for a prompt. Uses google.generativeai.generate_text
        which returns an object with `.text` or `.result` depending on SDK version.
        """
        if not API_KEY:
            raise ValueError("GOOGLE_API_KEY not set in environment")
        resp = genai.generate_text(model=self.model, prompt=prompt)
        # SDK may differ; try to return sensible text
        if hasattr(resp, "text"):
            return resp.text
        if isinstance(resp, dict) and "candidates" in resp:
            # older response shape
            return resp["candidates"][0].get("content", "")
        # fallback
        return str(resp)

# factory
def create_google_llm(model: str = "gpt-4o-mini"):
    return GoogleLLM(model=model)
