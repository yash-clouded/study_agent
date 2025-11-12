import React, { useState, useEffect } from "react";
import UploadPanel from "./components/UploadPanel";
import Flashcards from "./components/Flashcards";
import Quizzes from "./components/Quizzes";
import Planner from "./components/Planner";
import Chat from "./components/Chat";
import { fetchFlashcards, fetchQuizzes, fetchPlanner } from "./api";

export default function App(){
  const [files, setFiles] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [planner, setPlanner] = useState([]);
  const [activeTab, setActiveTab] = useState("upload");

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
      const resp = await fetchQuizzes();
      const newItems = resp.data || [];
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

  const tabs = [
    { id: "upload", label: "📤 Upload", icon: "📤" },
    { id: "flashcards", label: "📚 Flashcards", icon: "📚" },
    { id: "quizzes", label: "✅ Quizzes", icon: "✅" },
    { id: "planner", label: "📅 Planner", icon: "📅" },
    { id: "chat", label: "💬 Chat", icon: "💬" },
  ];

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>📖</span>
            <h1 style={styles.logoText}>Study Agent</h1>
          </div>
          <p style={styles.subtitle}>AI-Powered Learning Assistant</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navTab,
                ...(activeTab === tab.id ? styles.navTabActive : {}),
              }}
            >
              <span style={styles.navTabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        {activeTab === "upload" && <UploadPanel files={files} setFiles={setFiles} onDone={() => { loadAll(); setActiveTab("flashcards"); }} />}
        {activeTab === "flashcards" && <Flashcards cards={flashcards} />}
        {activeTab === "quizzes" && (
          <div>
            <div style={styles.tabHeader}>
              <h2 style={styles.tabTitle}>Quizzes</h2>
              <button onClick={addQuizzes} style={styles.addButton}>
                + Add Quiz
              </button>
            </div>
            <Quizzes quizzes={quizzes} />
          </div>
        )}
        {activeTab === "planner" && <Planner plan={planner} />}
        {activeTab === "chat" && <Chat />}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Study Agent • AI-powered learning for smarter studying</p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    backgroundColor: "#0066ff",
    color: "white",
    padding: "32px 20px",
    boxShadow: "0 2px 8px rgba(0,102,255,0.15)",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  logoIcon: {
    fontSize: "32px",
  },
  logoText: {
    fontSize: "28px",
    fontWeight: "700",
    margin: "0",
  },
  subtitle: {
    fontSize: "14px",
    opacity: "0.9",
    margin: "0",
  },
  nav: {
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
    stickyPosition: "sticky",
    top: "0",
    zIndex: "100",
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    gap: "0",
  },
  navTab: {
    padding: "16px 20px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: "3px solid transparent",
    marginBottom: "-1px",
  },
  navTabActive: {
    color: "#0066ff",
    borderBottomColor: "#0066ff",
    backgroundColor: "#f9f9f9",
  },
  navTabLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  main: {
    flex: "1",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    padding: "20px",
  },
  tabHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  tabTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#0066ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  footer: {
    backgroundColor: "#1a1a1a",
    color: "#999",
    textAlign: "center",
    padding: "20px",
    fontSize: "12px",
    marginTop: "auto",
  },
};
