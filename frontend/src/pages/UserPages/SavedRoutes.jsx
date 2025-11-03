import React, { useEffect, useState } from "react";
import Top_Bar_Return from "../../components/Top_Bar_Return";

const container = { maxWidth: 900, margin: "0 auto", padding: 16 };
const list = { display: "grid", gap: 12 };
const card = { border: "1px solid #eee", background: "#fff", borderRadius: 12, padding: 12 };

const storageKey = "transitgo:savedRoutes";

export default function SavedRoutes() {
  const [routes, setRoutes] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setRoutes(raw ? JSON.parse(raw) : []);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(routes));
  }, [routes]);

  const add = (e) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    setRoutes((prev) => [{ id: Date.now(), from: from.trim(), to: to.trim(), note: note.trim(), created: new Date().toISOString() }, ...prev]);
    setFrom(""); setTo(""); setNote("");
  };

  const remove = (id) => setRoutes((prev) => prev.filter((x) => x.id !== id));

  return (
    <div>
      <Top_Bar_Return title="Saved Routes" />
      <div style={container}>
        <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 12 }}>
          <input placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }} />
          <input placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }} />
          <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }} />
          <button className="btn" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd" }}>Save</button>
        </form>
        <div style={list}>
          {routes.map((r) => (
            <div key={r.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.from} → {r.to}</div>
                  {r.note ? <div style={{ color: "#666" }}>{r.note}</div> : null}
                  <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>{new Date(r.created).toLocaleString()}</div>
                </div>
                <button className="btn" onClick={() => remove(r.id)} style={{ border: "1px solid #ddd", background: "#fafafa", borderRadius: 8, padding: "8px 10px" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
