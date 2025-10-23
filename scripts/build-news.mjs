// scripts/build-news.mjs
// Run your existing RSS logic at build-time and write public/news.json

import fs from "node:fs/promises";
import Parser from "rss-parser";

// ---------- your existing setup ----------
const parser = new Parser({
  headers: { "User-Agent": "WomenInStartups/1.0 (+https://example.com)" },
  timeout: 10000,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["enclosure", "enclosure", { keepArray: true }],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

// Curated women/tech/startup feeds
const FEEDS = [
  "https://women2.com/feed/",
  "https://www.womenwhocode.com/blog/rss.xml",
  "https://girlsintech.org/feed/",
  "https://techcrunch.com/tag/women/feed/",
  "https://www.forbes.com/women-in-tech/feed/",
  "https://techcrunch.com/startups/feed/",
  "https://feeds.feedburner.com/venturebeat/startups",
  "https://feeds.feedburner.com/EntrepreneurLatest",
  "https://rss.nytimes.com/services/xml/rss/nyt/Entrepreneurship.xml",
];

/* ---------------- utilities ---------------- */
const safeISO = (d) => { if (!d) return null; const t = new Date(d); return Number.isNaN(t.getTime()) ? null : t.toISOString(); };
const forceHttps = (u) => { if (!u) return null; if (u.startsWith("//")) return "https:" + u; if (u.startsWith("http://")) return "https://" + u.slice(7); return u; };
const safeUrl = (u) => { if (!u || typeof u !== "string") return null; const s = forceHttps(u.trim()); try { new URL(s); return s; } catch { return null; } };
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

/* ---------------- image picking ---------------- */
function pickImage(it) {
  for (const enc of asArray(it.enclosure)) {
    const maybe = enc?.url || enc?.$?.url;
    const typ = String(enc?.type || enc?.$?.type || "");
    if (maybe && typ.startsWith("image/")) {
      const u = safeUrl(maybe); if (u) return u;
    }
  }
  for (const m of asArray(it.mediaContent)) {
    const u = safeUrl(m?.url || m?.$?.url);
    if (u) return u;
  }
  for (const t of asArray(it.mediaThumbnail)) {
    const u = safeUrl(t?.url || t?.$?.url);
    if (u) return u;
  }
  const html = it.contentEncoded || it.content || it.summary || "";
  const m = html && html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m && m[1]) {
    const u = safeUrl(m[1]); if (u) return u;
  }
  return null;
}

/* ---------------- OG-image fallback ---------------- */
const ogCache = new Map(); // key=articleUrl -> { url, ts }
const OG_TTL_MS = 1000 * 60 * 60;

function absolutize(base, maybeRel) { try { return new URL(maybeRel, base).toString(); } catch { return null; } }

async function getOgImage(articleUrl) {
  if (!articleUrl) return null;
  const hit = ogCache.get(articleUrl);
  if (hit && Date.now() - hit.ts < OG_TTL_MS) return hit.url;

  try {
    // Node 18+ has global fetch. If using older Node, install undici and: import { fetch } from "undici";
    const resp = await fetch(articleUrl, {
      headers: {
        "User-Agent": "WomenInStartups/1.0 (+https://example.com)",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();

    const meta = (name) => {
      const r = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i");
      const m = html.match(r);
      return m && m[1] ? m[1] : null;
    };

    let img = meta("og:image") || meta("twitter:image") || meta("twitter:image:src");
    if (!img) {
      const m = html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);
      if (m && m[1]) img = m[1];
    }
    if (!img) {
      const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (m && m[1]) img = m[1];
    }

    if (img) {
      const abs = absolutize(articleUrl, img);
      const good = safeUrl(abs || img);
      if (good) {
        ogCache.set(articleUrl, { url: good, ts: Date.now() });
        return good;
      }
    }
  } catch { /* ignore */ }

  ogCache.set(articleUrl, { url: null, ts: Date.now() });
  return null;
}

/* ---------------- relevance filter ---------------- */
const WOMEN_SITES = new Set([
  "women2.com",
  "girlsintech.org",
  "womenwhocode.com",
  "forbes.com",
]);

const GENDER_TERMS = [
  "women", "woman", "female", "girls", "lady", "ladies",
  "woman-led", "women-led", "female-founded", "female founder", "woman founder",
  "she ", " her ",
];

const ROLE_TERMS = [
  "founder", "cofounder", "co-founder", "startup", "start-up",
  "ceo", "cto", "cfo", "chief", "chair", "partner", "investor", "vc", "angel",
  "engineer", "developer", "designer", "product manager", "researcher",
  "entrepreneur", "accelerator", "incubator", "seed", "series a", "series b",
  "tech", "ai", "software", "hardware",
];

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, " ");
}

function isWomenRelevant(item, feedUrl) {
  const host = hostOf(feedUrl);
  if (WOMEN_SITES.has(host)) return true;

  const hay = normalize([item.title, item.summary, ...(item.categories || [])].join(" "));
  const hasGender = GENDER_TERMS.some(t => hay.includes(t));
  if (!hasGender) return false;

  const hasRole = ROLE_TERMS.some(t => hay.includes(t));
  return hasRole;
}

// ---------- build task ----------
async function main() {
  const lists = await Promise.all(FEEDS.map(async (feedUrl) => {
    try {
      const feed = await parser.parseURL(feedUrl);
      const feedTitle = (feed.title || hostOf(feedUrl));
      return (feed.items || []).slice(0, 20).map((it, i) => {
        const url = safeUrl(it.link || it.guid);
        return {
          _feedUrl: feedUrl,
          id: it.guid || it.id || `${feedTitle}-${i}`,
          title: (it.title || "(untitled)").trim(),
          url,
          date: safeISO(it.isoDate || it.pubDate || it.published || it.updated),
          source: (it.creator || it.author || feedTitle || "").trim(),
          summary: (it.contentSnippet || it.summary || it.content || "").slice(0, 320),
          categories: it.categories || [],
          image: pickImage(it),
        };
      });
    } catch (e) {
      console.error("RSS parse failed:", feedUrl, e?.message || e);
      return [];
    }
  }));

  let items = lists.flat().filter((x) => x.title && x.url && isWomenRelevant(x, x._feedUrl));

  // Enrich up to 20 items without images
  const toEnrich = items.filter((x) => !x.image).slice(0, 20);
  for (const it of toEnrich) {
    const og = await getOgImage(it.url);
    if (og) it.image = og;
  }

  items = items
    .sort((a, b) => (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0))
    .slice(0, 40)
    .map(({ _feedUrl, categories, ...rest }) => rest);

    await fs.mkdir("public/api", { recursive: true });
    await fs.writeFile("public/api/news.json", JSON.stringify({ items }, null, 2));
    
    // also write directly to GitHub Pages' served directory (docs/)
    await fs.mkdir("docs/api", { recursive: true }).catch(() => {});
    await fs.writeFile("docs/api/news.json", JSON.stringify({ items }, null, 2)).catch(() => {});
    
    console.log(`✅ Wrote public/api/news.json and docs/api/news.json with ${items.length} items`);
}

main().catch((e) => {
  console.error("Build news failed:", e);
  process.exit(1);
});