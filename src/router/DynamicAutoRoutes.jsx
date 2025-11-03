// src/router/DynamicAutoRoutes.jsx
import React from 'react';
import { Route } from 'react-router-dom';

/**
 * Returns an array of <Route> elements for every default-exported page under src/pages/**
 * Skips Login (handled explicitly). Creates both /Name and /name paths.
 */
export function getDynamicAutoRoutes() {
  const modules = import.meta.glob('../pages/**/*.jsx', { eager: true });
  const SKIP = new Set(['Login.jsx']);

  const routes = [];
  for (const [fp, mod] of Object.entries(modules)) {
    const file = fp.replaceAll('\\', '/').split('/').pop();
    if (SKIP.has(file)) continue;

    const Cmp = mod?.default;
    if (!Cmp) continue;

    const base = '/' + file.replace(/\.jsx$/i, '');
    const paths = base.toLowerCase() === base ? [base] : [base, base.toLowerCase()];
    for (const p of paths) {
      routes.push(<Route key={`${file}:${p}`} path={p} element={<Cmp />} />);
    }
  }
  return routes;
}
