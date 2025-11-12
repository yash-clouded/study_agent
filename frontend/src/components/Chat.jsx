import React, { useState } from "react";
import { sendChat } from "../api";

export default function Chat(){
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const ask = async () => {
    if(!q) return;
    setLoading(true);
    try{
      const res = await sendChat({ question: q, chat_history: history });
      setAns(res.data.answer);
      setHistory(h => [...h, [q, res.data.answer]]);
    }catch(e){
      console.error(e);
      setAns("Error contacting server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea value={q} onChange={e=>setQ(e.target.value)} rows={3} style={{ width: "100%" }} />
      <button onClick={ask} disabled={loading}>Ask</button>
      <div style={{ marginTop: 10 }}>
        <strong>Answer</strong>
        <div style={{ whiteSpace: "pre-wrap", background: "#fafafa", padding: 8, borderRadius: 6 }}>{ans}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>History</strong>
        {history.map((h,i)=>(
          <div key={i} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 6 }}>
            <div><em>Q:</em> {h[0]}</div>
            <div><em>A:</em> {h[1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
