import React, { useState, useRef } from "react";
import { uploadPdf, generateAll } from "../api";

export default function UploadPanel({ files = [], setFiles = () => {}, onDone }){
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const pdfFiles = newFiles.filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    setFiles(prev => [...prev, ...pdfFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateStudyAids = async () => {
    if(files.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    
    setIsLoading(true);
    setStatus("Uploading and processing...");
    
    try {
      // Upload each file and generate
      for (let i = 0; i < files.length; i++) {
        setStatus(`Processing file ${i + 1}/${files.length}...`);
        await uploadPdf(files[i]);
      }
      
      setStatus("Generating flashcards, quizzes, and study plans...");
      await generateAll();
      
      setStatus("✅ Complete! Study materials ready.");
      setFiles([]);
      
      setTimeout(() => {
        onDone && onDone();
      }, 1500);
    } catch(e){
      console.error(e);
      setStatus("❌ Error. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Empower Your Learning with AI</h1>
        <p style={styles.subtitle}>
          Upload your notes and PDF slides, and let StudyBuddy AI transform them into
          personalized flashcards, quizzes, and revision plans.
        </p>
      </div>

      <div style={styles.uploadSection}>
        <h2 style={styles.sectionTitle}>Upload Your Study Materials</h2>
        <p style={styles.sectionSubtitle}>
          Drag and drop your files here, or click to browse. Supported formats: PDF, DOCX, PPTX, TXT.
        </p>

        <div 
          style={styles.dropZone}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div style={styles.dropZoneContent}>
            <div style={styles.cloudIcon}>☁️</div>
            <p style={styles.dragDropText}>Drag & drop your notes here</p>
            <p style={styles.orText}>or</p>
            <button 
              onClick={handleBrowseClick}
              style={styles.browseButton}
            >
              Browse Files
            </button>
            <p style={styles.maxFileSize}>Max file size: 25MB</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.txt"
          onChange={handleFileInput}
          style={{ display: "none" }}
        />

        {files.length > 0 && (
          <div style={styles.filesList}>
            <h3 style={styles.filesHeader}>Selected Files ({files.length})</h3>
            <div style={styles.filesContainer}>
              {files.map((file, idx) => (
                <div key={idx} style={styles.fileItem}>
                  <div style={styles.fileInfo}>
                    <span style={styles.fileIcon}>📄</span>
                    <span style={styles.fileName}>{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    style={styles.removeButton}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={styles.buttonsContainer}>
        {files.length > 0 && (
          <button 
            onClick={() => setFiles([])}
            style={styles.clearButton}
            disabled={isLoading}
          >
            Clear All Files
          </button>
        )}
        <button 
          onClick={handleGenerateStudyAids}
          style={styles.generateButton}
          disabled={isLoading || files.length === 0}
        >
          {isLoading ? "Processing..." : "Generate Study Aids"}
        </button>
      </div>

      {status && (
        <div style={styles.statusMessage}>
          {status}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 12px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    margin: "0",
    lineHeight: "1.6",
  },
  uploadSection: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  },
  sectionSubtitle: {
    fontSize: "14px",
    color: "#999",
    margin: "0 0 20px 0",
  },
  dropZone: {
    border: "2px dashed #ddd",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    backgroundColor: "#fafafa",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "20px",
  },
  dropZoneContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  cloudIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  dragDropText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    margin: "0",
  },
  orText: {
    fontSize: "14px",
    color: "#999",
    margin: "8px 0",
  },
  browseButton: {
    backgroundColor: "#0066ff",
    color: "white",
    border: "none",
    padding: "10px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "8px",
    transition: "background-color 0.3s ease",
  },
  maxFileSize: {
    fontSize: "12px",
    color: "#999",
    margin: "12px 0 0 0",
  },
  filesList: {
    marginBottom: "20px",
  },
  filesHeader: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 12px 0",
  },
  filesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px",
    backgroundColor: "#f5f5f5",
    borderRadius: "6px",
    fontSize: "14px",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  fileIcon: {
    fontSize: "16px",
  },
  fileName: {
    color: "#333",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  removeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#999",
    fontSize: "18px",
    cursor: "pointer",
    padding: "0 8px",
    transition: "color 0.2s ease",
  },
  buttonsContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  clearButton: {
    padding: "10px 20px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  generateButton: {
    padding: "10px 28px",
    backgroundColor: "#0066ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  statusMessage: {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#f0f7ff",
    color: "#0066ff",
    borderRadius: "6px",
    textAlign: "center",
    fontSize: "14px",
  },
};
