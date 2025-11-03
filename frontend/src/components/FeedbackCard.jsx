import React from "react";

const Stars = ({ value = 0 }) => {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span
      role="img"
      aria-label={`${v} out of 5 stars`}
      className="inline-flex items-center"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= v ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
};

const TYPE_STYLES = {
  Bug: "bg-red-100 text-red-800",
  Suggestion: "bg-blue-100 text-blue-800",
  Question: "bg-violet-100 text-violet-800",
};

const TypePill = ({ type = "Other" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      TYPE_STYLES[type] ?? "bg-gray-100 text-gray-800"
    }`}
  >
    {type}
  </span>
);

const niceDate = (s) => {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return String(s);
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(d);
};

export default function FeedbackCard({
  fb = {},
  onReply,
  onDelete,
  onToggleReplies,   // NEW
  isOpen = false,    // NEW
  repliesCount = 0,  // optional, purely cosmetic
}) {
  const handleReply = () => onReply?.(fb.id, fb);
  const handleDelete = () => onDelete?.(fb.id);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header row with toggle */}
      <div className="mb-2 flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-100 text-lg">👤</div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold">{fb.username ?? "User"}</span>
            <span className="text-gray-300">•</span>
            <Stars value={fb.rating} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <TypePill type={fb.type} />
            <span
              className="text-xs text-gray-500"
              title={fb.created_at ? new Date(fb.created_at).toISOString() : ""}
            >
              {niceDate(fb.created_at)}
            </span>
          </div>
        </div>

        {/* Arrow toggle */}
        <button
          type="button"
          onClick={onToggleReplies}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Hide replies" : "Show replies"}
          className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          title={isOpen ? "Hide replies" : "Show replies"}
        >
          <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>⌄</span>
        </button>
      </div>

      {/* Body */}
      <div className="mb-3">
        <div className="mb-1 font-semibold truncate">{fb.title ?? "(No title)"}</div>
        <p className="whitespace-pre-wrap text-sm text-gray-700">{fb.description ?? ""}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleReply}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Reply Feedback
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          Delete Feedback
        </button>

        {/* Optional tiny replies count on the right */}
        {typeof repliesCount === "number" && (
          <span className="ml-auto text-xs text-gray-500">
            {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
          </span>
        )}
      </div>
    </div>
  );
}
