import React, { useEffect, useState } from "react";
import { supabase, user_loggedin } from "../supabaseClient";
import FooterNav from "../components/FooterNav";

export default function Favourites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: authErr } = await supabase.auth.getUser();
        if (authErr) {
          setError("Failed to get user");
          setFavorites([]);
          setUserId(null);
          return;
        }
        const user = data?.user;
        if (!user?.id) {
          setFavorites([]);
          setUserId(null);
          return;
        }
        setUserId(user.id);

        const { data: dbUser, error: dbErr } = await supabase
          .from("users")
          .select("favourite_routes")
          .eq("uid", user.id)
          .single();

        if (dbErr) {
          setError("Failed to load favourites");
          setFavorites([]);
          return;
        }

        const favs = dbUser?.favourite_routes ?? [];
        setFavorites(Array.isArray(favs) ? favs : []);
      } catch (err) {
        console.error(err);
        setError("Unexpected error");
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // authentication
  const [perms, setPerms] = useState(true)
  user_loggedin().then((res) => {if (!res) setPerms(false)})
  if (!perms) {return (<div style={{background:'#ffaeaeff', fontWeight:600, fontSize:15, padding: '20px 5px'}}>YOU DO NOT HAVE PERMISSION TO VIEW THIS PAGE</div>)}

  const removeFavorite = async (index) => {
    if (index == null) return;
    const newFavs = favorites.filter((_, i) => i !== index);
    setFavorites(newFavs); // optimistic UI

    try {
      const { data, error: authErr } = await supabase.auth.getUser();
      if (authErr || !data?.user?.id) return;
      const userId = data.user.id;

      const { error: updateErr } = await supabase
        .from("users")
        .update({ favourite_routes: newFavs })
        .eq("uid", userId);

      if (updateErr) {
        console.warn("Failed to persist favourite removal:", updateErr);
        // revert on failure
        // reload from server to be safe
        const { data: dbUser } = await supabase.from("users").select("favourite_routes").eq("uid", userId).single();
        setFavorites(dbUser?.favourite_routes ?? []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: 12 }}>Loading favourites…</div>;
  if (!userId) return <div style={{ padding: 12 }}>Not signed in — favourites are stored per user.</div>;

  return (
    <div style={{ padding: 12, maxWidth: 680 }}>
      <div style={{
        //   position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          background: '#eee',
          borderBottom: '3px solid #ddd',
          borderRadius: 20,
          zIndex: 999,
          fontsize: 30,
          marginBottom:20
          }}>
            <h1 style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Favourite Routes ({favorites.length})</h1>
        </div>
      {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
      {favorites.length === 0 ? (
        <div style={{ color: "#666" }}>No favourites saved.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {favorites.map((f, idx) => (
            <div key={f.key ?? idx} style={{ border: "1px solid #e6e6e6", borderRadius: 6, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    Saved: {f.savedAt ? new Date(f.savedAt).toLocaleString() : "—"}
                  </div>
                  <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>
                    {f.summary ? `Duration: ${f.summary.minutes ?? "-"} min` : ""}
                    {f.summary?.fare ? ` • Fare: ${f.summary.fare}` : ""}
                    {f.summary ? ` • Transfers: ${f.summary.transfers ?? 0}` : ""}
                  </div>

                  {f.itinerary?.legs && (
                    <div style={{ marginTop: 8, color: "#333", fontSize: 13 }}>
                      {(f.itinerary.legs || []).slice(0, 4).map((leg, i) => (
                        <div key={i} style={{ marginBottom: 4 }}>
                          <strong>{(leg.mode || "").toUpperCase()}{leg.route ? ` • ${leg.route}` : ""}</strong>
                          <div style={{ color: "#555" }}>
                            {leg.from?.name ?? "—"} → {leg.to?.name ?? "—"} {leg.duration ? ` • ${Math.round(leg.duration/60)} min` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    onClick={() => removeFavorite(idx)}
                    style={{ background: "#e53935", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 4, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <FooterNav />
    </div>
  );
}