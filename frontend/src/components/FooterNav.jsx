// ...existing code...
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
  { to:'/UserHomePage', label:'Home', icon:(a)=>(<Icon active={a}><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/></Icon>)},
  { to:'/Routing', label:'Map', icon:(a)=>(<Icon active={a}><path d="M3 5l6 2 6-2 6 2v12l-6-2-6 2-6-2V5z"/><path d="M9 7v12M15 5v12"/></Icon>)},
  { to:'/FareCalculator', label:'Fare', icon:(a)=>(<Icon active={a}><circle cx="12" cy="12" r="9"/><path d="M9 9h6M9 12h6M9 15h6"/></Icon>)},
  { to:'/Announcements', label:'Status', icon:(a)=>(<Icon active={a}><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></Icon>)},
  { to:'/Favourites', label:'Favs', icon:(a)=>(<Icon active={a}><path d="M12 20s-6.5-4.2-8-7.6C2.7 9.4 4 7 6.7 7c1.6 0 2.7.8 3.3 1.8C10.6 7.8 11.7 7 13.3 7 16 7 17.3 9.4 16 12.4 14.5 15.8 12 20 12 20z"/></Icon>)},
];

export default function FooterNav(){
  const ref = useRef(null);

  // Dynamically set --tab-h to the actual footer/nav height
  useLayoutEffect(() => {
    if (!ref.current) return;
    const setHeights = () => {
      const h = ref.current.getBoundingClientRect().height || 74;
      const rounded = Math.round(h);
      document.documentElement.style.setProperty('--tab-h', `${rounded}px`);
      document.body.style.paddingBottom = `${rounded}px`;
    };

    // initial set + observe changes
    setHeights();
    const ro = new ResizeObserver(setHeights);
    ro.observe(ref.current);

    // cleanup: remove padding and observer on unmount
    return () => {
      ro.disconnect();
      // only clear if we previously set it (defensive)
      document.body.style.paddingBottom = '';
    };
  }, []);

  return (
    <nav
      ref={ref}
      className="tabbar"
      // force a horizontal grid and center cells; remove labels so only icons show
      style={{
        position:'fixed',
        left:0,
        right:0,
        bottom:0,
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        alignItems: 'center',
        justifyItems: 'center',
        gap: 0,
        background: '#f1e7baff',
        borderTop: '2px solid #e6ddc6ff'
      }}
    >
      {tabs.map(t=>(
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to==='/'}
          className={({isActive})=>'tablink' + (isActive?' active':'')}
          // force link to center the icon and prevent vertical stacking from external CSS
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}
        >
          {({isActive}) => (
            // render only the icon (no text)
            t.icon(isActive)
          )}
        </NavLink>
      ))}
    </nav>
  );
}
// ...existing code...