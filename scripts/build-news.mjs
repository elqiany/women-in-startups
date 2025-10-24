// scripts/build-news.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("public/api");
const OUT_FILE = path.join(OUT_DIR, "news.json");

// Helper: always ensure we publish *something*
async function writeSafe(items, note) {
  await mkdir(OUT_DIR, { recursive: true });
  const payload = Array.isArray(items) ? items : [];
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2));
  console.log(note ?? `Wrote ${OUT_FILE} with ${payload.length} items`);
}

(async () => {
  try {
    let Parser;
    try {
      // dynamic import lets the script still run even if module missing
      ({ default: Parser } = await import("rss-parser"));
    } catch (e) {
      console.warn("rss-parser not found; writing empty news.json");
      await writeSafe([], "Wrote empty news.json (no rss-parser)");
      return;
    }

    const parser = new Parser();
    const feeds = [
      // put your feed URLs here; it’s OK if some 404—this code ignores failures
      "https://girlsintech.org/feed/",
      "https://feeds.feedburner.com/venturebeat/startups",
      "https://www.forbes.com/women-in-tech/feed/",
    ];

    const items = [];
    for (const url of feeds) {
      try {
        const f = await parser.parseURL(url);
        for (const it of f.items ?? []) {
          items.push({
            title: it.title ?? "",
            link: it.link ?? "",
            date: it.isoDate ?? it.pubDate ?? null,
            source: f.title ?? "",
          });
        }
      } catch (e) {
        console.warn("RSS parse failed:", url, String(e?.message ?? e));
      }
    }

    // sort newest first
    items.sort((a, b) => (new Date(b.date || 0)) - (new Date(a.date || 0)));

    await writeSafe(items, `Wrote ${items.length} items to ${OUT_FILE}`);
  } catch (e) {
    console.error("Unexpected error in build-news:", e);
    await writeSafe([], "Wrote empty news.json due to unexpected error");
  }
})();
