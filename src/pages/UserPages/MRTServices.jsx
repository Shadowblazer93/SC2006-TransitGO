
import React, { useEffect, useState } from 'react';

const LINES = [
  { id:'NSL', name:'North South Line', color:'#dc2626' },
  { id:'EWL', name:'East West Line',  color:'#16a34a' },
  { id:'NEL', name:'North East Line', color:'#7c3aed' },
  { id:'CCL', name:'Circle Line',     color:'#f59e0b' },
  { id:'DTL', name:'Downtown Line',   color:'#2563eb' },
  { id:'TEL', name:'Thomson-East Coast Line', color:'#a16207' },
];

const STATUSES = ['Good Service','Minor Delay','Disruption'];

function loadState(){
  try { return JSON.parse(localStorage.getItem('mrtStatus') || '{}'); } catch { return {}; }
}
function saveState(s){ localStorage.setItem('mrtStatus', JSON.stringify(s)); }

export default function MRTServices(){
  const [state,setState]=useState(()=>loadState());
  const [note,setNote]=useState('');

  useEffect(()=>{ saveState(state); },[state]);

  const setLineStatus=(id,status)=> setState(prev=>({...prev,[id]:{ ...(prev[id]||{}), status }}));
  const reportIssue=(id)=>{
    const items = state[id]?.issues || [];
    const entry = { id: Date.now(), note: note.trim()||'User report', time: new Date().toISOString() };
    setState(prev=>({...prev,[id]:{ ...(prev[id]||{}), issues:[entry, ...items] }}));
    setNote('');
  };
  const clearIssues=(id)=> setState(prev=>({...prev,[id]:{ ...(prev[id]||{}), issues:[] }}));

  return (
    <div className="grid" style={{gap:16}}>
      <section className="card">
        <h2 className="page-title">MRT Service Availability</h2>
        <p className="page-sub">Track current line status. (Demo, locally stored)</p>
        <div className="grid" style={{gap:12}}>
          {LINES.map(line=>{
            const s = state[line.id]?.status || 'Good Service';
            const issues = state[line.id]?.issues || [];
            return (
              <div key={line.id} className="card">
                <div className="spread" style={{alignItems:'center'}}>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <span style={{display:'inline-block',width:14,height:14,borderRadius:3,background:line.color}}/>
                    <div>
                      <div style={{fontWeight:700}}>{line.name}</div>
                      <div className="muted" style={{fontSize:12}}>{line.id}</div>
                    </div>
                  </div>
                  <span className={`badge ${s==='Good Service' ? 'good' : s==='Minor Delay' ? 'minor' : 'bad'}`}>{s}</span>
                </div>

                <div className="row wrap" style={{marginTop:10}}>
                  {STATUSES.map(opt=>(
                    <button key={opt} className="btn" onClick={()=>setLineStatus(line.id,opt)}>{opt}</button>
                  ))}
                </div>

                <div style={{marginTop:10}}>
                  <div className="label">Quick report</div>
                  <div className="row">
                    <input className="input" placeholder="e.g., Delay at Bishan towards Marina Bay" value={note} onChange={e=>setNote(e.target.value)}/>
                    <button className="btn primary" onClick={()=>reportIssue(line.id)}>Report</button>
                    <button className="btn" onClick={()=>clearIssues(line.id)} disabled={!issues.length}>Clear</button>
                  </div>
                </div>

                {!!issues.length && (
                  <div style={{marginTop:12}}>
                    <div className="label">Recent user reports</div>
                    <ul style={{margin:0,paddingLeft:18}}>
                      {issues.slice(0,5).map(it=>(
                        <li key={it.id}><span style={{fontSize:12,color:'var(--muted)'}}>{new Date(it.time).toLocaleString()} — </span>{it.note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
