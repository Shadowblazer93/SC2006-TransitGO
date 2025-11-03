// ResetPassword.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

function parseHashParams() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : "";
  const p = new URLSearchParams(hash);
  return {
    access_token: p.get("access_token"),
    refresh_token: p.get("refresh_token"),
    type: p.get("type"),
  };
}

export default function ResetPassword() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // track if the user was already logged in when they landed (no recovery link)
  const [wasLoggedIn, setWasLoggedIn] = useState(false);

  const { access_token, refresh_token, type } = useMemo(parseHashParams, []);
  const isRecovery = typeof window !== "undefined" && type === "recovery";

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setErr("");
      setMsg("");

      try {
        if (isRecovery && access_token && refresh_token) {
          // Recovery mode: consume the hash by setting the session
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          if (!cancelled) setSessionReady(true);
        } else {
          // Logged-in mode: allow changing password using the existing session
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          const hasSession = !!data?.session;
          if (!cancelled) {
            setWasLoggedIn(hasSession);
            setSessionReady(hasSession);
            if (!hasSession) {
              throw new Error(
                "Invalid or expired link. Please request a new reset link or sign in first."
              );
            }
          }
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || "Unable to start session.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [isRecovery, access_token, refresh_token]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (pw.length < 8) return setErr("Password must be at least 8 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");

    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;

      // Clear URL hash so tokens can’t be reused on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      setMsg("Password updated. Please sign in with your new password.");

      // If user was already logged in (i.e., no recovery link), force sign-out after change
      if (wasLoggedIn && !isRecovery) {
        await supabase.auth.signOut({ scope: "global" });
        window.location.assign("/login");
        return;
      }

    } catch (e) {
      setErr(e.message || "Failed to update password.");
    }
  }

  return (
    <div className="min-h-svh bg-[#eef1f5] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
        {/* Brand */}
        <div className="px-6 pt-6 flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-red-600 grid place-items-center ring-2 ring-red-200/60">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
            </svg>
          </div>
          <span className="text-lg font-semibold text-neutral-900">TransitGo</span>
        </div>

        {/* Title */}
        <div className="px-6 mt-4">
          <h1 className="text-xl font-semibold text-neutral-900">Reset Password</h1>
        </div>

        <div className="mt-3 h-px bg-neutral-200" />

        <div className="px-6 py-5">
          {loading ? (
            <p className="text-sm text-neutral-600 mt-2">Preparing your secure session…</p>
          ) : !sessionReady ? (
            <div className="mt-2">
              <p className="text-sm text-red-600">
                {err || "Invalid or expired link. Please request a new reset link."}
              </p>
              <a href="/forgot" className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-500">
                Request a new reset link
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800">New Password</label>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-800">Confirm Password</label>
                <input
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={!sessionReady}
                className="w-full rounded-lg bg-[#3b5bfd] hover:bg-[#2f4de6] text-white font-semibold py-2.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Update Password
              </button>

              {err && <p className="text-sm text-red-600">{err}</p>}
              {msg && <p className="text-sm text-green-600">{msg}</p>}

              <div className="text-center">
                <a href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                  Back to Login
                </a>
              </div>

              {/* Bottom accent */}
              <div className="mt-6 flex justify-center">
                <div className="h-[3px] w-28 bg-neutral-900 rounded-full" />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
