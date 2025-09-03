import { useEffect, useState } from "react";

const toISO = (d) => {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
};

export default function useNews(endpoint = "/api/news") {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setStatus("loading");
        setError(null);

        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}${txt ? ` • ${txt.slice(0, 160)}` : ""}`);
        }

        const data = await res.json();
        const raw = Array.isArray(data) ? data : (data.items || []);
        if (!Array.isArray(raw)) throw new Error("API shape error: expected { items: [] }");

        const normalized = raw.map((it, idx) => ({
          id: it.id ?? `${idx}-${it.url ?? it.link ?? "na"}`,
          url: it.url ?? it.link ?? "#",
          title: it.title ?? "",
          source: it.source ?? it.author ?? "",
          date: toISO(it.date || it.isoDate || it.pubDate || it.published || it.updated),
          summary: it.summary ?? it.contentSnippet ?? "",
          image: it.image ?? null,
        }));

        if (!alive) return;
        setItems(normalized);
        setStatus("success");
      } catch (e) {
        if (!alive) return;
        setError(String(e?.message || e));
        setStatus("error");
      }
    })();
    return () => { alive = false; };
  }, [endpoint]);

  return { items, status, error };
}
