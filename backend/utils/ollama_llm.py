import os
from typing import Optional, List, Any
import requests
from langchain_core.language_models import LLM
from langchain_core.callbacks.manager import CallbackManagerForLLMRun


class OllamaLLM(LLM):
    """
    Wrapper around Ollama for local LLM inference.
    Ollama allows running large language models locally without cloud APIs.
    
    Requires Ollama to be running (typically on http://localhost:11434)
    """
    
    model: str = "mistral"  # Popular fast model, alternatives: llama2, neural-chat, etc.
    base_url: str = "http://localhost:11434"
    temperature: float = 0.1
    top_p: float = 0.95
    top_k: int = 40
    num_predict: int = 2048  # Max tokens to generate

    def __init__(self, **kwargs):
        """
        Initialize OllamaLLM instance.
        
        Verifies that Ollama is running and the specified model is available.
        Raises RuntimeError if Ollama is not accessible.
        """
        super().__init__(**kwargs)
        
        # Use custom base_url if provided in environment
        if "OLLAMA_BASE_URL" in os.environ:
            self.base_url = os.environ.get("OLLAMA_BASE_URL")
        
        # Verify Ollama is running
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                available_models = [m["name"].split(":")[0] for m in response.json().get("models", [])]
                print(f"✓ Ollama is running with models: {available_models}")
                
                # Check if our model is available
                if not any(self.model in m for m in available_models):
                    print(f"⚠ Model '{self.model}' not found. Available: {available_models}")
                    print(f"  To pull the model, run: ollama pull {self.model}")
            else:
                raise RuntimeError(f"Ollama returned status {response.status_code}")
        except requests.exceptions.ConnectionError:
            raise RuntimeError(
                f"Cannot connect to Ollama at {self.base_url}. "
                "Make sure Ollama is running: ollama serve"
            )
        except Exception as e:
            raise RuntimeError(f"Error connecting to Ollama: {str(e)}")
        
        print(f"✓ Ollama LLM configured with model: {self.model}")

    @property
    def _llm_type(self) -> str:
        """Return type of llm."""
        return "ollama"

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """
        Generate text using Ollama.
        
        Args:
            prompt: The input prompt text
            stop: Stop sequences
            run_manager: Callback manager
            **kwargs: Additional arguments
            
        Returns:
            Generated text response
        """
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "top_k": self.top_k,
                "num_predict": self.num_predict,
            }
            
            if stop:
                payload["stop"] = stop
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=300  # 5 minutes timeout for long generations
            )
            
            if response.status_code != 200:
                raise RuntimeError(f"Ollama error: {response.status_code} - {response.text}")
            
            result = response.json()
            return result.get("response", "")
            
        except requests.exceptions.Timeout:
            raise RuntimeError("Ollama request timed out. Model generation took too long.")
        except requests.exceptions.ConnectionError:
            raise RuntimeError(f"Cannot connect to Ollama at {self.base_url}")
        except Exception as e:
            raise RuntimeError(f"Ollama generation error: {str(e)}")

    def predict(self, prompt: str) -> str:
        """
        Convenience method to generate text (for backwards compatibility).
        
        Args:
            prompt: The input prompt text
            
        Returns:
            Generated text response
        """
        return self._call(prompt)


def create_ollama_llm(
    model: str = "mistral",
    base_url: str = "http://localhost:11434",
    temperature: float = 0.1,
    **kwargs
) -> OllamaLLM:
    """
    Factory function to create an Ollama LLM instance.
    
    Args:
        model: Model name to use (default: mistral)
               Popular options: mistral, llama2, neural-chat, orca-mini, starling-lm
        base_url: Ollama server URL (default: http://localhost:11434)
        temperature: Temperature for generation (default: 0.1)
        **kwargs: Additional arguments passed to OllamaLLM
        
    Returns:
        OllamaLLM instance configured and ready to use
        
    Raises:
        RuntimeError: If Ollama is not running or not accessible
    """
    return OllamaLLM(model=model, base_url=base_url, temperature=temperature, **kwargs)
