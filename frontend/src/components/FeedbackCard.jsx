
import React from "react";

const Stars = ({ value = 0 }) => {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="inline-flex items-center" aria-label={`${v} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= v ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
};

const TypePill = ({ type }) => {
  const styles =
    type === "Bug"
      ? "bg-red-100 text-red-800"
      : type === "Suggestion"
      ? "bg-blue-100 text-blue-800"
      : type === "Question"
      ? "bg-violet-100 text-violet-800"
      : "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {type}
    </span>
  );
};

const niceDate = (s) => {
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s ?? "";
  }
};

export default function FeedbackCard({ fb, onReply, onDelete }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-lg">👤</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold">{fb.username || "User"}</span>
            <span className="text-gray-300">•</span>
            <Stars value={fb.rating} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <TypePill type={fb.type} />
            <span className="text-xs text-gray-500">{niceDate(fb.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-1 font-semibold">{fb.title}</div>
        <p className="whitespace-pre-wrap text-sm text-gray-700">{fb.description}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReply}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Reply Feedback
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          Delete Feedback
        </button>
      </div>
    </div>
  );
}
