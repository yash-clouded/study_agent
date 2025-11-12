import axios from "axios";

// Default API instance with 5 minute timeout
const API = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 300000, // 5 minutes (300,000 ms)
});

// Extended timeout for long-running operations (10 minutes)
const LONG_TIMEOUT = 600000; // 10 minutes (600,000 ms)

export const uploadPdf = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return API.post("/upload_pdf", fd, { 
    headers: { "Content-Type": "multipart/form-data" },
    timeout: LONG_TIMEOUT 
  });
};

export const generateAll = () => API.post("/generate_all", {}, { timeout: LONG_TIMEOUT });
export const fetchFlashcards = () => API.get("/flashcards");
export const fetchQuizzes = () => API.get("/quizzes");
export const fetchPlanner = () => API.get("/planner");
export const sendChat = (payload) => API.post("/chat", payload);
