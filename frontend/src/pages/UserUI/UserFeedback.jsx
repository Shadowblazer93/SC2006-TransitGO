import React, { useEffect, useState } from "react";
// Adjust this import if your supabase client is in a different path
import { supabase, user_loggedin } from "../../supabaseClient";
import FooterNav from "../../components/FooterNav";

export default function UserFeedback() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const [rating, setRating] = useState(0); // 0..5
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      try {
        const res = await supabase.auth.getSession?.() ?? await supabase.auth.session?.();
        // support v2 (getSession) and older shapes
        const session = res?.data?.session ?? res?.session ?? res;
        const uid = session?.user?.id ?? session?.user_id ?? null;
        if (mounted) setUserId(uid);
      } catch (err) {
        console.error("failed to get session", err);
      }
    };
    loadSession();
    return () => (mounted = false);
  }, []);

  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!description.trim()) return "Description is required.";
    if (!userId) return "You must be signed in to submit feedback.";
    if (rating < 0 || rating > 5) return "Rating must be between 0 and 5.";
    return null;
  };

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setOk(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        user_id: userId,
        type,
        rating,
      };
      const { data, error: insertError } = await supabase
        .from("feedback")
        .insert([payload])
        .select()
        .single();
      if (insertError) throw insertError;
      setOk("Feedback submitted. Thank you!");
      setTitle("");
      setDescription("");
      setType("general");
      setRating(0);
    } catch (err) {
      console.error("submit feedback error", err);
      setError(err?.message ?? String(err));
    } finally {
      setSubmitting(false);
    }
  };

  // authentication
  const [perms, setPerms] = useState(true)
  user_loggedin().then((res) => {if (!res) setPerms(false)})
  if (!perms) {return (<div style={{background:'#ffaeaeff', fontWeight:600, fontSize:15, padding: '20px 5px'}}>YOU DO NOT HAVE PERMISSION TO VIEW THIS PAGE</div>)}

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Send Feedback</h2>
        <p className="text-sm text-neutral-600">We appreciate your feedback!<br/>Tell us what you think.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-2 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-1"
            placeholder="Short title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full rounded border px-3 py-1"
            placeholder="Describe the problem, suggestion or experience..."
          />
        </div>

        <div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded border px-3 py-2">
              <option value="suggestion">Suggestion</option>
              <option value="bug">Bug</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 py-2">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`px-2 py-1 rounded ${n <= rating ? "bg-yellow-400 text-black" : "bg-neutral-100 text-neutral-600"}`}
                  aria-label={`Rate ${n}`}
                >
                  ★
                </button>
              ))}
              <span className="text-sm text-neutral-500 ml-2">{rating > 0 ? rating : "No rating"}</span>
            </div>
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {ok && <div className="text-sm text-green-600">{ok}</div>}

        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-500">Signed in: <br />{userId ?? "Not signed in"}</div>
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>
      </form>
      <FooterNav />
    </div>
  );
}