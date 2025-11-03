import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthCtx = createContext({ session: null, initialising: true });

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) Get current session once
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session ?? null);
      setInitialising(false);
    });

    // 2) Subscribe to auth changes (sign in/out, token refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      sub?.subscription?.unsubscribe?.();
      mounted = false;
    };
  }, []);

  return (
    <AuthCtx.Provider value={{ session, initialising }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
