import { useEffect, useState } from "react";

const toISO = (d) => {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
};

// --- Helper: build correct full URL (respects Vite base) ---
function resolveUrl(endpoint) {
  if (!endpoint) return null;
  if (/^https?:\/\//i.test(endpoint)) return endpoint; // already absolute

  // normalize: strip leading slash and ensure .json
  let ep = String(endpoint).trim().replace(/^\/+/, "");
  if (!/\.json($|\?)/i.test(ep)) ep = `${ep.replace(/\/+$/, "")}.json`;

  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, ""); // e.g. "/women-in-startups"
  const origin = typeof location !== "undefined" ? location.origin : "";
  return `${origin}${base}/${ep}`;
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

        // Build and log the URL
        const url = resolveUrl(endpoint);
        const finalUrl = `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`; // cache-bust
        console.log("Fetching news v2:", finalUrl);

        const res = await fetch(finalUrl, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}${txt ? ` • ${txt.slice(0, 160)}` : ""}`);
        }

        // Allow JSON or text/plain (GitHub Pages sometimes uses text/plain)
        const ctype = (res.headers.get("content-type") || "").toLowerCase();
        let data;
        if (ctype.includes("json")) {
          data = await res.json();
        } else if (ctype.startsWith("text/plain")) {
          const txt = await res.text();
          try {
            data = JSON.parse(txt);
          } catch {
            throw new Error(`Expected JSON but got plain text • ${txt.slice(0, 160)}`);
          }
        } else {
          const txt = await res.text();
          if (/<!doctype|<html/i.test(txt)) {
            throw new Error(`Got HTML (likely a 404 fallback). URL: ${finalUrl}`);
          }
          throw new Error(`Unexpected content-type: ${ctype || "unknown"} • ${txt.slice(0, 160)}`);
        }

        const raw = Array.isArray(data) ? data : data.items || [];
        if (!Array.isArray(raw)) throw new Error("API shape error: items is not an array");

        const normalized = raw.map((x) => ({
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

    return () => {
      alive = false;
    };
  }, [endpoint]);

  return { items, status, error };
}
