// src/pages/UserHomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const TitleIcon = ({ kind }) => {
  const props = { width:16, height:16, viewBox:'0 0 24 24', style:{display:'inline-block', verticalAlign:'middle', stroke:'#4f46e5', fill:'none', strokeWidth:1.8} };
  switch (kind) {
    case 'map':
      return <svg {...props}><path d="M3 5l6 2 6-2 6 2v12l-6-2-6 2-6-2V5z"/><path d="M9 7v12M15 5v12"/></svg>;
    case 'crowd':
      return <svg {...props}><path d="M4 13h16M4 17h12M4 9h8"/></svg>;
    case 'service':
      return <svg {...props}><circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/></svg>;
    case 'fare':
      return <svg {...props}><circle cx="12" cy="12" r="8"/><path d="M9 9h6M9 12h6M9 15h6"/></svg>;
    case 'fav':
      return <svg {...props}><path d="M12 20s-6.5-4.2-8-7.6C2.7 9.4 4 7 6.7 7c1.6 0 2.7.8 3.3 1.8C10.6 7.8 11.7 7 13.3 7c2.7 0 4 2.4 2.7 5.4C14.5 15.8 12 20 12 20z"/></svg>;
    case 'routes':
      return <svg {...props}><path d="M5 6h14M5 12h9M5 18h6"/></svg>;
    case 'downloads':
      return <svg {...props}><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 19h14"/></svg>;
    case 'history':
      return <svg {...props}><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>;
    case 'feedback':
      return <svg {...props}><path d="M4 5h16v10H8l-4 4V5z"/></svg>;
    default:
      return null;
  }
};

const items = [
  { kind:'map',       to:'/map',            title:'Interactive Map',       sub:'Leaflet + OpenStreetMap' },
  { kind:'crowd',     to:'/crowdness',      title:'Platform Crowdness',    sub:'Forecast by station & hour' },
  { kind:'service',   to:'/services',       title:'MRT Services',          sub:'Current line status & reports' },
  { kind:'fare',      to:'/farecalculator', title:'Fare Calculator',       sub:'Estimate fares quickly' },
  { kind:'fav',       to:'/favourites',     title:'Favourites',            sub:'Save places & routes' },
  { kind:'routes',    to:'/savedroutes',    title:'Saved Routes',          sub:'Your planned trips' },
  { kind:'downloads', to:'/downloadedarea', title:'Downloaded Areas',      sub:'Offline regions' },
  { kind:'history',   to:'/triphistory',    title:'Trip History',          sub:'Recent trips' },
  { kind:'feedback',  to:'/userfeedback',   title:'Feedback',              sub:'Tell us what to improve' },
];

export default function UserHomePage() {
  // Single-column list with icons in the title row
  return (
    <div style={{maxWidth:520, margin:'0 auto'}}>
      <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12}}>
        {items.map(it => (
          <li key={it.to}>
            <Link
              to={it.to}
              style={{
                display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:12,
                textDecoration:'none', color:'inherit',
                background:'#fff', border:'1px solid var(--border)',
                borderRadius:14, padding:14, boxShadow:'var(--shadow-soft)'
              }}
            >
              <div>
                <div style={{display:'flex', alignItems:'center', gap:8, fontWeight:800}}>
                  <TitleIcon kind={it.kind} />
                  <span>{it.title}</span>
                </div>
                <div className="muted" style={{fontSize:13, marginTop:4}}>{it.sub}</div>
              </div>
              <span style={{color:'var(--muted)'}}>›</span>
            </Link>
          </li>
        ))}
      </ul>
      <div style={{height:12}} />
    </div>
  );
}
