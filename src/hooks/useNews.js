import { useEffect, useState } from "react";

export default function useNews() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/news.json`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const raw = Array.isArray(data) ? data : (data.items || []);
        if (Array.isArray(raw)) setItems(raw);
      } catch (e) {
        console.error("news fetch failed:", e);
      }
    })();
  }, []);

  return { items };
}