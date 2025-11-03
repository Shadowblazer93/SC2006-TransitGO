
import React, { useEffect, useRef, useState } from 'react';

// Load Leaflet from CDN (no npm install needed)
function useLeaflet() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const hasCss = !!document.querySelector('link[data-leaflet]');
    const hasJs = !!document.querySelector('script[data-leaflet]');
    if (!hasCss) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      l.setAttribute('data-leaflet','1');
      document.head.appendChild(l);
    }
    function ensureJs(){
      if (window.L) { setReady(true); return; }
      if (!hasJs){
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.async = true;
        s.setAttribute('data-leaflet','1');
        s.onload = () => setReady(true);
        document.body.appendChild(s);
      } else {
        setReady(true);
      }
    }
    ensureJs();
  }, []);
  return ready;
}

export default function Map(){
  const ready = useLeaflet();
  const mapRef = useRef(null);
  const mapInst = useRef(null);

  useEffect(() => {
    if (!ready) return;
    if (mapInst.current) return;
    const L = window.L;
    const el = mapRef.current;
    mapInst.current = L.map(el).setView([1.3521, 103.8198], 12); // Singapore

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInst.current);

    L.marker([1.3521, 103.8198]).addTo(mapInst.current).bindPopup('Singapore').openPopup();
  }, [ready]);

  const panel = { background:'#fff', border:'1px solid var(--border)', borderRadius:'12px', padding:12 };

  return (
    <div className="grid" style={{gap:16}}>
      <section className="card">
        <h2 className="page-title">Interactive Map</h2>
        <p className="page-sub">Pan, zoom, and tap markers to explore.</p>
        <div ref={mapRef} style={{height: '60vh', borderRadius:12, overflow:'hidden'}} />
      </section>

      <section className="grid" style={{gap:12}}>
        <div className="kpi"><div className="label">Center</div><div className="value">Singapore</div></div>
        <div className="kpi"><div className="label">Provider</div><div className="value">OpenStreetMap + Leaflet</div></div>
      </section>

      <section style={panel}>
        <strong>Tip:</strong> Right-click the map to set a temporary marker. (Coming soon)
      </section>
    </div>
  );
}
