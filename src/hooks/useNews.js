import { useEffect, useRef, useState } from "react";

export default function useNews() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);

  // Use Vite base; file is checked into docs/api/news.json
  const endpoint = `${import.meta.env.BASE_URL}api/news.json`;

  // tracks first load so we don't flicker later
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      // Only show "loading" if we have nothing yet
      if (!hasLoadedOnce.current) setStatus("loading");
      setError(null);

      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const raw = Array.isArray(data) ? data : (data.items || []);
        if (!Array.isArray(raw)) throw new Error("API shape error");

        if (alive) {
          setItems(raw);
          setStatus("success");
          hasLoadedOnce.current = true;
        }
      } catch (e) {
        if (alive) {
          setError(e);
          // If we already have items, keep showing them (no flicker)
          setStatus(hasLoadedOnce.current ? "success" : "error");
        }
      }
    })();

    return () => { alive = false; };
  }, [endpoint]);

  return { items, status, error };
}