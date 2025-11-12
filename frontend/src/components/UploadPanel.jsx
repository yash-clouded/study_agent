import React, { useState } from "react";
import { uploadPdf, generateAll } from "../api";

export default function UploadPanel({ onDone }){
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if(!file) return alert("choose a PDF");
    setStatus("Uploading...");
    try{
      await uploadPdf(file);
      setStatus("Uploaded. Generating...");
      await generateAll();
      setStatus("Ready");
      onDone && onDone();
    }catch(e){
      console.error(e);
      setStatus("Error. Check console.");
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 10, borderRadius: 8 }}>
      <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{ marginLeft: 10 }}>Upload & Generate</button>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}
