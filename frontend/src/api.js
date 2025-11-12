import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 60000,
});

export const uploadPdf = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return API.post("/upload_pdf", fd, { headers: { "Content-Type": "multipart/form-data" } });
};

export const generateAll = () => API.post("/generate_all");
export const fetchFlashcards = () => API.get("/flashcards");
export const fetchQuizzes = () => API.get("/quizzes");
export const fetchPlanner = () => API.get("/planner");
export const sendChat = (payload) => API.post("/chat", payload);
