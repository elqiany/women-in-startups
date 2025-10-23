import { useEffect, useState } from "react";

const toISO = (d) => {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
};

// --- Helper that builds the correct full URL ---
function resolveUrl(endpoint) {
  if (!endpoint) return null;
  if (/^https?:\/\//i.test(endpoint)) return endpoint; // already absolute

  // normalize: strip leading / and add .json if missing
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

        const url = resolveUrl(endpoint);
        console.log("Fetching news v2:", url);  // ← this is where to log it

        // 🟢 THIS is your fetch — it stays right here
        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}${txt ? ` • ${txt.slice(0, 160)}` : ""}`);
        }

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