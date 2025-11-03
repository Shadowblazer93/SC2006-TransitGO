import React, { useLayoutEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

function Icon({children, active}){
  const color = active ? '#111827' : '#6b7280';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24"
      style={{display:'block',stroke:color,fill:'none',strokeWidth:1.8}} aria-hidden="true">
      {children}
    </svg>
  );
}

const tabs = [
  { to:'/', label:'Home', icon:(a)=>(<Icon active={a}><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/></Icon>)},
  { to:'/map', label:'Map', icon:(a)=>(<Icon active={a}><path d="M3 5l6 2 6-2 6 2v12l-6-2-6 2-6-2V5z"/><path d="M9 7v12M15 5v12"/></Icon>)},
  { to:'/farecalculator', label:'Fare', icon:(a)=>(<Icon active={a}><circle cx="12" cy="12" r="9"/><path d="M9 9h6M9 12h6M9 15h6"/></Icon>)},
  { to:'/services', label:'Status', icon:(a)=>(<Icon active={a}><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></Icon>)},
  { to:'/favourites', label:'Favs', icon:(a)=>(<Icon active={a}><path d="M12 20s-6.5-4.2-8-7.6C2.7 9.4 4 7 6.7 7c1.6 0 2.7.8 3.3 1.8C10.6 7.8 11.7 7 13.3 7 16 7 17.3 9.4 16 12.4 14.5 15.8 12 20 12 20z"/></Icon>)},
];

export default function FooterNav(){
  const ref = useRef(null);

  // Dynamically set --tab-h to the actual footer/nav height
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => {
      const h = ref.current.getBoundingClientRect().height || 74;
      document.documentElement.style.setProperty('--tab-h', `${Math.round(h)}px`);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <nav ref={ref} className="tabbar" style={{gridTemplateColumns:`repeat(${tabs.length},1fr)`}}>
      {tabs.map(t=>(
        <NavLink key={t.to} to={t.to} end={t.to==='/'}
          className={({isActive})=>'tablink' + (isActive?' active':'')}>
          {({isActive})=>(<>
            {t.icon(isActive)}
            <span>{t.label}</span>
          </>)}
        </NavLink>
      ))}
    </nav>
  );
}
