import React, { useEffect, useMemo, useState } from "react";
import FeedbackCard from "../../components/FeedbackCard.jsx";
import { user_loggedin, user_isadmin } from "../../supabaseClient.js";
import {
  getFeedbacks,
  deleteFeedback,
  getReplies,
  deleteReply,
  postReply
} from "../../services/api.js";

export default function FeedbackPage() {
  const [data, setData] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null); // for sending a reply via drawer

  // open replies state
  const [openId, setOpenId] = useState(null);
  const [repliesMap, setRepliesMap] = useState(() => ({})); // { [fid]: { phase, items, error } }

  const load = async () => {
    setPhase("loading");
    setError(null);
    try {
      const rows = await getFeedbacks();
      setData(Array.isArray(rows) ? rows : []);
      setPhase("ready");
    } catch (e) {
      setError(e.message || String(e));
      setPhase("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((f) =>
      [f.title, f.description, f.type].filter(Boolean).some((x) => String(x).toLowerCase().includes(s))
    );
  }, [data, q]);

  // authentication
  const [perms, setPerms] = useState(true)
  user_loggedin().then((res) => {if (!res) setPerms(false)})
  user_isadmin().then((res) => {if (!res) setPerms(false)})
  if (!perms) {return (<div style={{background:'#ffaeaeff', fontWeight:600, fontSize:15, padding: '20px 5px'}}>YOU DO NOT HAVE PERMISSION TO VIEW THIS PAGE</div>)}

  const onDelete = async (id) => {
    if (!confirm("Delete this feedback?")) return;

    const prevData = data.slice(); // safe copy for rollback
    setData((cur) => cur.filter((x) => x.id !== id)); // optimistic UI

    if (openId === id) setOpenId(null);
    setRepliesMap((m) => {
      const copy = { ...m };
      delete copy[id];
      return copy;
    });

    try {
      await deleteFeedback(id);
    } catch (e) {
      setData(prevData);
      alert(`Failed to delete: ${e.message}`);
    }
  };

  // toggle replies for a feedback id
  const toggleReplies = async (fid) => {
    const isOpen = openId === fid;
    if (isOpen) {
      setOpenId(null);
      return;
    }
    setOpenId(fid);

    const cached = repliesMap[fid];
    if (cached && (cached.items?.length || cached.phase === "loading" || cached.phase === "error")) {
      return;
    }

    setRepliesMap((m) => ({ ...m, [fid]: { phase: "loading", items: [], error: null } }));
    try {
      const items = await getReplies(fid);
      setRepliesMap((m) => ({ ...m, [fid]: { phase: "ready", items: items ?? [], error: null } }));
    } catch (e) {
      setRepliesMap((m) => ({ ...m, [fid]: { phase: "error", items: [], error: e.message || String(e) } }));
    }
  };

  // after posting a reply, refresh thread if open
  const refreshOpenThreadIfNeeded = async (fid) => {
    if (openId !== fid) return;
    try {
      const items = await getReplies(fid);
      setRepliesMap((m) => ({ ...m, [fid]: { phase: "ready", items: items ?? [], error: null } }));
    } catch {
      /* noop */
    }
  };

  // delete a single reply inside the thread (nested route: /feedbacks/:fid/replies/:rid)
  const onDeleteReply = async (fid, replyId) => {
    const cache = repliesMap[fid];
    if (!cache?.items) return;

    if (!confirm("Delete this reply?")) return;

    const prevItems = cache.items.slice();
    setRepliesMap((m) => ({
      ...m,
      [fid]: { ...cache, items: cache.items.filter((r) => r.id !== replyId) },
    }));

    try {
      await deleteReply(fid, replyId);
    } catch (e) {
      setRepliesMap((m) => ({ ...m, [fid]: { ...cache, items: prevItems } }));
      alert(`Failed to delete reply: ${e.message}`);
    }
  };

  // insert a temporary reply into the open thread (optimistic)
const optimisticAddReply = (fid, tempReply) => {
  setRepliesMap((m) => {
    const cur = m[fid] ?? { phase: "ready", items: [], error: null };
    return {
      ...m,
      [fid]: {
        ...cur,
        items: [...(cur.items ?? []), tempReply],
        phase: "ready",
        error: null,
      },
    };
  });
};

// replace temp reply with the saved one from server
const resolveOptimistic = (fid, tempId, saved) => {
  setRepliesMap((m) => {
    const cur = m[fid];
    if (!cur?.items) return m;
    return {
      ...m,
      [fid]: {
        ...cur,
        items: cur.items.map((r) => (r.id === tempId ? saved : r)),
      },
    };
  });
};

