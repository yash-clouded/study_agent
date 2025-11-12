import React, { useState, useEffect } from "react";

export default function Quizzes({ quizzes }){
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Parse options from quiz data
  const parseOptions = (quiz) => {
    if (Array.isArray(quiz.options)) {
      return quiz.options;
    }
    
    if (typeof quiz.options === 'string') {
      // Try to split by "A) B) C) D)" pattern
      const matches = quiz.options.match(/[A-D]\)\s*([^A-D)]+?)(?=[A-D]\)|$)/g);
      if (matches && matches.length > 0) {
        return matches.map(m => m.replace(/^[A-D]\)\s*/, '').trim());
      }
      // Try comma-separated
      const commas = quiz.options.split(',').map(o => o.trim()).filter(o => o);
      if (commas.length > 1) {
        return commas;
      }
      // Fallback: return as single option
      return [quiz.options];
    }
    
    return [];
  };

  // Parse correct answer from various formats
  const parseCorrectAnswer = (quiz) => {
    if (quiz.correct_answer) {
      return quiz.correct_answer;
    }
    if (quiz.answer) {
      // If it's "A", "B", "C", "D", map to actual option
      const options = parseOptions(quiz);
      const answerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      if (quiz.answer in answerMap && options[answerMap[quiz.answer]]) {
        return options[answerMap[quiz.answer]];
      }
      return quiz.answer;
    }
    return null;
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if(!quizzes || quizzes.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No quizzes yet. Upload a PDF to generate study materials.</p>
      </div>
    );
  }

  const current = quizzes[currentIndex];
  const options = parseOptions(current);
  const correctAnswer = parseCorrectAnswer(current);
  const totalQuestions = quizzes.length;
  const questionsAnswered = Object.keys(selectedAnswers).filter(key => key < currentIndex).length;
  const progressPercent = (questionsAnswered / totalQuestions) * 100;

  const handleSelectOption = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: option,
    });
  };

  const handleSubmitAnswer = () => {
    if(selectedAnswers[currentIndex] === undefined) {
      alert("Please select an option before submitting.");
      return;
    }
    
    const isCorrect = selectedAnswers[currentIndex] === correctAnswer;
    setShowResults(true);
    setSubmitted(true);
  };

  const handleNext = () => {
    if(currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResults(false);
      setSubmitted(false);
    }
  };

  const handlePrevious = () => {
    if(currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowResults(false);
      setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAnswered = selectedAnswers[currentIndex] !== undefined;
  const isCorrect = isAnswered && selectedAnswers[currentIndex] === correctAnswer;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Quiz</h2>
        <div style={styles.timerBox}>
          <span style={styles.timerLabel}>Elapsed</span>
          <span style={styles.timerValue}>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      <div style={styles.progressBar}>
        <div style={{...styles.progressFill, width: `${progressPercent}%`}}></div>
      </div>
      <p style={styles.progressText}>Question {currentIndex + 1} of {totalQuestions}</p>

      <div style={styles.questionBox}>
        <p style={styles.questionText}>{current.question}</p>
      </div>

      <div style={styles.optionsContainer}>
        {options.map((option, idx) => {
          const isSelected = selectedAnswers[currentIndex] === option;
          const isCorrectOption = option === correctAnswer;
          let optionStyle = styles.option;
          
          if(submitted) {
            if(isCorrectOption) {
              optionStyle = {...styles.option, ...styles.optionCorrect};
            } else if(isSelected && !isCorrect) {
              optionStyle = {...styles.option, ...styles.optionWrong};
            }
          } else if(isSelected) {
            optionStyle = {...styles.option, ...styles.optionSelected};
          }

          return (
            <button
              key={idx}
              style={optionStyle}
              onClick={() => !submitted && handleSelectOption(option)}
              disabled={submitted}
            >
              <span style={styles.optionLetter}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={styles.optionText}>{option}</span>
              {submitted && isCorrectOption && <span style={styles.checkmark}>✓</span>}
              {submitted && isSelected && !isCorrect && <span style={styles.xmark}>✗</span>}
            </button>
          );
        })}
      </div>

      {showResults && (
        <div style={{...styles.resultBox, backgroundColor: isCorrect ? "#d4edda" : "#f8d7da"}}>
          <p style={{...styles.resultText, color: isCorrect ? "#155724" : "#721c24"}}>
            {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </p>
          {current.explanation && (
            <p style={styles.explanationText}>{current.explanation}</p>
          )}
        </div>
      )}

      <div style={styles.controls}>
        <button 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          style={{...styles.navButton, ...styles.prevButton, opacity: currentIndex === 0 ? 0.5 : 1}}
        >
          ← Previous
        </button>
        
        {!submitted ? (
          <button 
            onClick={handleSubmitAnswer}
            style={styles.submitButton}
            disabled={!isAnswered}
          >
            Submit Answer
          </button>
        ) : (
          <button 
            onClick={handleNext}
            disabled={currentIndex === quizzes.length - 1}
            style={{...styles.navButton, ...styles.nextButton}}
          >
            Next Question →
          </button>
        )}
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0",
  },
  timerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: "8px 16px",
    borderRadius: "6px",
    minWidth: "80px",
  },
  timerLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  timerValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
    marginTop: "2px",
  },
  progressBar: {
    height: "6px",
    backgroundColor: "#e0e0e0",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0066ff",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "12px",
    color: "#999",
    margin: "0 0 24px 0",
    textAlign: "center",
  },
  questionBox: {
    backgroundColor: "#f9f9f9",
    padding: "24px",
    borderRadius: "8px",
    marginBottom: "32px",
    border: "1px solid #e0e0e0",
  },
  questionText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: "1.6",
    margin: "0",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
  },
  option: {
    padding: "16px",
    backgroundColor: "white",
    border: "2px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
  },
  optionSelected: {
    borderColor: "#0066ff",
    backgroundColor: "#e8f0ff",
  },
  optionCorrect: {
    borderColor: "#28a745",
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  optionWrong: {
    borderColor: "#dc3545",
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  optionLetter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    fontWeight: "600",
    fontSize: "14px",
    color: "#666",
    flexShrink: 0,
  },
  optionText: {
    flex: 1,
  },
  checkmark: {
    fontSize: "18px",
    color: "#28a745",
  },
  xmark: {
    fontSize: "18px",
    color: "#dc3545",
  },
  resultBox: {
    padding: "16px",
    borderRadius: "6px",
    marginBottom: "24px",
    border: "1px solid rgba(0,0,0,0.1)",
  },
  resultText: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
  explanationText: {
    fontSize: "14px",
    margin: "8px 0 0 0",
    lineHeight: "1.5",
  },
  controls: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
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
  submitButton: {
    padding: "10px 24px",
    backgroundColor: "#0066ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
  },
};
