import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Mode = { SignIn: 'signin', SignUp: 'signup', Reset: 'reset', Magic: 'magic' };

export default function Login() {
  const { session, initialising } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from') || '/';

  const [mode, setMode] = useState(Mode.SignIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // If we already have a session (after magic link/OAuth), go to the target once
  useEffect(() => {
    if (!initialising && session) {
      navigate(from, { replace: true });
    }
  }, [initialising, session, from, navigate]);

  const clear = () => { setStatus(''); setError(''); };

  const handleSignIn = async (e) => {
    e.preventDefault(); clear(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    navigate(from, { replace: true });
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); clear();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== password2) return setError('Passwords do not match.');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin + '/login?from=' + encodeURIComponent(from) },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setStatus('Check your email to confirm your account.');
  };

  const handleReset = async (e) => {
    e.preventDefault(); clear(); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login?from=' + encodeURIComponent(from),
    });
    setLoading(false);
    if (error) return setError(error.message);
    setStatus('Password reset email sent.');
  };

  const handleMagic = async (e) => {
    e.preventDefault(); clear(); setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/login?from=' + encodeURIComponent(from) },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setStatus('Magic link sent. Check your inbox.');
  };

  const handleGoogle = async () => {
    clear(); setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/login?from=' + encodeURIComponent(from) },
    });
    setLoading(false);
    if (error) return setError(error.message);
  };

  const box = { maxWidth: 460, margin: '48px auto', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' };
  const row = { display: 'grid', gap: 8, marginBottom: 14 };
  const input = { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', width: '100%' };
  const btn = { padding: '10px 14px', borderRadius: 8, border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' };
  const btnGhost = { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' };
  const tabs = { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' };
  const tab = (active) => ({ padding: '8px 12px', borderRadius: 999, border: '1px solid ' + (active ? '#111827' : '#d1d5db'),
    background: active ? '#111827' : '#fff', color: active ? '#fff' : 'inherit', cursor: 'pointer' });

  return (
    <div style={box}>
      <h1 style={{ margin: 0, marginBottom: 6 }}>Login</h1>
      <p style={{ marginTop: 0, color: '#6b7280' }}>Sign in to TransitGO</p>

      <div style={tabs}>
        <button style={tab(mode === Mode.SignIn)} onClick={() => setMode(Mode.SignIn)}>Email / Password</button>
        <button style={tab(mode === Mode.SignUp)} onClick={() => setMode(Mode.SignUp)}>Create Account</button>
        <button style={tab(mode === Mode.Magic)} onClick={() => setMode(Mode.Magic)}>Magic Link</button>
        <button style={tab(mode === Mode.Reset)} onClick={() => setMode(Mode.Reset)}>Reset Password</button>
      </div>

      {mode === Mode.SignIn && (
        <form onSubmit={handleSignIn}>
          <div style={row}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" style={input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={row}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" style={input} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={btn} disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
            <button type="button" style={btnGhost} onClick={handleGoogle} disabled={loading}>Continue with Google</button>
          </div>
        </form>
      )}

      {mode === Mode.SignUp && (
        <form onSubmit={handleSignUp}>
          <div style={row}>
            <label htmlFor="email2">Email</label>
            <input id="email2" type="email" style={input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={row}>
            <label htmlFor="password2">Password</label>
            <input id="password2" type="password" style={input} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div style={row}>
            <label htmlFor="password3">Confirm Password</label>
            <input id="password3" type="password" style={input} value={password2} onChange={(e) => setPassword2(e.target.value)} required />
          </div>
          <button type="submit" style={btn} disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
        </form>
      )}

      {mode === Mode.Magic && (
        <form onSubmit={handleMagic}>
          <div style={row}>
            <label htmlFor="email3">Email</label>
            <input id="email3" type="email" style={input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" style={btn} disabled={loading}>{loading ? 'Sending…' : 'Send Magic Link'}</button>
        </form>
      )}

      {mode === Mode.Reset && (
        <form onSubmit={handleReset}>
          <div style={row}>
            <label htmlFor="email4">Email</label>
            <input id="email4" type="email" style={input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" style={btn} disabled={loading}>{loading ? 'Sending…' : 'Send Reset Email'}</button>
        </form>
      )}

      {(status || error) && (
        <div style={{ marginTop: 16 }}>
          {status && <div style={{ color: '#065f46' }}>{status}</div>}
          {error && <div style={{ color: '#991b1b' }}>{error}</div>}
        </div>
      )}
    </div>
  );
}
