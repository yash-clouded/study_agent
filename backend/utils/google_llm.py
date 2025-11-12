import os
import google.generativeai as genai
from langchain_core.language_models import LLM
from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from typing import Optional, List, Any

class GoogleLLM(LLM):
    """
    Wrapper around Google Generative AI (Gemini) to be compatible with LangChain.
    Inherits from LangChain's LLM base class to work seamlessly with LLMChain and other components.
    """
    
    model: str = "gemini-2.5-flash"
    temperature: float = 0.1
    top_p: float = 0.95
    top_k: int = 64
    max_output_tokens: int = 8192

    def __init__(self, **kwargs):
        """
        Initialize GoogleLLM instance and configure the Google Generative AI client.
        
        Reads GOOGLE_API_KEY from environment variables and configures genai.
        Raises ValueError if the API key is not set in the environment.
        """
        super().__init__(**kwargs)
        
        # Read API key from environment
        api_key = os.environ.get("GOOGLE_API_KEY")
        
        if not api_key:
            raise ValueError(
                "GOOGLE_API_KEY not set in environment. "
                "Please set your Google API key: export GOOGLE_API_KEY=your_key_here"
            )
        
        # Configure the genai client with the API key
        genai.configure(api_key=api_key)
        print(f"✓ Google Generative AI configured successfully with model: {self.model}")

    @property
    def _llm_type(self) -> str:
        """Return type of llm."""
        return "google_generative_ai"

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """
        Generate text using Google Generative AI.
        
        Args:
            prompt: The input prompt text
            stop: Stop sequences (not used by Gemini)
            run_manager: Callback manager
            **kwargs: Additional arguments
            
        Returns:
            Generated text response
        """
        try:
            generation_config = {
                "temperature": self.temperature,
                "top_p": self.top_p,
                "top_k": self.top_k,
                "max_output_tokens": self.max_output_tokens,
            }
            
            model = genai.GenerativeModel(
                model_name=self.model,
                generation_config=generation_config
            )
            response = model.generate_content(prompt)
            
            if response.text:
                return response.text
            else:
                return ""
                
        except Exception as e:
            raise RuntimeError(f"Google Gemini API error: {str(e)}")

    def predict(self, prompt: str) -> str:
        """
        Convenience method to generate text (for backwards compatibility).
        
        Args:
            prompt: The input prompt text
            
        Returns:
            Generated text response
        """
        return self._call(prompt)


def create_google_llm(
    model: str = "gemini-2.5-flash",
    temperature: float = 0.1,
    **kwargs
) -> GoogleLLM:
    """
    Factory function to create a Google Gemini LLM instance.
    
    Args:
        model: Gemini model to use (default: gemini-2.5-flash)
        temperature: Temperature for generation (default: 0.1)
        **kwargs: Additional arguments passed to GoogleLLM
        
    Returns:
        GoogleLLM instance configured and ready to use
    """
    return GoogleLLM(model=model, temperature=temperature, **kwargs)
