import React, { useEffect, useState } from "react";
import Top_Bar_Return from "../../components/Top_Bar_Return";

const container = { maxWidth: 800, margin: "0 auto", padding: 16 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 };
const card = { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 };

const storageKey = "transitgo:favourites";

export default function Favourites() {
  const [items, setItems] = useState([]);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const add = (e) => {
    e.preventDefault();
    if (!label.trim() || !value.trim()) return;
    setItems((prev) => [{ id: Date.now(), label: label.trim(), value: value.trim() }, ...prev]);
    setLabel(""); setValue("");
  };

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div>
      <Top_Bar_Return title="Favourites" />
      <div style={container}>
        <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 12 }}>
          <input style={input} placeholder="Label (e.g. Home, Office)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <input style={input} placeholder="Station/Bus Stop/Place" value={value} onChange={(e) => setValue(e.target.value)} />
          <button className="btn" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd" }}>Add</button>
        </form>
        <div style={grid}>
          {items.map((it) => (
            <div key={it.id} style={card}>
              <div>
                <div style={{ fontWeight: 700 }}>{it.label}</div>
                <div style={{ color: "#666" }}>{it.value}</div>
              </div>
              <button className="btn" onClick={() => remove(it.id)} style={{ border: "1px solid #ddd", background: "#fafafa", borderRadius: 8, padding: "8px 10px" }}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
