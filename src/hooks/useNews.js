import { useEffect, useState } from "react";

export default function useNews() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // this works on both local dev and GitHub Pages
  const endpoint = `${import.meta.env.BASE_URL}api/news.json`;

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setStatus("loading");
        setError(null);

        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(
            `HTTP ${res.status}${txt ? ` • ${txt.slice(0, 160)}` : ""}`
          );
        }

        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.items || [];
        if (!Array.isArray(raw)) throw new Error("API shape error");

        if (alive) {
          setItems(raw);
          setStatus("success");
        }
      } catch (err) {
        if (alive) {
          setError(err);
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