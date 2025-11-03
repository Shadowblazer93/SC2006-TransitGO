import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import FooterNav from "../../components/FooterNav";

export default function UserFeedbackSubmitted() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [repliesMap, setRepliesMap] = useState({}); // { [feedback_id]: [reply,...] }
  const [phase, setPhase] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState(null);

  async function load() {
    setPhase("loading");
    setError(null);
    setFeedbacks([]);
    setRepliesMap({});

    try {
      let user = null;
      if (supabase.auth?.getUser) {
        const r = await supabase.auth.getUser();
        user = r?.data?.user ?? null;
      } else if (supabase.auth?.getSession) {
        const r = await supabase.auth.getSession();
        user = r?.data?.session?.user ?? null;
      } else if (typeof supabase.auth?.user === "function") {
        user = supabase.auth.user();
      }

      if (!user) {
        setPhase("ready");
        setError("Not signed in.");
        return;
      }

      const { data: fdata, error: ferr } = await supabase
        .from("feedback")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ferr) throw ferr;

      const items = fdata ?? [];
      setFeedbacks(items);

      if (items.length === 0) {
        setPhase("ready");
        return;
      }

      const ids = items.map((f) => f.id).filter(Boolean);
      if (ids.length === 0) {
        setPhase("ready");
        return;
      }

      const { data: rdata, error: rerr } = await supabase
        .from("replies")
        .select("*")
        .in("feedback_id", ids);

      if (rerr) throw rerr;

      const map = {};
      (rdata ?? []).forEach((r) => {
        const key = r.feedback_id;
        if (!map[key]) map[key] = [];
        map[key].push(r);
      });
      setRepliesMap(map);

      setPhase("ready");
    } catch (e) {
      setError(e?.message ?? String(e));
      setPhase("error");
    }
  }

  return (
    <div className="min-h-screen w-full bg-neutral-100 p-4">
      <div className="mx-auto my-4 w-full max-w-3xl rounded-lg border border-neutral-200 bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">My Submitted Feedback</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="rounded-md bg-neutral-100 px-3 py-1 text-sm hover:bg-neutral-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {phase === "loading" && <p className="py-4 text-sm text-neutral-500">Loading…</p>}
        {phase === "error" && (
          <p className="py-4 text-sm text-red-600">Failed to load: {error}</p>
        )}
        {phase === "ready" && error && (
          <p className="py-4 text-sm text-neutral-600">Notice: {error}</p>
        )}

        <div className="mt-4 space-y-4">
          {feedbacks.length === 0 && phase === "ready" && (
            <p className="text-sm text-neutral-500">You have not submitted any feedback yet.</p>
          )}

          {feedbacks.map((f) => (
            <div key={f.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h2 className="truncate text-sm font-semibold">{f.title}</h2>
                    <span className="text-xs text-neutral-500">{f.type}</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{f.description}</p>
                  <div className="mt-2 text-xs text-neutral-500">{formatSGTime(f.created_at)}</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-neutral-700">Replies</div>
                {(!repliesMap[f.id] || repliesMap[f.id].length === 0) && (
                  <p className="mt-2 text-xs text-neutral-500">No replies yet.</p>
                )}
                {(repliesMap[f.id] || []).map((r) => (
                  <div
                    key={r.id}
                    className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{r.author ?? "Admin"}</div>
                      <div className="text-xs text-neutral-500">{formatSGTime(r.created_at)}</div>
                    </div>
                    <div className="mt-1 text-sm text-neutral-800 whitespace-pre-wrap">
                      {r.content ?? r.message ?? ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <FooterNav />
    </div>
  );
}

function formatSGTime(s) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return String(s);
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(d);
}