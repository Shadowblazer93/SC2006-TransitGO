// src/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';

export default function ProtectedRoute({ children }) {
  const { session, initialising } = useAuth();
  const loc = useLocation();

  if (initialising) return null; // or a loader/spinner

  if (!session) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?from=${next}`} replace />;
  }

  return children;
}
