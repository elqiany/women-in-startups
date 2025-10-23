// src/hooks/useNews.js (or wherever your hook lives)
import { useEffect, useState } from "react";

const toISO = (d) => {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
};

// Works in dev ("/") and on GH Pages ("/women-in-startups/")
const defaultEndpoint = `${import.meta.env.BASE_URL}news.json`;

export default function useNews(endpoint = defaultEndpoint) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setStatus("loading");
      setError(null);

      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) {
          if (alive) { setStatus("error"); setError(`HTTP ${res.status}`); setItems([]); }
          return;
        }

        let data;
        try {
          data = await res.json();
        } catch {
          if (alive) { setStatus("error"); setError("Bad JSON"); setItems([]); }
          return;
        }

        const raw = Array.isArray(data) ? data : (data.items || []);
        if (!Array.isArray(raw)) {
          if (alive) { setStatus("error"); setError("API shape"); setItems([]); }
          return;
        }

        const norm = raw.map((it) => ({
          ...it,
          date: toISO(it.date || it.publishedAt),
        }));

        if (alive) { setItems(norm); setStatus("success"); }
      } catch (e) {
        if (alive) { setStatus("error"); setError(e?.message || "Unknown"); setItems([]); }
      }
    })();
    return () => { alive = false; };
  }, [endpoint]);

  return { items, status, error };
}