
import React, { useMemo, useState } from 'react';

const STATIONS = [
  'Jurong East','Buona Vista','Clementi','Tiong Bahru','Outram Park','Raffles Place','City Hall',
  'Bugis','Paya Lebar','Serangoon','Bishan','Dhoby Ghaut','Woodlands','Yishun','Tampines','Pasir Ris',
  'HarbourFront','Changi Airport','Orchard','Bras Basah','Stevens','Maxwell','Havelock','Shenton Way',
];

function calcCrowdIndex(station, hour){
  // Mock crowdness: busier at CBD and peaks at 8-9am, 6-7pm
  const cbd = ['Raffles Place','City Hall','Dhoby Ghaut','Orchard','Bugis','Outram Park','Maxwell','Shenton Way'];
  let base = cbd.includes(station) ? 60 : 35;
  const h = Number(hour);
  if ([7,8,9,17,18,19].includes(h)) base += 25;
  return Math.max(5, Math.min(100, base + (station.length % 10) - 5));
}

export default function PlatformCrowdness(){
  const [station,setStation]=useState('Raffles Place');
  const [hour,setHour]=useState(8);
  const current = calcCrowdIndex(station, hour);
  const slots = useMemo(()=>[0,1,2,3].map(i=>{
    const hh = (Number(hour)+i)%24;
    return { label: `${hh}:00`, value: calcCrowdIndex(station, hh) };
  }), [station, hour]);

  const bar = (v)=>(<div className="progress"><div style={{width:`${v}%`, background:v>75?'#ef4444':v>50?'#f59e0b':'#10b981'}}/></div>);

  return (
    <div className="grid" style={{gap:16}}>
      <section className="card">
        <h2 className="page-title">Platform Crowdness</h2>
        <p className="page-sub">Estimated crowd level by station & hour (demo).</p>

        <div className="grid" style={{gap:12, gridTemplateColumns:'1fr 160px'}}>
          <div>
            <label className="label">Station</label>
            <input className="input" list="stations" value={station} onChange={e=>setStation(e.target.value)} placeholder="Start typing station name"/>
            <datalist id="stations">
              {STATIONS.map(s=><option key={s} value={s}/>)}
            </datalist>
          </div>
          <div>
            <label className="label">Hour (0-23)</label>
            <input className="input" type="number" min="0" max="23" value={hour} onChange={e=>setHour(e.target.value)} />
          </div>
        </div>

        <div className="grid" style={{gap:10, marginTop:12, gridTemplateColumns:'repeat(4,1fr)'}}>
          <div className="kpi"><div className="label">Now</div><div className="value">{current}%</div></div>
          <div className="kpi"><div className="label">Next</div><div className="value">{slots[1].value}%</div></div>
          <div className="kpi"><div className="label">+2h</div><div className="value">{slots[2].value}%</div></div>
          <div className="kpi"><div className="label">+3h</div><div className="value">{slots[3].value}%</div></div>
        </div>
      </section>

      <section className="card">
        <h3 style={{marginTop:0}}>Crowd forecast</h3>
        <div className="grid" style={{gap:12}}>
          {slots.map(s=>(
            <div key={s.label}>
              <div className="spread">
                <div className="label">{s.label}</div>
                <div style={{fontWeight:700}}>{s.value}%</div>
              </div>
              {bar(s.value)}
            </div>
          ))}
        </div>
        <p className="muted" style={{marginTop:8}}>This is a demo model for UI only. Plug in real feeds later.</p>
      </section>
    </div>
  );
}
