// useNews.js / useNews.jsx
import { useEffect, useState } from "react";

const toISO = (d) => {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
};

// Helper: turn "api/news.json" into an absolute URL that respects Vite base
function resolveUrl(endpoint) {
  if (!endpoint) return null;
  if (/^https?:\/\//i.test(endpoint)) return endpoint;      // already absolute
  const base = import.meta.env.BASE_URL || "/";             // e.g. "/women-in-startups/"
  const origin = typeof location !== "undefined" ? location.origin : "";
  // ensure no double slashes
  const path = `${base.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
  return `${origin}${path}`;
}

export default function useNews(endpoint = "api/news.json") {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setStatus("loading");
        setError(null);

        const url = resolveUrl(endpoint);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}${txt ? ` • ${txt.slice(0, 160)}` : ""}`);
        }
        // (optional) guard against 404 HTML pages masquerading as JSON
        const ctype = res.headers.get("content-type") || "";
        if (!ctype.includes("application/json")) {
          const txt = await res.text();
          throw new Error(`Expected JSON but got ${ctype || "unknown"} • ${txt.slice(0, 160)}`);
        }

        const data = await res.json();
        const raw = Array.isArray(data) ? data : (data.items || []);
        if (!Array.isArray(raw)) throw new Error("API shape error: items is not an array");

        const normalized = raw.map(x => ({
          ...x,
          dateISO: toISO(x.date || x.pubDate || x.publishedAt),
        }));

        if (alive) {
          setItems(normalized);
          setStatus("success");
        }
      } catch (err) {
        if (alive) {
          setError(err.message || String(err));
          setStatus("error");
        }
      }
    })();
    return () => { alive = false; };
  }, [endpoint]);

  return { items, status, error };
}