import React, { useState } from "react";
import Top_Bar_Return from "../../components/Top_Bar_Return";

const container = { maxWidth: 700, margin: "0 auto", padding: 16 };
const card = { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" };
const row = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 };
const label = { fontWeight: 600, fontSize: 14, color: "#333" };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 };
const btn = { marginTop: 16, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#171717", color: "white", cursor: "pointer" };
const hint = { fontSize: 12, color: "#777", marginTop: 6 };

function estimateFare(stops, distanceKm = null) {
  // Simple placeholder fare model (to be replaced with backend or LTA formula):
  // Base $0.95 + $0.11 per stop after 3 stops, capped at $2.40 for bus/MRT
  // If distanceKm provided, use: $0.92 + $0.10 per km after 3km cap $2.50
  if (distanceKm != null) {
    const fare = 0.92 + Math.max(0, distanceKm - 3) * 0.10;
    return Math.min(2.50, +fare.toFixed(2));
  }
  const fare = 0.95 + Math.max(0, (stops ?? 0) - 3) * 0.11;
  return Math.min(2.40, +fare.toFixed(2));
}

export default function FareCalculator() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stops, setStops] = useState(5);
  const [distance, setDistance] = useState("");
  const [result, setResult] = useState(null);

  const onCalc = (e) => {
    e.preventDefault();
    const d = distance ? parseFloat(distance) : null;
    const fare = estimateFare(parseInt(stops, 10), isNaN(d) ? null : d);
    setResult({ fare, summary: d != null && !isNaN(d) ? `${d} km` : `${stops} stops` });
  };

  return (
    <div>
      <Top_Bar_Return title="Fare Calculator" />
      <div style={container}>
        <div style={card}>
          <form onSubmit={onCalc}>
            <div style={row}>
              <div>
                <label style={label}>From</label>
                <input style={input} placeholder="e.g. Jurong East" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label style={label}>To</label>
                <input style={input} placeholder="e.g. City Hall" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            <div style={row}>
              <div>
                <label style={label}>Estimated Stops</label>
                <input style={input} type="number" min="0" value={stops} onChange={(e) => setStops(e.target.value)} />
                <div style={hint}>Use this if you don’t know distance.</div>
              </div>
              <div>
                <label style={label}>Distance (km) — optional</label>
                <input style={input} type="number" step="0.1" min="0" value={distance} onChange={(e) => setDistance(e.target.value)} />
                <div style={hint}>If provided, we’ll use distance instead of stops.</div>
              </div>
            </div>
            <button type="submit" style={btn}>Estimate fare</button>
          </form>
          {result && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px dashed #eee" }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>${"{"+""}result.fare.toFixed(2){"}"}</div>
              <div style={{ color: "#555" }}>Based on { "{"+""}result.summary{"}" } (rough estimate)</div>
            </div>
          )}
        </div>
        <p style={{ ...hint, marginTop: 12 }}>
          Note: This is a placeholder estimator for UI testing. Replace with actual fare rules or backend API when ready.
        </p>
      </div>
    </div>
  );
}
