import React from "react";

export default function Quizzes({ quizzes }){
  if(!quizzes || quizzes.length === 0) return <div>No quizzes yet.</div>;
  return (
    <div>
      {quizzes.map((q, idx) => (
        <div key={idx} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
          <div><strong>{idx+1}. {q.question}</strong></div>
          <ul>
            {q.options && q.options.map((o,i)=> <li key={i}>{o}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
