import React, { useState } from "react";
import Top_Bar_Return from "../../components/Top_Bar_Return";
import { supabase } from "../../supabaseClient";

const container = { maxWidth: 700, margin: "0 auto", padding: 16 };
const card = { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" };
const row = { display: "grid", gap: 12, marginTop: 12 };
const label = { fontWeight: 600, fontSize: 14, color: "#333" };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 };
const btn = { marginTop: 16, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#171717", color: "white", cursor: "pointer" };
const hint = { fontSize: 12, color: "#777", marginTop: 6 };

export default function UserFeedback() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setPhase("loading"); setError(null);
    try {
      // Try to insert into 'feedback' table. (Adjust to your actual table name.)
      const { data, error } = await supabase.from("feedback").insert({ title, message });
      if (error) throw error;
      setPhase("done");
      setTitle(""); setMessage("");
      alert("Feedback submitted. Thank you!");
    } catch (err) {
      setPhase("error");
      setError(err?.message || String(err));
      console.error(err);
      alert(error?.message || "Failed to submit feedback.");
    }
  };

  return (
    <div>
      <Top_Bar_Return title="Feedback" />
      <div style={container}>
        <div style={card}>
          <form onSubmit={submit}>
            <div style={row}>
              <div>
                <label style={label}>Title</label>
                <input style={input} placeholder="What's the issue or idea?" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={label}>Message</label>
                <textarea rows="6" style={{ ...input, resize: "vertical" }} placeholder="Describe clearly so our team can act." value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
            </div>
            <button className="btn" disabled={phase==="loading"} style={btn}>{phase==="loading" ? "Submitting..." : "Submit feedback"}</button>
          </form>
          {phase==="error" && <div style={{ ...hint, color: "#b00020" }}>{error}</div>}
        </div>
        <p style={{ ...hint, marginTop: 12 }}>Admins can view and reply under Admin → Feedback.</p>
      </div>
    </div>
  );
}
