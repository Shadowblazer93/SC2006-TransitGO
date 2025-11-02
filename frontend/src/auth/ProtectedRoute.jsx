import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children }) {
  const { session, initialising } = useAuth();
  const location = useLocation();

  // Avoid redirecting until we know if a session exists
  if (initialising) return <div style={{ padding: 24 }}>Loading…</div>;

  if (!session) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }
  return children;
}
