import React, { useEffect, useState } from "react";
import Top_Bar_Return from "../../components/Top_Bar_Return";

const container = { maxWidth: 900, margin: "0 auto", padding: 16 };
const table = { width: "100%", borderCollapse: "collapse" };
const thtd = { borderBottom: "1px solid #eee", padding: "10px 8px", textAlign: "left" };

const storageKey = "transitgo:tripHistory";

export default function TripHistory() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setRows(raw ? JSON.parse(raw) : []);
    } catch {}
  }, []);

  const clearAll = () => {
    if (!confirm("Clear history?")) return;
    localStorage.removeItem(storageKey);
    setRows([]);
  };

  return (
    <div>
      <Top_Bar_Return title="Trip History" />
      <div style={container}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn" onClick={clearAll} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}>Clear</button>
        </div>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={thtd}>When</th>
                <th style={thtd}>From → To</th>
                <th style={thtd}>Mode</th>
                <th style={thtd}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td style={{ ...thtd, color: "#777" }} colSpan="4">No history yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td style={thtd}>{new Date(r.at).toLocaleString()}</td>
                  <td style={thtd}>{r.from} → {r.to}</td>
                  <td style={thtd}>{r.mode || "-"}</td>
                  <td style={thtd}>{r.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: "#777", fontSize: 12, marginTop: 12 }}>
          Hook up to your routing screen to auto-append trips after a successful navigation.
        </p>
      </div>
    </div>
  );
}
