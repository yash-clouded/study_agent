import React, { useState } from "react";

export default function Flashcards({ cards }){
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if(!cards || cards.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No flashcards yet. Upload a PDF to generate study materials.</p>
      </div>
    );
  }

  const current = cards[currentIndex];
  const handlePrevious = () => {
    if(currentIndex > 0) setCurrentIndex(currentIndex - 1);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if(currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1);
    setIsFlipped(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Flashcards Review</h2>
      
      <div style={styles.cardContainer}>
        <div 
          style={{...styles.card, ...(isFlipped ? styles.cardFlipped : {})}}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div style={styles.cardContent}>
            {isFlipped ? (
              <div>
                <p style={styles.cardLabel}>Answer</p>
                <p style={styles.cardText}>{current.answer}</p>
              </div>
            ) : (
              <div>
                <p style={styles.cardLabel}>Question</p>
                <p style={styles.cardText}>{current.question}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.controls}>
        <button 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          style={{...styles.navButton, ...styles.prevButton}}
        >
          ← Previous
        </button>
        
        <button 
          onClick={() => setIsFlipped(!isFlipped)}
          style={styles.flipButton}
        >
          🔄 Flip Card
        </button>

        <button 
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          style={{...styles.navButton, ...styles.nextButton}}
        >
          Next →
        </button>
      </div>

      <div style={styles.progress}>
        Card {currentIndex + 1} of {cards.length}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center",
    color: "#1a1a1a",
    margin: "0 0 40px 0",
  },
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "40px",
    minHeight: "300px",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    height: "300px",
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  cardFlipped: {
    backgroundColor: "#e8f0ff",
    borderColor: "#0066ff",
    boxShadow: "0 4px 12px rgba(0,102,255,0.15)",
  },
  cardContent: {
    padding: "40px",
    textAlign: "center",
  },
  cardLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 12px 0",
  },
  cardText: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#1a1a1a",
    lineHeight: "1.6",
    margin: "0",
  },
  controls: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  navButton: {
    padding: "10px 20px",
    backgroundColor: "#d4e4ff",
    color: "#0066ff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  prevButton: {},
  nextButton: {
    backgroundColor: "#0066ff",
    color: "white",
  },
  flipButton: {
    padding: "10px 20px",
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
  },
  progress: {
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
  },
};
