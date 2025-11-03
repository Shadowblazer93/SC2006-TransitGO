import React, { useEffect, useState } from "react";
import Top_Bar_Return from "../../components/Top_Bar_Return";

const container = { maxWidth: 800, margin: "0 auto", padding: 16 };
const grid = { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" };
const card = { border: "1px solid #eee", background: "#fff", borderRadius: 12, padding: 12 };

const storageKey = "transitgo:offlineAreas";

export default function DownloadedArea() {
  const [areas, setAreas] = useState([]);
  const [name, setName] = useState("");
  const [bounds, setBounds] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setAreas(raw ? JSON.parse(raw) : []);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(areas));
  }, [areas]);

  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAreas((prev) => [{ id: Date.now(), name: name.trim(), bounds: bounds.trim() }, ...prev]);
    setName(""); setBounds("");
  };

  const remove = (id) => setAreas((prev) => prev.filter((x) => x.id !== id));

  return (
    <div>
      <Top_Bar_Return title="Downloaded Area" />
      <div style={container}>
        <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 12 }}>
          <input placeholder="Region name (e.g. CBD, Tampines)" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }} />
          <input placeholder="Map bounds / note (optional)" value={bounds} onChange={(e) => setBounds(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }} />
          <button className="btn" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd" }}>Save</button>
        </form>
        <div style={grid}>
          {areas.map((a) => (
            <div key={a.id} style={card}>
              <div style={{ fontWeight: 700 }}>{a.name}</div>
              {a.bounds ? <div style={{ color: "#666" }}>{a.bounds}</div> : null}
              <button className="btn" onClick={() => remove(a.id)} style={{ marginTop: 10, border: "1px solid #ddd", background: "#fafafa", borderRadius: 8, padding: "8px 10px" }}>Remove</button>
            </div>
          ))}
        </div>
        <p style={{ color: "#777", fontSize: 12, marginTop: 12 }}>
          This is a UI placeholder to manage offline map regions. Integrate with your map SDK’s tile download APIs later.
        </p>
      </div>
    </div>
  );
}
