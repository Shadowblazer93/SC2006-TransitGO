import React, { useEffect, useMemo, useState } from "react";
import FeedbackCard from "../../components/FeedbackCard.jsx";
import { getFeedbacks } from "../../services/api.js";


export default function FeedbackPage() {
  const [data, setData] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

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
      [f.title, f.description, f.type]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(s))
    );
  }, [data, q]);

  const onDelete = async (id) => {
    if (!confirm("Delete this feedback?")) return;
    try {
      const res = await fetch(`${API_BASE}/feedbacks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(`Failed to delete: ${e.message}`);
    }
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
          <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100">
            👤
          </div>
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
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                ⌕
              </span>
            </div>
          </div>

          {/* States */}
          {phase === "loading" && (
            <p className="py-4 text-center text-xs text-neutral-500">Loading…</p>
          )}
          {phase === "error" && (
            <p className="py-4 text-center text-xs text-red-600">
              Failed to load: {error}
            </p>
          )}

          {/* List (thin separators like the mock) */}
          <div className="divide-y divide-neutral-200/80">
            {filtered.map((f, i) => (
              <div key={f.id} className={i === 0 ? "" : "pt-3"}>
                <FeedbackCard
                  fb={f}
                  onReply={() => setSelected(f)}
                  onDelete={() => onDelete(f.id)}
                />
              </div>
            ))}
            {phase === "ready" && filtered.length === 0 && (
              <p className="py-6 text-center text-xs text-neutral-500">
                No feedback found.
              </p>
            )}
          </div>

          {/* “Others” footer row */}
          {phase === "ready" && filtered.length > 0 && (
            <div className="mt-2 text-[12px] text-neutral-500">Others</div>
          )}
        </div>
      </div>

      {/* Reply Drawer (kept as-is; still mobile friendly) */}
      <ReplyDrawer
        fb={selected}
        onClose={() => setSelected(null)}
        onSubmit={async (message) => {
          try {
            const res = await fetch(`${API_BASE}/feedbacks/${selected.id}/reply`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ message }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            alert("Reply sent!");
            setSelected(null);
          } catch (e) {
            alert(`Failed to send reply: ${e.message}`);
          }
        }}
      />
    </div>
  );
}

function ReplyDrawer({ fb, onClose, onSubmit }) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (fb) setMessage("");
  }, [fb]);

  if (!fb) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
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
                  <span className="truncate text-[13px] font-semibold">
                    {fb.user_name || "User"}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-yellow-500 text-[12px]">
                    {"★".repeat(Math.max(0, Math.min(5, Number(fb.rating) || 0)))}
                    {"☆".repeat(5 - Math.max(0, Math.min(5, Number(fb.rating) || 0)))}
                  </span>
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
            onClick={() => (message.trim() ? onSubmit(message) : alert("Please enter a reply."))}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700"
          >
            Reply Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
