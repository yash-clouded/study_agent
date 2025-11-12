import React, { useState, useEffect } from "react";
import UploadPanel from "./components/UploadPanel";
import Flashcards from "./components/Flashcards";
import Quizzes from "./components/Quizzes";
import Planner from "./components/Planner";
import Chat from "./components/Chat";
import { fetchFlashcards, fetchQuizzes, fetchPlanner } from "./api";

export default function App(){
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [planner, setPlanner] = useState([]);

  const loadAll = async () => {
    try{
      const f = await fetchFlashcards();
      const q = await fetchQuizzes();
      const p = await fetchPlanner();
      setFlashcards(f.data || []);
      setQuizzes(q.data || []);
      setPlanner(p.data || []);
    }catch(e){
      console.error(e);
    }
  };

  const addQuizzes = async () => {
    try {
      // fetch quizzes from backend and merge uniquely by question text
      const resp = await fetchQuizzes();
      const newItems = resp.data || [];
      // avoid duplicates by question text
      const existingQs = new Set(quizzes.map((q) => q.question));
      const toAdd = newItems.filter((q) => !existingQs.has(q.question));
      if (toAdd.length > 0) {
        setQuizzes((prev) => [...prev, ...toAdd]);
      }
    } catch (e) {
      console.error("Failed to fetch quizzes:", e);
    }
  };

  useEffect(()=>{ loadAll(); }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Inter, sans-serif" }}>
      <h1>Study Agent Dashboard</h1>
      <UploadPanel onDone={loadAll}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div>
          <h2>Flashcards</h2>
          <Flashcards cards={flashcards} />
        </div>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 12 }}>
            Quizzes
            <button onClick={addQuizzes} style={{ padding: "6px 10px", fontSize: 14 }}>
              Add quiz
            </button>
          </h2>
          <Quizzes quizzes={quizzes} />
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <h2>Planner</h2>
        <Planner plan={planner} />
      </div>
      <div style={{ marginTop: 20 }}>
        <h2>Ask a Doubt</h2>
        <Chat />
      </div>
    </div>
  );
}
