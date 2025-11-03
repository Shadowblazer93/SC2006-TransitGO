import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const readPref = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; }
};
const writePref = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export default function UserProfile(){
  const nav = useNavigate();
  const [name, setName] = useState(readPref('profile.name','Alice Moreno'));
  const [email, setEmail] = useState(readPref('profile.email','alice.moreno@example.com'));
  const [narrator, setNarrator] = useState(readPref('a11y.narrator', false));
  const [voice, setVoice] = useState(readPref('a11y.voice', true));
  const [fontLabel, setFontLabel] = useState(readPref('ui.fontLabel','Medium'));

  useEffect(()=>writePref('profile.name',name),[name]);
  useEffect(()=>writePref('profile.email',email),[email]);
  useEffect(()=>writePref('a11y.narrator',narrator),[narrator]);
  useEffect(()=>writePref('a11y.voice',voice),[voice]);
  useEffect(()=>writePref('ui.fontLabel',fontLabel),[fontLabel]);

  async function handleLogout(){
    try {
      // Try Supabase if available
      const mod = await import('../../supabaseClient.js').catch(()=>null);
      if (mod?.supabase?.auth) await mod.supabase.auth.signOut();
    } catch {}
    // Clear local-only session/preferences as needed
    // localStorage.removeItem('token'); // if you use one
    nav('/login', { replace:true });
  }

  async function handleDelete(){
    if (!confirm('Delete account? This cannot be undone.')) return;
    // Place your real delete logic here (server call).
    alert('Account deletion is a placeholder in this demo.');
  }

  const Row = ({label, children}) => (
    <div className="row" style={{justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)'}}>
      <div style={{fontWeight:600}}>{label}</div>
      <div>{children}</div>
    </div>
  );

  const Toggle = ({checked, onChange}) => (
    <label style={{display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer'}}>
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}
        style={{width:0,height:0,opacity:0,position:'absolute'}} />
      <span style={{
        width:44,height:26,borderRadius:999,display:'inline-flex',alignItems:'center',
        padding:'3px', background:checked?'#10b981':'#e5e7eb', transition:'all .15s'
      }}>
        <span style={{
          width:20,height:20,borderRadius:'50%', background:'#fff',
          transform:checked?'translateX(18px)':'translateX(0)', transition:'transform .15s'
        }} />
      </span>
    </label>
  );

  return (
    <div className="grid" style={{gap:16}}>
      <section className="card" style={{paddingTop:20}}>
        <h2 className="page-title" style={{textAlign:'center'}}>User Profile</h2>

        {/* Avatar */}
        <div style={{display:'flex',justifyContent:'center', marginTop:12}}>
          <div style={{
            width:88,height:88,borderRadius:'50%', background:'#fee2e2', display:'grid', placeItems:'center',
            border:'2px solid #fff', boxShadow:'var(--shadow)'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" style={{stroke:'#ef4444',fill:'none',strokeWidth:1.6}}>
              <circle cx="12" cy="8" r="3.2" />
              <path d="M4.5 19.5c1.8-3 4.5-4.5 7.5-4.5s5.7 1.5 7.5 4.5" />
            </svg>
          </div>
        </div>

        {/* Name / Email */}
        <div className="grid" style={{gap:6, marginTop:16}}>
          <div className="label">User Name</div>
          <div style={{fontWeight:700}}>{name}</div>
          <div className="label" style={{marginTop:10}}>Email Address</div>
          <div className="muted">{email}</div>
        </div>

        {/* Accessibility */}
        <div className="section" style={{marginTop:16}}>
          <h2>Accessibility</h2>
          <div style={{borderTop:'1px solid var(--border)'}}>
            <Row label="Narrator"><Toggle checked={narrator} onChange={setNarrator} /></Row>
            <Row label="Voice Navigation"><Toggle checked={voice} onChange={setVoice} /></Row>
            <Row label="Font Size">
              <Link to="/font-size" style={{textDecoration:'none', color:'var(--text)'}}>
                <span className="muted" style={{marginRight:6}}>{fontLabel}</span> <span style={{color:'var(--brand-600)'}}>›</span>
              </Link>
            </Row>
          </div>
        </div>

        {/* Actions */}
        <div className="section">
          <h2>Actions</h2>
          <div style={{borderTop:'1px solid var(--border)'}}>
            <div style={{padding:'10px 0'}}><Link to="/change-password" className="link">Change Password</Link></div>
            <div style={{padding:'10px 0'}}><button className="btn" onClick={handleLogout}>Logout</button></div>
            <div style={{padding:'10px 0'}}><button className="btn danger" onClick={handleDelete}>Delete Account</button></div>
          </div>
        </div>
      </section>
    </div>
  );
}
