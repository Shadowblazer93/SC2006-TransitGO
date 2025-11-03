import React, { useEffect, useMemo, useRef, useState } from 'react';

const SIZES = [
  {label:'Very Small',      scale:0.85},
  {label:'Small',           scale:0.92},
  {label:'Medium',          scale:1.00},
  {label:'Large',           scale:1.10},
  {label:'Very Large',      scale:1.22},
  {label:'Extremely Large', scale:1.36},
];

export default function FontSize(){
  // find saved scale or default to Medium
  const saved = Number(localStorage.getItem('ui.fontScale') || '1') || 1;
  const initialIndex = Math.max(0, SIZES.findIndex(s => Math.abs(s.scale - saved) < 1e-6));
  const [activeIdx, setActiveIdx] = useState(initialIndex);

  const listRef = useRef(null);
  const ITEM_H = 44;          // px per row
  const VISIBLE = 5;          // rows shown (odd number)
  const PAD = Math.floor(VISIBLE/2) * ITEM_H; // top/bottom pad so the center line aligns

  // Apply font scale immediately whenever active changes
  useEffect(() => {
    const scale = SIZES[activeIdx].scale;
    const label = SIZES[activeIdx].label;
    document.documentElement.style.setProperty('--font-scale', String(scale));
    localStorage.setItem('ui.fontScale', String(scale));
    localStorage.setItem('ui.fontLabel', label);
  }, [activeIdx]);

  // On mount: scroll the wheel to the saved item
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: activeIdx * ITEM_H, behavior: 'auto' });
  }, []);

  // When user scrolls, find the row closest to center and snap state to it
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        let bestIdx = 0, bestDist = Infinity;
        const children = [...el.querySelectorAll('[data-option]')];
        children.forEach((node, i) => {
          const r = node.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          const d = Math.abs(mid - centerY);
          if (d < bestDist) { bestDist = d; bestIdx = i; }
        });
        if (bestIdx !== activeIdx) setActiveIdx(bestIdx);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); el.removeEventListener('scroll', onScroll); };
  }, [activeIdx]);

  // click to center a row
  const centerTo = (idx) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    setActiveIdx(idx);
  };

  return (
    <div className="card">
      <h2 className="page-title">Font Size</h2>
      <div className="wheel"
           ref={listRef}
           style={{
             position:'relative',
             height: ITEM_H * VISIBLE,
             overflowY:'auto',
             scrollSnapType:'y mandatory',
             paddingTop: PAD, paddingBottom: PAD,
             overscrollBehavior:'contain'
           }}>
        {/* center highlight line */}
        <div style={{
          position:'sticky', top:`calc(50% - ${ITEM_H/2}px)`,
          height: ITEM_H, borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)',
          pointerEvents:'none'
        }} />
        {/* options */}
        {SIZES.map((s, i) => (
          <div key={s.label}
               data-option
               onClick={() => centerTo(i)}
               style={{
                 height: ITEM_H, display:'flex', alignItems:'center', justifyContent:'space-between',
                 padding:'0 6px', scrollSnapAlign:'center', cursor:'pointer'
               }}>
            <span style={{opacity: i===activeIdx ? 1 : 0.65, fontWeight: i===activeIdx ? 700 : 500}}>
              {s.label}
            </span>
            <span style={{opacity: i===activeIdx ? 1 : 0, fontSize:18}}>✓</span>
          </div>
        ))}
      </div>
      <p className="muted" style={{marginTop:10}}>Scroll to pick. Changes apply immediately.</p>
    </div>
  );
}
