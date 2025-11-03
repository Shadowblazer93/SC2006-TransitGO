
import React from 'react';
import { Link } from 'react-router-dom';

export default function UserHomePage(){
  const tiles = [
    {to:'/map', title:'Interactive Map', desc:'Leaflet + OpenStreetMap'},
    {to:'/farecalculator', title:'Fare Calculator', desc:'Estimate fares quickly.'},
    {to:'/crowdness', title:'Platform Crowdness', desc:'Forecast by station & hour.'},
    {to:'/services', title:'MRT Services', desc:'Current line status & reports.'},
    {to:'/favourites', title:'Favourites', desc:'Save places & routes.'},
    {to:'/savedroutes', title:'Saved Routes', desc:'Your planned trips.'},
    {to:'/downloadedarea', title:'Downloaded Areas', desc:'Offline regions.'},
    {to:'/triphistory', title:'Trip History', desc:'Recent trips.'},
    {to:'/userfeedback', title:'Feedback', desc:'Tell us what to improve.'},
  ];
  return (
    <div className="grid grid-auto">
      {tiles.map(t=>(
        <Link key={t.to} to={t.to} className="card" style={{textDecoration:'none',color:'inherit'}}>
          <div className="spread" style={{marginBottom:8}}>
            <h3 style={{margin:0}}>{t.title}</h3>
            <span style={{color:'var(--brand-600)'}}>›</span>
          </div>
          <p className="muted">{t.desc}</p>
        </Link>
      ))}
    </div>
  );
}
