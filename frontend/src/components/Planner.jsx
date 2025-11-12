import React from "react";

export default function Planner({ plan }){
  if(!plan || plan.length === 0) return <div>No plan yet.</div>;
  return (
    <div>
      {plan.map((p, i) => (
        <div key={i} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
          <div><strong>{p.topic}</strong></div>
          <div>Revise on: {p.revise_on}</div>
          {p.status && <div>Status: {p.status}</div>}
        </div>
      ))}
    </div>
  );
}