// rollback removal of temp reply on error
const rollbackOptimistic = (fid, tempId) => {
  setRepliesMap((m) => {
    const cur = m[fid];
    if (!cur?.items) return m;
    return {
      ...m,
      [fid]: { ...cur, items: cur.items.filter((r) => r.id !== tempId) },
    };
  });
};


  return (
    <div className="min-h-screen w-full bg-neutral-100">
      {/* Phone frame */}
      <div className="mx-auto my-4 w-[380px] max-w-full rounded-[28px] border border-black/5 bg-white shadow-xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => history.back()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="Back"
          >
            ←
          </button>
          <div className="text-[15px] font-semibold">User Feedback</div>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100">👤</div>
        </div>

        {/* Content area */}
        <div className="px-4 pb-4">
          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[13px] placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">⌕</span>
            </div>
          </div>

          {/* States */}
          {phase === "loading" && <p className="py-4 text-center text-xs text-neutral-500">Loading…</p>}
          {phase === "error" && (
            <p className="py-4 text-center text-xs text-red-600">Failed to load: {error}</p>
          )}

          {/* List */}
          <div className="divide-y divide-neutral-200/80">
            {filtered.map((f, i) => {
              const isOpen = openId === f.id;
              const rState = repliesMap[f.id]; // { phase, items, error }
              const repliesCount = rState?.items?.length ?? 0;

              return (
                <div key={f.id} className={i === 0 ? "" : "pt-3"}>
                  <FeedbackCard
                    fb={f}
                    isOpen={isOpen}
                    repliesCount={repliesCount}
                    onToggleReplies={() => toggleReplies(f.id)}
                    onReply={() => setSelected(f)}
                    onDelete={() => onDelete(f.id)}
                  />

                  {/* Replies panel */}
                  {isOpen && (
                    <RepliesSection
                      fid={f.id}
                      state={rState}
                      // pass ONLY replyId from child; wrapper here injects fid
                      onDeleteReply={(replyId) => onDeleteReply(f.id, replyId)}
                    />
                  )}
                </div>
              );
            })}

            {phase === "ready" && filtered.length === 0 && (
              <p className="py-6 text-center text-xs text-neutral-500">No feedback found.</p>
            )}
          </div>

          {/* “Others” footer row */}
          {phase === "ready" && filtered.length > 0 && (
            <div className="mt-2 text-[12px] text-neutral-500">Others</div>
          )}
        </div>
      </div>

      {/* Reply Drawer */}
      <ReplyDrawer
  fb={selected}
  onClose={() => setSelected(null)}
  onSubmit={async (message) => {
    const fid = selected.id;
    const isOpen = openId === fid;
    const tempId = `temp-${Date.now()}`;
    const temp = {
      id: tempId,
      content: message,
      created_at: new Date().toISOString(),
      username: "Me", // optional: derive from supabase.auth.getUser()
      _optimistic: true,
    };
    if (isOpen) optimisticAddReply(fid, temp);

    try {
      const saved = await postReply(fid, message);
      if (isOpen) resolveOptimistic(fid, tempId, saved);
      setSelected(null);
      alert("Reply sent!");
    } catch (e) {
      if (isOpen) rollbackOptimistic(fid, tempId);
      alert(`Failed to send reply: ${e.message}`);
    }
  }}
/>
    </div>
  );
}

/** ---------- Replies UI ---------- */
function RepliesSection({ fid, state, onDeleteReply }) {
  const phase = state?.phase ?? "idle";
  const items = state?.items ?? [];
  const error = state?.error ?? null;

  return (
    <div className="mt-3">
      <div className="mb-2 text-sm font-semibold text-neutral-700">Replies</div>

      {phase === "loading" && <p className="text-xs text-neutral-500">Loading replies…</p>}
      {phase === "error" && <p className="text-xs text-red-600">Failed to load replies: {error}</p>}
      {phase !== "loading" && items.length === 0 && !error && (
        <p className="text-xs text-neutral-500">No replies yet.</p>
      )}

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                  💬
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-semibold">{r.author ?? "Admin"}</span>
                    <span className="text-[11px] text-neutral-500" title={r.created_at}>
                      {formatSGTime(r.created_at)}
                    </span>
                  </div>

                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-5 text-neutral-800">
                    {r.content ?? r.message ?? ""}
                  </p>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onDeleteReply(r.id)} // <-- pass ONLY replyId
                  className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500"
                  title="Delete reply"
                  aria-label="Delete reply"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
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

/** ---------- Reply Drawer ---------- */
function ReplyDrawer({ fb, onClose, onSubmit }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (fb) setMessage("");
  }, [fb]);

  if (!fb) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="h-full w-full max-w-md bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="Back"
          >
            ←
          </button>
          <h2 className="text-base font-semibold">Reply Feedback</h2>
        </div>

        <div className="p-4">
          <div className="mb-3 rounded-2xl border border-neutral-200 p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100">👤</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-semibold">{fb.username || "User"}</span>
                </div>
                <div className="text-[11px] text-neutral-500">{fb.type}</div>
              </div>
            </div>
            <div className="mb-1 text-[13px] font-semibold">{fb.title}</div>
            <p className="whitespace-pre-wrap text-[12px] text-neutral-700">{fb.description}</p>
          </div>

          <label className="mb-1 block text-[12px] font-semibold">Reply</label>
          <textarea
            className="min-h-[120px] w-full resize-y rounded-xl border border-neutral-200 p-3 text-[13px] focus:border-blue-500 focus:outline-none"
            placeholder="Enter your reply here."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={async () => {
              const m = message.trim();
              if (!m) return alert("Please enter a reply.");
              try {
                setSubmitting(true);
                await onSubmit(m);
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Reply Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
