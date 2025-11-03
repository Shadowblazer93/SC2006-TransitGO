import React, { useState } from "react";

export default function FareCalculator() {
  const [originQuery, setOriginQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [origin, setOrigin] = useState(null); // { name, lat, lng }
  const [dest, setDest] = useState(null);
  const [searching, setSearching] = useState(false);
  const [routing, setRouting] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [error, setError] = useState(null);

  const token = import.meta.env.VITE_ONEMAP_TOKEN || "";

  const extractLatLng = (item) => {
    if (!item) return null;
    if (item.SGLat && item.SGLon) {
      const lat = Number(item.SGLat), lng = Number(item.SGLon);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
    }
    if (item.LATITUDE != null && (item.LONGITUDE != null || item.LONGTITUDE != null)) {
      const lat = Number(item.LATITUDE);
      const lng = Number(item.LONGITUDE ?? item.LONGTITUDE);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
    }
    if (item.geometry && Array.isArray(item.geometry.coordinates)) {
      const coords = item.geometry.coordinates;
      return { lat: Number(coords[1]), lng: Number(coords[0]) };
    }
    // fallback common fields
    if (item.latitude != null && item.longitude != null) {
      return { lat: Number(item.latitude), lng: Number(item.longitude) };
    }
    return null;
  };

  const searchLocation = async (query) => {
    if (!query || !token) return null;
    try {
      const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=N&pageNum=1`;
      const res = await fetch(url, { method: "GET", headers: { Authorization: `${token}` } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Search failed ${res.status}: ${txt.slice(0, 300)}`);
      }
      const data = await res.json();
      const first = Array.isArray(data.results) && data.results.length ? data.results[0] : Array.isArray(data) && data.length ? data[0] : data;
      if (!first) return null;
      const latlng = extractLatLng(first);
      if (!latlng) return null;
      const name = first.ADDRESS ?? first.searchVal ?? first.BLK_HOUSE_NO ?? first.ROAD ?? first.description ?? query;
      return { name, lat: latlng.lat, lng: latlng.lng, raw: first };
    } catch (err) {
      console.error("searchLocation error", err);
      return null;
    }
  };

  const handleSearch = async (which) => {
    setError(null);
    if (!token) {
      setError("VITE_ONEMAP_TOKEN not set (check .env)");
      return;
    }
    const q = which === "origin" ? originQuery.trim() : destQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const result = await searchLocation(q);
      if (!result) {
        setError("No location found for query.");
        return;
      }
      if (which === "origin") setOrigin(result);
      else setDest(result);
    } catch (err) {
      setError("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const computeRoute = async () => {
    setError(null);
    setItineraries([]);
    if (!origin || !dest) {
      setError("Both origin and destination must be set.");
      return;
    }
    if (!token) {
      setError("VITE_ONEMAP_TOKEN not set");
      return;
    }
    setRouting(true);
    try {
      const start = `${origin.lat},${origin.lng}`;
      const end = `${dest.lat},${dest.lng}`;
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const dateStr = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${now.getFullYear()}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const url = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&routeType=pt&date=${encodeURIComponent(dateStr)}&time=${encodeURIComponent(timeStr)}&mode=TRANSIT&numItineraries=3`;

      const res = await fetch(url, { method: "GET", headers: { Authorization: `${token}` } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Routing failed ${res.status}: ${txt.slice(0, 500)}`);
      }
      const data = await res.json();
      const its = data?.plan?.itineraries;
      if (!Array.isArray(its) || its.length === 0) {
        setError("No itineraries returned.");
        return;
      }
      // normalize itineraries and extract fare info
      const normalized = its.map((it) => {
        const minutes = Math.round((it.duration ?? 0) / 60);
        const transfers = it.transfers ?? 0;
        const fare = it.fare ?? null; // could be object or string
        return { itinerary: it, minutes, transfers, fare };
      });
      setItineraries(normalized);
    } catch (err) {
      console.error("computeRoute error", err);
      setError(err.message ?? "Routing error");
    } finally {
      setRouting(false);
    }
  };

  const renderFareDisplay = (fare) => {
    if (!fare) return <div style={{ fontSize: 18 }}>Fare not available</div>;
    // fare might be string, number, or object { amount, currency, details } or complex structure
    if (typeof fare === "string" || typeof fare === "number") {
      return <div style={{ fontSize: 44, fontWeight: 800 }}>{'S$ '+String(fare)}</div>;
    }
    // try common shapes
    if (fare.amount != null) {
      const currency = fare.currency ?? "";
      return (
        <div>
          <div style={{ fontSize: 20, color: "#666" }}>{currency}</div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>{String(fare.amount)}</div>
        </div>
      );
    }
    // fallback: pretty-print object
    try {
      const txt = JSON.stringify(fare);
      return <div style={{ fontSize: 20, fontWeight: 700 }}>{txt}</div>;
    } catch {
      return <div style={{ fontSize: 18 }}>Fare available (details hidden)</div>;
    }
  };

  return (
    <div style={{ padding: 12, maxWidth: 920 }}>
      <div style={{
          top: 0,
          left: 0,
          right: 0,
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          background: '#ddd',
          borderBottom: '2px solid #aaa',
          zIndex: 999,
          boxSizing: 'border-box',
          borderRadius: 15,
          marginBottom: 20
        }}>
        <h1 style={{ fontSize: 25, margin: 0, fontWeight:600 }}>Fare Calculator</h1>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", background:'#eee', padding:10, borderRadius:15 }}>
        <div style={{ minWidth: 280 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Origin Location</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={originQuery}
              onChange={(e) => setOriginQuery(e.target.value)}
              placeholder="Search origin (address or postal)"
              style={{ flex: 1, padding: "8px 10px", fontSize: 15, borderRadius: 6, border: "1px solid #ccc", background:'#fff' }}
            />
            <button onClick={() => handleSearch("origin")} disabled={searching} style={{ padding: "7px 12px", cursor: "pointer", background:'#d6efffff', border: '1px solid #abc3dbff', borderRadius:10 }}>
              {searching ? "..." : "Search"}
            </button>
            <div aria-hidden style={{ width: 28, textAlign: "center" }}>
              {origin ? (
                <span title="Set" style={{ display: "inline-block", width: 22, height: 22, borderRadius: 12, background: "#2ecc71", color: "#fff", lineHeight: "22px", fontWeight: 700 }}>
                  ✓
                </span>
              ) : null}
            </div>
          </div>
          {origin ? <div style={{ marginTop: 6, color: "#333" }}><strong>{origin.name}</strong> • {origin.lat.toFixed(6)},{origin.lng.toFixed(6)}</div> : null}
        </div>

        <div style={{ minWidth: 280, marginTop:10 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Destination Location</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={destQuery}
              onChange={(e) => setDestQuery(e.target.value)}
              placeholder="Search destination (address or postal)"
              style={{ flex: 1, padding: "8px 10px", fontSize: 15, borderRadius: 6, border: "1px solid #ccc", background:'#fff' }}
            />
            <button onClick={() => handleSearch("dest")} disabled={searching} style={{ padding: "7px 12px", cursor: "pointer", background:'#d6efffff', border: '1px solid #abc3dbff', borderRadius:10 }}>
              {searching ? "..." : "Search"}
            </button>
            <div aria-hidden style={{ width: 28, textAlign: "center" }}>
              {dest ? (
                <span title="Set" style={{ display: "inline-block", width: 22, height: 22, borderRadius: 12, background: "#2ecc71", color: "#fff", lineHeight: "22px", fontWeight: 700 }}>
                  ✓
                </span>
              ) : null}
            </div>
          </div>
          {dest ? <div style={{ marginTop: 6, color: "#333" }}><strong>{dest.name}</strong> • {dest.lat.toFixed(6)},{dest.lng.toFixed(6)}</div> : null}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center"}}>
          <button
            onClick={computeRoute}
            disabled={routing || !origin || !dest}
            style={{ padding: "10px 16px", background: routing ? "#ccc" : "#1976d2", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
          >
            {routing ? "Calculating..." : "Get Fare"}
          </button>
        </div>
      </div>

      {error ? <div style={{ marginTop: 12, color: "#c62828" }}>{error}</div> : null}

      {/* Fare / Results */}
      <div style={{ marginTop: 18 }}>
        {itineraries.length === 0 ? (
          <div style={{ color: "#666" }}>No route calculated yet.</div>
        ) : (
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: '93vw', padding: 16, borderRadius: 8, background: "#fafafa", border: "1px solid #eee" }}>
              <div style={{ fontSize: 14, color: "#777", marginBottom: 6 }}>Fare (primary itinerary)</div>
              <div style={{ marginBottom: 6 }}>
                {renderFareDisplay(itineraries[0].fare)}
              </div>
              <div style={{ fontSize: 13, color: "#444" }}>Duration: <strong>{itineraries[0].minutes} min</strong></div>
              <div style={{ fontSize: 13, color: "#444" }}>Transfers: <strong>{itineraries[0].transfers}</strong></div>
            </div>

            <div style={{ flex: 1, minWidth: 360 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>All returned itineraries</div>
              {itineraries.map((it, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 8, border: "1px solid #eee", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><strong>Itinerary {i + 1}</strong></div>
                    <div style={{ color: "#666" }}>{it.minutes} min • {it.transfers} transfers</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 13, color: "#444" }}>Fare: {it.fare ? (typeof it.fare === "string" ? it.fare : JSON.stringify(it.fare)) : "—"}</div>
                    {/* show simple leg summary */}
                    {Array.isArray(it.itinerary?.legs) && (
                      <div style={{ marginTop: 8, fontSize: 13 }}>
                        {(it.itinerary.legs || []).slice(0, 4).map((leg, li) => (
                          <div key={li} style={{ marginBottom: 6 }}>
                            <div style={{ fontWeight: 600 }}>{(leg.mode || "LEG").toUpperCase()}{leg.route ? ` • ${leg.route}` : ""}</div>
                            <div style={{ color: "#555" }}>{leg.from?.name ?? "—"} → {leg.to?.name ?? "—"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}