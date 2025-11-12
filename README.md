# Study Agent - AI-Powered Learning Tool

A full-stack application that uses AI to help students study more effectively by generating flashcards, quizzes, and study plans from uploaded PDF documents.

## Features

- **PDF Upload & Processing**: Upload PDFs and automatically extract text and chunk it intelligently
- **Flashcard Generation**: AI-generated question-answer flashcards from study material
- **Quiz Generation**: Multiple-choice quizzes with auto-generated questions
- **Study Planning**: Smart study schedules with spaced repetition
- **Chat Interface**: Ask questions about uploaded materials
- **Multi-LLM Support**: Use Google Gemini or OpenAI as your LLM provider

## Tech Stack

### Backend
- **FastAPI** - REST API framework
- **LangChain** - LLM orchestration
- **FAISS** - Vector database for semantic search
- **Google Gemini API** / **OpenAI** - Language models
- **PyMuPDF** - PDF processing

### Frontend
- **React** - UI framework
- **Axios** - HTTP client
- **Vite** - Build tool

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- Either Google Gemini API key OR OpenAI API key

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure API Keys**
   
   **Option A: Google Gemini (Recommended)**
   ```bash
   # Get your API key from: https://aistudio.google.com/app/apikey
   export GOOGLE_API_KEY=your_key_here
   ```

   **Option B: OpenAI (Fallback)**
   ```bash
   export OPENAI_API_KEY=your_key_here
   ```

5. **Run the backend server**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## API Endpoints

### File Upload
- **POST** `/upload_pdf` - Upload a PDF file
  ```bash
  curl -X POST -F "file=@document.pdf" http://localhost:8000/upload_pdf
  ```

### Generation
- **POST** `/generate_all` - Generate flashcards, quizzes, and planner
  ```bash
  curl -X POST http://localhost:8000/generate_all
  ```

### Retrieval
- **GET** `/flashcards` - Get generated flashcards
- **GET** `/quizzes` - Get generated quizzes
- **GET** `/planner` - Get study plan

### Chat
- **POST** `/chat` - Chat about uploaded materials
  ```bash
  curl -X POST -H "Content-Type: application/json" \
    -d '{"question": "What is X?", "chat_history": []}' \
    http://localhost:8000/chat
  ```

## Environment Variables

Create a `.env` file in the backend directory (copy from `.env.example`):

```env
# Google Gemini Configuration (Recommended)
GOOGLE_API_KEY=your_google_api_key_here

# OpenAI Configuration (Optional, used as fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom FAISS index path
FAISS_INDEX_PATH=./outputs/faiss_index

# Optional: Custom LLM model
LLM_MODEL=gpt-4o-mini
```

## Project Structure

```
study_agent/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Configuration (git-ignored)
│   ├── .env.example           # Configuration template
│   ├── agents/
│   │   ├── chat_agent.py      # Conversational retrieval
│   │   ├── flashcard.py       # Flashcard generation
│   │   ├── quiz.py            # Quiz generation
│   │   ├── planner.py         # Study planning
│   │   └── reader.py          # PDF processing
│   ├── utils/
│   │   ├── google_llm.py      # Google Gemini wrapper
│   │   └── pdf_utils.py       # PDF utilities
│   └── outputs/               # Generated files & FAISS index
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── api.js             # API client
│   │   ├── main.jsx           # Entry point
│   │   ├── styles.css         # Global styles
│   │   └── components/
│   │       ├── Chat.jsx
│   │       ├── Flashcards.jsx
│   │       ├── Planner.jsx
│   │       ├── Quizzes.jsx
│   │       └── UploadPanel.jsx
│   ├── package.json
│   └── vite.config.js
└── .gitignore                  # Git ignore rules
```

## Security Notes

🔐 **Important:**
- Never commit `.env` files or API keys to version control
- Rotate API keys if accidentally exposed
- Use `.env.example` to document required variables
- For production, use environment variables or secret management tools

## Troubleshooting

### Import Errors
If you see import errors, ensure the virtual environment is activated:
```bash
source backend/.venv/bin/activate  # macOS/Linux
```

### Google API Errors
- Verify your API key is correct
- Check that the key has Generative AI access enabled
- Ensure the key is set in the environment: `echo $GOOGLE_API_KEY`

### FAISS Index Errors
- Delete `outputs/faiss_index` to reset the vector database
- Upload a PDF to rebuild the index

### Frontend Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Verify frontend is configured with correct API URL

## Development

### Backend Development
- Hot-reload is enabled with `--reload` flag
- Check API docs at `http://localhost:8000/docs`
- View logs in terminal

### Frontend Development
- Hot-reload is enabled by default in Vite
- Check browser DevTools for errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under MIT License. See LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
