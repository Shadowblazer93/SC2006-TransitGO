import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default function Routing() {
    const mapRef = useRef(null);
    const layerRef = useRef(null);
    const sourceMarkerRef = useRef(null);
    const destMarkerRef = useRef(null);
    const searchMarkerRef = useRef(null);
    const routesLayerRef = useRef(null);
    const highlightLayerRef = useRef(null);
    const selectModeRef = useRef("none");

    const [selectMode, setSelectMode] = useState("none"); // "none" | "source" | "dest"
    const [source, setSource] = useState(null); // L.LatLng or null
    const [dest, setDest] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [routing, setRouting] = useState(false);

    // routes + UI state
    const [routesData, setRoutesData] = useState([]); // {itinerary, coords, bounds, summary}
    const [showRoutesModal, setShowRoutesModal] = useState(false);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
    const [expandedItineraries, setExpandedItineraries] = useState({}); // toggle details per itinerary

    // favorites stored in user metadata
    const [favorites, setFavorites] = useState([]); // array of fav objects { key, savedAt, itinerary, coords, summary }
    const [userId, setUserId] = useState(null);
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);

    useEffect(() => {
        selectModeRef.current = selectMode;
    }, [selectMode]);

    // load supabase user metadata (favorites) on mount
    useEffect(() => {
        const loadUser = async () => {
            if (!supabase) {
                // fallback to localStorage when supabase not configured
                try {
                    const raw = localStorage.getItem("favorites");
                    const favs = raw ? JSON.parse(raw) : [];
                    setFavorites(Array.isArray(favs) ? favs : []);
                    setUserId(null);
                } catch (err) {
                    console.warn("Failed to load favorites from localStorage", err);
                }
                return;
            }
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) {
                    console.warn("Supabase getUser error", error);
                    return;
                }
                const user = data?.user;
                setUserId(user?.id ?? null);
                const favs = user?.user_metadata?.favorites ?? [];
                setFavorites(Array.isArray(favs) ? favs : []);
            } catch (err) {
                console.error("Error loading user/favorites", err);
            }
        };
        loadUser();
    }, []);

    const saveFavoritesToSupabase = async (newFavs) => {
        // update user metadata favourites array
        if (!supabase) {
            // fallback: persist to localStorage
            try {
                localStorage.setItem("favorites", JSON.stringify(newFavs));
            } catch {(err) => console.log(err)}
            setFavorites(newFavs);
            return;
        }
        try {
            // supabase v2: updateUser
            const { data, error } = await supabase.auth.updateUser({ data: { favorites: newFavs } });
            if (error) {
                console.warn("supabase updateUser error", error);
                // still update locally
                setFavorites(newFavs);
                return;
            }
            const updatedUser = data?.user ?? data;
            const favsFromServer = updatedUser?.user_metadata?.favorites ?? newFavs;
            setFavorites(Array.isArray(favsFromServer) ? favsFromServer : newFavs);
        } catch (err) {
            console.error("saveFavorites error", err);
            setFavorites(newFavs);
        }
    };

    // helper to generate stable key for itinerary
    const itineraryKey = (itItem) => {
        // itItem is object from routesData: { itinerary, coords, ... }
        const it = itItem?.itinerary;
        if (!it) return null;
        return `${it.startTime ?? ""}_${it.duration ?? ""}_${(it.legs?.length ?? "")}`;
    };

    const isFavoritedIndex = (idx) => {
        const key = itineraryKey(routesData[idx]);
        return favorites.some((f) => f.key === key);
    };

    const toggleFavoriteByIndex = async (idx, e) => {
        if (e) e.stopPropagation();
        const item = routesData[idx];
        if (!item) return;
        const key = itineraryKey(item);
        if (!key) return;

        const exists = favorites.some((f) => f.key === key);
        let newFavs;
        if (exists) {
            newFavs = favorites.filter((f) => f.key !== key);
        } else {
            const favObj = {
                key,
                savedAt: new Date().toISOString(),
                summary: item.summary,
                itinerary: item.itinerary,
                coords: item.coords
            };
            newFavs = [favObj, ...favorites];
        }
        await saveFavoritesToSupabase(newFavs);
    };

    // show a favorite route on the map
    const showFavoriteOnMap = (index) => {
        const fav = favorites[index];
        if (!fav || !mapRef.current) return;

        if (!highlightLayerRef.current) highlightLayerRef.current = L.layerGroup().addTo(mapRef.current);
        else highlightLayerRef.current.clearLayers();

        const coords = fav.coords || [];
        if (coords && coords.length) {
            const poly = L.polyline(coords, { color: "#ff1744", weight: 7, opacity: 0.95 }).addTo(highlightLayerRef.current);
            try {
                const bounds = L.latLngBounds(coords);
                if (bounds.isValid()) mapRef.current.fitBounds(bounds.pad(0.2));
            } catch (err) {
                console.log(err)
            }
        } else if (fav.itinerary && Array.isArray(fav.itinerary.legs)) {
            // fallback: try to build coords from itinerary legs if present
            const combined = [];
            (fav.itinerary.legs || []).forEach((leg) => {
                const enc = leg.legGeometry?.points;
                if (enc) {
                    // decode polyline same as decodePolyline below
                    const dec = decodePolyline(enc).map(([lat, lng]) => [lat, lng]);
                    combined.push(...dec);
                }
            });
            if (combined.length) {
                L.polyline(combined, { color: "#ff1744", weight: 7, opacity: 0.95 }).addTo(highlightLayerRef.current);
                try {
                    const bounds = L.latLngBounds(combined);
                    if (bounds.isValid()) mapRef.current.fitBounds(bounds.pad(0.2));
                } catch (err) {console.log(err)}
            }
        }

        // close favorites modal to show map
        setShowFavoritesModal(false);
    };

    const removeFavorite = async (index) => {
        if (index == null) return;
        const newFavs = favorites.filter((_, i) => i !== index);
        await saveFavoritesToSupabase(newFavs);
    };

    useEffect(() => {
        if (mapRef.current) return;

        const token = import.meta.env.VITE_ONEMAP_TOKEN || "";
        const tileJsonUrl = `https://www.onemap.gov.sg/maps/json/raster/tilejson/2.2.0/Default.json`;

        const sw = L.latLng(1.144, 103.535);
        const ne = L.latLng(1.494, 104.502);
        const bounds = L.latLngBounds(sw, ne);

        mapRef.current = L.map("onemap", {
            center: [1.2868108, 103.8545349],
            zoom: 16,
            minZoom: 10,
            maxZoom: 19,
        });

        const handleMapClick = (e) => {
            const latlng = e.latlng;
            if (selectModeRef.current === "source") {
                setSource(latlng);
                if (sourceMarkerRef.current) {
                    sourceMarkerRef.current.setLatLng(latlng);
                } else {
                    sourceMarkerRef.current = L.marker(latlng, { title: "Source" }).addTo(mapRef.current);
                }
                setSelectMode("none");
            } else if (selectModeRef.current === "dest") {
                setDest(latlng);
                if (destMarkerRef.current) {
                    destMarkerRef.current.setLatLng(latlng);
                } else {
                    destMarkerRef.current = L.marker(latlng, { title: "Destination" }).addTo(mapRef.current);
                }
                setSelectMode("none");
            }
        };

        mapRef.current.on("click", handleMapClick);

        fetch(tileJsonUrl)
            .then((res) => {
                if (!res.ok) throw new Error("TileJSON fetch failed");
                return res.json();
            })
            .then((tileJson) => {
                const tileTemplate = Array.isArray(tileJson.tiles) && tileJson.tiles[0];
                if (!tileTemplate) throw new Error("No tiles in TileJSON");

                const tileUrl =
                    token && !tileTemplate.includes("token=")
                        ? `${tileTemplate}${tileTemplate.includes("?") ? "&" : "?"}token=${token}`
                        : tileTemplate;

                layerRef.current = L.tileLayer(tileUrl, {
                    detectRetina: true,
                    maxZoom: tileJson.maxzoom ?? 19,
                    minZoom: tileJson.minzoom ?? 0,
                    attribution: null,
                }).addTo(mapRef.current);

                mapRef.current.setMaxBounds(bounds);
                mapRef.current.setView(L.latLng(1.2868108, 103.8545349), 16);

                /** DO NOT REMOVE the OneMap attribution below **/
                mapRef.current.attributionControl.setPrefix(
                    '<span style="display:inline-flex;align-items:center;gap:6px;">' +
                        '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;display:inline-block;vertical-align:middle;margin-right:6px;"/>' +
                        '<span>' +
                            '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;' +
                            '<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>' +
                        '</span>' +
                    '</span>'
                );
            })
            .catch(() => {
                const fallbackUrl = `https://maps-{s}.onemap.sg/v3/Default/{z}/{x}/{y}.png?token=${token}`;
                layerRef.current = L.tileLayer(fallbackUrl, {
                    subdomains: "abcd",
                    detectRetina: true,
                    maxZoom: 18,
                    attribution: null,
                }).addTo(mapRef.current);

                mapRef.current.attributionControl.setPrefix(
                    '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;' +
                        '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;' +
                        '<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
                );
            });

        return () => {
            if (mapRef.current) {
                mapRef.current.off("click", handleMapClick);
            }
            if (layerRef.current) {
                layerRef.current.remove();
                layerRef.current = null;
            }
            if (sourceMarkerRef.current) {
                sourceMarkerRef.current.remove();
                sourceMarkerRef.current = null;
            }
            if (destMarkerRef.current) {
                destMarkerRef.current.remove();
                destMarkerRef.current = null;
            }
            if (searchMarkerRef.current) {
                searchMarkerRef.current.remove();
                searchMarkerRef.current = null;
            }
            if (routesLayerRef.current) {
                routesLayerRef.current.clearLayers();
                routesLayerRef.current = null;
            }
            if (highlightLayerRef.current) {
                highlightLayerRef.current.clearLayers();
                highlightLayerRef.current = null;
            }
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const clearPoints = () => {
        setSource(null);
        setDest(null);
        if (sourceMarkerRef.current) {
            sourceMarkerRef.current.remove();
            sourceMarkerRef.current = null;
        }
        if (destMarkerRef.current) {
            destMarkerRef.current.remove();
            destMarkerRef.current = null;
        }
        if (routesLayerRef.current) {
            routesLayerRef.current.clearLayers();
        }
        if (highlightLayerRef.current) {
            highlightLayerRef.current.clearLayers();
        }
        setRoutesData([]);
        setShowRoutesModal(false);
        setSelectedRouteIndex(null);
    };

    // ... extractLatLng, decodePolyline unchanged (kept concise) ...
    const extractLatLng = (item) => {
        if (!item) return null;
        if (item.LATITUDE != null && (item.LONGITUDE != null || item.LONGTITUDE != null)) {
            const lat = Number(item.LATITUDE);
            const lng = Number(item.LONGITUDE ?? item.LONGTITUDE);
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
        }
        if (item.geometry && Array.isArray(item.geometry.coordinates)) {
            const coords = item.geometry.coordinates;
            return { lat: Number(coords[1]), lng: Number(coords[0]) };
        }
        if (item.features && item.features.length) return extractLatLng(item.features[0]);
        const possible = [
            ["LATITUDE", "LONGITUDE"],
            ["latitude", "longitude"],
            ["LAT", "LON"],
            ["lat", "lon"],
            ["Y", "X"],
            ["y", "x"],
            ["ycoord", "xcoord"],
            ["y_l", "x_l"]
        ];
        for (const [latKey, lngKey] of possible) {
            if (item[latKey] != null && item[lngKey] != null) {
                const lat = Number(item[latKey]);
                const lng = Number(item[lngKey]);
                if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
            }
        }
        if (item._source) return extractLatLng(item._source);
        if (item.centroid && item.centroid.lat != null && item.centroid.lon != null) {
            return { lat: Number(item.centroid.lat), lng: Number(item.centroid.lon) };
        }
        if (item.center && Array.isArray(item.center)) {
            const a = Number(item.center[0]), b = Number(item.center[1]);
            if (!Number.isNaN(a) && !Number.isNaN(b)) return { lat: a, lng: b };
        }
        if (item._source) return extractLatLng(item._source);
        return null;
    };

    const decodePolyline = (str) => {
        if (!str) return [];
        let index = 0, lat = 0, lng = 0, coordinates = [];
        const length = str.length;
        while (index < length) {
            let result = 1, shift = 0, b;
            do {
                b = str.charCodeAt(index++) - 63 - 1;
                result += b << shift;
                shift += 5;
            } while (b >= 0x1f);
            lat += (result & 1) ? ~(result >> 1) : (result >> 1);

            result = 1; shift = 0;
            do {
                b = str.charCodeAt(index++) - 63 - 1;
                result += b << shift;
                shift += 5;
            } while (b >= 0x1f);
            lng += (result & 1) ? ~(result >> 1) : (result >> 1);

            coordinates.push([lat * 1e-5, lng * 1e-5]);
        }
        return coordinates;
    };

    const computeRoute = async () => {
        if (!mapRef.current) return;
        const s = source;
        const d = dest;
        if (!s && !d) {
            console.warn("No source or destination set");
            return;
        }
        if (!s || !d) {
            console.warn("Both source and destination required for routing. Use search to set them or click map.");
            return;
        }

        const token = import.meta.env.VITE_ONEMAP_TOKEN || "";
        if (!token) {
            console.error("VITE_ONEMAP_TOKEN not set");
            return;
        }

        setRouting(true);
        try {
            const start = `${s.lat},${s.lng}`;
            const end = `${d.lat},${d.lng}`;

            const now = new Date();
            const pad = (n) => String(n).padStart(2, "0");
            const dateStr = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${now.getFullYear()}`;
            const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

            const url = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&routeType=pt&date=${encodeURIComponent(dateStr)}&time=${encodeURIComponent(timeStr)}&mode=TRANSIT&numItineraries=3`;

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `${token}`
                }
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`Routing failed ${res.status}: ${txt.slice(0, 500)}`);
            }

            const data = await res.json();
            const itineraries = data?.plan?.itineraries;
            if (!Array.isArray(itineraries) || itineraries.length === 0) {
                console.warn("No itineraries returned", data);
                return;
            }

            // clear previous routes
            if (!routesLayerRef.current) routesLayerRef.current = L.layerGroup().addTo(mapRef.current);
            else routesLayerRef.current.clearLayers();

            if (highlightLayerRef.current) {
                highlightLayerRef.current.clearLayers();
            }

            const allBounds = L.latLngBounds([]);
            const colors = ["#1976d2", "#388e3c", "#f57c00", "#8e24aa"];

            // array to store itinerary-level coords and bounds for the modal
            const itinerariesData = [];

            itineraries.forEach((it, idx) => {
                const itineraryGroup = L.layerGroup();
                const color = colors[idx % colors.length];

                // collect combined coords for this itinerary
                const combinedCoords = [];

                (it.legs || []).forEach((leg) => {
                    const enc = leg.legGeometry?.points;
                    const coords = decodePolyline(enc).map(([lat, lng]) => [lat, lng]);
                    if (coords.length) {
                        const isTransit = (leg.mode || "").toUpperCase() !== "WALK";
                        const poly = L.polyline(coords, {
                            color: isTransit ? color : "#666",
                            weight: isTransit ? 5 : 3,
                            opacity: isTransit ? 0.9 : 0.6,
                            dashArray: isTransit ? null : "6,8"
                        }).addTo(itineraryGroup);
                        allBounds.extend(poly.getBounds());
                    }
                    // append coords to combined coords (preserve ordering)
                    combinedCoords.push(...coords);
                });

                // determine bounds for this itinerary
                const itBounds = combinedCoords.length ? L.latLngBounds(combinedCoords) : null;

                const minutes = Math.round((it.duration || 0) / 60);
                const fare = it.fare ?? "";
                itineraryGroup.bindPopup?.(`<div><strong>Itinerary ${idx + 1}</strong><br/>Duration: ${minutes} min ${fare ? `<br/>Fare: ${fare}` : ""}</div>`);
                itineraryGroup.addTo(routesLayerRef.current);

                itinerariesData.push({
                    itinerary: it,
                    coords: combinedCoords,
                    bounds: itBounds,
                    summary: { minutes, fare, transfers: it.transfers ?? 0 }
                });
            });

            if (allBounds.isValid()) {
                mapRef.current.fitBounds(allBounds.pad(0.2));
            }

            // store routes for modal and show it
            setRoutesData(itinerariesData);
            // reset expanded state so all itineraries start collapsed
            setExpandedItineraries({});
            // show modal automatically after generation, but user can toggle it later
            setShowRoutesModal(true);
            setSelectedRouteIndex(null);
        } catch (err) {
            console.error("Routing error", err);
        } finally {
            setRouting(false);
        }
    };

    // show a single itinerary highlighted on map
    const showItinerary = (index) => {
        const item = routesData[index];
        if (!item || !mapRef.current) return;
        setSelectedRouteIndex(index);

        if (!highlightLayerRef.current) highlightLayerRef.current = L.layerGroup().addTo(mapRef.current);
        else highlightLayerRef.current.clearLayers();

        if (item.coords && item.coords.length) {
            L.polyline(item.coords, { color: "#ff1744", weight: 7, opacity: 0.95 }).addTo(highlightLayerRef.current);
            if (item.bounds && item.bounds.isValid()) {
                mapRef.current.fitBounds(item.bounds.pad(0.2));
            }
        }
    };

    const toggleItineraryDetails = (idx) => {
        setExpandedItineraries(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleSearchSubmit = async (e) => {
        e?.preventDefault?.();
        const q = (searchQuery || "").trim();
        if (!q || !mapRef.current) return;

        const token = import.meta.env.VITE_ONEMAP_TOKEN || "";
        if (!token) {
            console.error("VITE_ONEMAP_TOKEN not set");
            return;
        }

        setSearching(true);
        try {
            const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(q)}&returnGeom=Y&getAddrDetails=N&pageNum=1`;

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `${token}`
                }
            });

            const ct = res.headers.get("content-type") || "";
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`Search failed ${res.status}: ${body.slice(0, 500)}`);
            }

            if (!ct.includes("application/json")) {
                const text = await res.text();
                console.error("Search returned non-JSON response:", text.slice(0, 1000));
                throw new Error("Search endpoint returned non-JSON response. Check token / CORS / endpoint.");
            }

            const data = await res.json();

            const first = Array.isArray(data.results) && data.results.length ? data.results[0] : null;
            const candidate = first ?? (Array.isArray(data) && data.length ? data[0] : data);

            const latlng = extractLatLng(candidate);
            if (!latlng) {
                console.warn("No coordinate found in search response", data);
                return;
            }

            if (searchMarkerRef.current) {
                searchMarkerRef.current.remove();
                searchMarkerRef.current = null;
            }

            const targetLatLng = L.latLng(latlng.lat, latlng.lng);

            if (!source) {
                setSource(targetLatLng);
                if (sourceMarkerRef.current) {
                    sourceMarkerRef.current.setLatLng(targetLatLng);
                } else {
                    sourceMarkerRef.current = L.marker(targetLatLng, { title: "Source" }).addTo(mapRef.current);
                }
            } else {
                setDest(targetLatLng);
                if (destMarkerRef.current) {
                    destMarkerRef.current.setLatLng(targetLatLng);
                } else {
                    destMarkerRef.current = L.marker(targetLatLng, { title: "Destination" }).addTo(mapRef.current);
                }
            }

            mapRef.current.flyTo([latlng.lat, latlng.lng], 18, { duration: 0.8 });

        } catch (err) {
            console.error("Search error", err);
        } finally {
            setSearching(false);
            setSelectMode("none");
        }
    };

    return (
        <>
            <form onSubmit={handleSearchSubmit} style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 6, flex: "0 0 480px" }}>
                <div style={{ position: "relative", width: "98vw" }}>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search address or postal (e.g. 200640)"
                        style={{
                            width: "100%",
                            padding: "8px 44px 8px 12px",
                            fontSize: 16,
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            boxSizing: "border-box"
                        }}
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        style={{
                            position: "absolute",
                            right: 6,
                            top: 4,
                            bottom: 4,
                            padding: "6px 10px",
                            fontSize: 14,
                            borderRadius: 4,
                            background: "#1976d2",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer"
                        }}
                        title="Search"
                    >
                        {searching ? "..." : "Search"}
                    </button>
                </div>
            </form>

            <div style={{ marginTop: 10, marginLeft: 5, marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>

                <button
                    onClick={() => setSelectMode("source")}
                    style={{ padding: "6px 10px", fontSize: 16, background: selectMode === "source" ? "#2b7" : "rgba(204, 232, 220, 1)" }}
                >
                    Select Source
                </button>
                <button
                    onClick={() => setSelectMode("dest")}
                    style={{ padding: "6px 10px", fontSize: 16, background: selectMode === "dest" ? "#2b7" : "rgba(204, 232, 220, 1)" }}
                >
                    Select Dest.
                </button>
                <button onClick={clearPoints} style={{ padding: "6px 10px", fontSize: 16, background: "rgba(232, 204, 204, 1)" }}>
                    Clear
                </button>

            </div>
            
            <div style={{ marginTop: 0, marginLeft: 0, marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <button
                    onClick={computeRoute}
                    disabled={routing || !source || !dest}
                    style={{ padding: "6px 10px", fontSize: 16, background: routing ? "#ccc" : "#0b79d0", color: "#fff", marginLeft: 6 }}
                >
                    {routing ? "Routing..." : "Get Routes"}
                </button>

                {/* View / hide routes toggle (only enabled after routes generated) */}
                <button
                    onClick={() => setShowRoutesModal(v => !v)}
                    disabled={routesData.length === 0}
                    style={{ padding: "6px 10px", fontSize: 16, background: routesData.length === 0 ? "#ddd" : "#1976d2", color: "#fff" }}
                >
                    {showRoutesModal ? "Hide Routes" : `View Routes${routesData.length ? ` (${routesData.length})` : ""}`}
                </button>

                {/* Favourites button */}
                <button
                    onClick={() => setShowFavoritesModal(v => !v)}
                    disabled={favorites.length === 0}
                    style={{ padding: "6px 10px", fontSize: 16, background: favorites.length === 0 ? "#ddd" : "#ffcc00", color: "#000" }}
                >
                    {showFavoritesModal ? "Hide Favourites" : `Favourites${favorites.length ? ` (${favorites.length})` : ""}`}
                </button>

            </div>

            <div id="onemap" style={{ width: "100%", height: "78vh", borderRadius: 6, overflow: "hidden" }} />

            {/* Routes modal (only render when generated) */}
            {showRoutesModal && routesData.length > 0 && (
                 <div style={{
                     position: "fixed", left:7, top: 150, width: 360, maxHeight: "70vh", overflowY: "auto",
                     background: "#fff", border: "1px solid #ccc", borderRadius: 8, padding: 12, zIndex: 9999, boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
                 }}>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                         <strong>Routes ({routesData.length})</strong>
                         <div>
                            <button onClick={() => { setShowRoutesModal(false); setSelectedRouteIndex(null); }} style={{ marginRight: 6 }}>Close</button>
                         </div>
                     </div>
 
                    {routesData.map((r, idx) => (
                         <div
                            key={idx}
                            onClick={() => toggleItineraryDetails(idx)}
                            style={{
                                borderBottom: "1px solid #eee",
                                padding: 10,
                                marginBottom: 8,
                                cursor: "pointer",
                                background: expandedItineraries[idx] ? "#fafafa" : "transparent",
                                borderRadius: 6
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Itinerary {idx + 1}</div>
                                    <div style={{ fontSize: 12, color: "#555" }}>
                                        Duration: {r.summary?.minutes ?? "-"} min
                                        {r.summary?.fare ? ` • Fare: ${r.summary.fare}` : ""}
                                        {` • Transfers: ${r.summary?.transfers ?? 0}`}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); showItinerary(idx); setShowRoutesModal(false);}}
                                        style={{ padding: "6px 8px", fontSize:12, fontWeight:700 }}
                                    >
                                        Show on map
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: 8 }}>
                                {expandedItineraries[idx] ? (
                                    <>
                                    {(r.itinerary?.legs || []).map((leg, li) => (
                                        <div key={li} style={{ marginBottom: 6, fontSize: 13 }}>
                                            <div style={{ fontWeight: 600 }}>{(leg.mode || "LEG").toUpperCase()}{leg.route ? ` • ${leg.route}` : ""}</div>
                                            <div style={{ color: "#444" }}>
                                                From: {leg.from?.name ?? "—"} {leg.from?.departure ? `(${new Date(leg.from.departure).toLocaleTimeString()})` : ""}
                                            </div>
                                            <div style={{ color: "#444" }}>
                                                To: {leg.to?.name ?? "—"} {leg.to?.arrival ? `(${new Date(leg.to.arrival).toLocaleTimeString()})` : ""}
                                            </div>
                                            <div style={{ color: "#666", fontSize: 12 }}>
                                                Distance: {Math.round(leg.distance ?? 0)} m • Duration: {Math.round((leg.duration ?? 0) / 60)} min
                                            </div>
                                        </div>
                                    ))}

                                    {/* favorite controls at bottom of expanded route */}
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                                        <button
                                            onClick={(e) => toggleFavoriteByIndex(idx, e)}
                                            style={{
                                                padding: "6px 10px",
                                                background: isFavoritedIndex(idx) ? "#ffcc00" : "#e0e0e0",
                                                border: "none",
                                                borderRadius: 6,
                                                cursor: "pointer"
                                            }}
                                        >
                                            {isFavoritedIndex(idx) ? "Unfavorite" : "Favorite"}
                                        </button>
                                    </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                     ))}
                 </div>
             )}

            {/* Favorites modal */}
            {showFavoritesModal && favorites.length > 0 && (
                <div style={{
                    position: "fixed", left:7, top: 150, width: 360, maxHeight: "70vh", overflowY: "auto",
                    background: "#fff", border: "1px solid #ccc", borderRadius: 8, padding: 12, zIndex: 9999, boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <strong>Favourites ({favorites.length})</strong>
                        <div>
                            <button onClick={() => setShowFavoritesModal(false)} style={{ marginRight: 6 }}>Close</button>
                        </div>
                    </div>

                    {favorites.map((f, idx) => (
                        <div key={f.key ?? idx} style={{ borderBottom: "1px solid #eee", padding: 10, marginBottom: 8, borderRadius: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Saved: {f.savedAt ? new Date(f.savedAt).toLocaleString() : "—"}</div>
                                    <div style={{ fontSize: 12, color: "#555" }}>
                                        {f.summary ? `Duration: ${f.summary.minutes ?? "-"} min` : ""}
                                        {f.summary?.fare ? ` • Fare: ${f.summary.fare}` : ""}
                                        {f.summary ? ` • Transfers: ${f.summary.transfers ?? 0}` : ""}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button
                                        onClick={() => showFavoriteOnMap(idx)}
                                        style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700 }}
                                    >
                                        Show on map
                                    </button>
                                    <button
                                        onClick={() => removeFavorite(idx)}
                                        style={{ padding: "6px 8px", fontSize: 12, background: "#e57373", color: "#fff", border: "none", borderRadius: 4 }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* optional small itinerary preview */}
                            {f.itinerary?.legs && (
                                <div style={{ marginTop: 8, fontSize: 13, color: "#444" }}>
                                    {(f.itinerary.legs || []).slice(0,3).map((leg, i) => (
                                        <div key={i}>
                                            <strong>{(leg.mode||"").toUpperCase()}{leg.route ? ` • ${leg.route}` : ""}</strong>
                                            <div>{leg.from?.name ?? "—"} → {leg.to?.name ?? "—"}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}