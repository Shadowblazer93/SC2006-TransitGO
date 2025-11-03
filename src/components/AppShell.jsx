import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import FooterNav from './FooterNav.jsx';

export default function AppShell(){
  const loc = useLocation();
  const headerRef = useRef(null);
  const [profileName, setProfileName] = useState('Alice Moreno');

  // read saved profile name (fallback shown in your mock)
  useEffect(() => {
    try {
      const n = JSON.parse(localStorage.getItem('profile.name'));
      if (n && typeof n === 'string') setProfileName(n);
    } catch {}
  }, []);

  // Dynamically set --header-h to actual header height (keeps content scrollable)
  useLayoutEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver(() => {
      const h = headerRef.current.getBoundingClientRect().height || 56;
      document.documentElement.style.setProperty('--header-h', `${Math.round(h)}px`);
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  // Title: Home shows the user's name; other pages show simple titles
  const titles = {
    '/':'Home',
    '/map':'Interactive Map',
    '/farecalculator':'Fare Calculator',
    '/favourites':'Favourites',
    '/savedroutes':'Saved Routes',
    '/downloadedarea':'Downloaded Areas',
    '/triphistory':'Trip History',
    '/userfeedback':'Feedback',
    '/crowdness':'Platform Crowdness',
    '/services':'MRT Services Availability',
    '/profile':'User Profile',
    '/font-size':'Font Size',
  };
  const routeTitle = titles[loc.pathname] ?? 'TransitGO';
  const headerTitle = loc.pathname === '/' ? profileName : routeTitle;

  return (
    <div style={{minHeight:'100vh'}}>
      <header ref={headerRef}
        style={{
          position:'sticky', top:0, zIndex:10, background:'#fff',
          borderBottom:'1px solid var(--border)'
        }}
      >
        <div className="container" style={{paddingTop:10, paddingBottom:10}}>
          <div className="spread" style={{alignItems:'center'}}>
            {/* Left spacer so the title stays centered */}
            <div style={{width:36}} />
            <div style={{fontWeight:800, fontSize:16, textAlign:'center'}}>{headerTitle}</div>
            {/* Top-right avatar -> profile */}
            <Link to="/profile" aria-label="User Profile" style={{
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              width:36, height:36, borderRadius:'50%', background:'#f3f4f6',
              border:'1px solid var(--border)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{stroke:'#334155', fill:'none', strokeWidth:1.8}}>
                <circle cx="12" cy="8" r="3.2" />
                <path d="M4.5 19.5c1.8-3 4.5-4.5 7.5-4.5s5.7 1.5 7.5 4.5" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Scrollable content region */}
      <main className={`container main-scroll ${loc.pathname === '/' ? 'home-scroll' : ''}`}>     
         <Outlet/>
      </main>

      <FooterNav/>
    </div>
  );
}
