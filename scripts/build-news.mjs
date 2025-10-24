import fs from "node:fs/promises";
import Parser from "rss-parser";

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

// feeds to pull
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

const WOMEN_SITES = new Set([
  "women2.com",
  "girlsintech.org",
  "womenwhocode.com",
  "forbes.com",
]);

const GENDER_TERMS = [
  "women", "woman", "female", "girls", "lady", "ladies",
  "woman-led", "women-led", "female-founded", "female founder",
  "she ", " her ",
];
const ROLE_TERMS = [
  "founder", "startup", "ceo", "cto", "cfo",
  "partner", "investor", "vc", "engineer",
  "developer", "entrepreneur", "tech", "ai",
];

const normalize = (s) =>
  (s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, " ");

function hostOf(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function isWomenRelevant(item, feedUrl) {
  const host = hostOf(feedUrl);
  if (WOMEN_SITES.has(host)) return true;
  const text = normalize(
    [item.title, item.contentSnippet, item.summary, ...(item.categories || [])].join(" ")
  );
  const hasGender = GENDER_TERMS.some((t) => text.includes(t));
  if (!hasGender) return false;
  const hasRole = ROLE_TERMS.some((t) => text.includes(t));
  return hasRole;
}

const safeISO = (d) => {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
};

async function main() {
  console.log("Building news feed…");
  const lists = await Promise.all(
    FEEDS.map(async (feedUrl) => {
      try {
        const feed = await parser.parseURL(feedUrl);
        const title = feed.title || hostOf(feedUrl);
        return (feed.items || []).slice(0, 15).map((it, i) => ({
          _feedUrl: feedUrl,
          title: (it.title || "(untitled)").trim(),
          url: it.link || it.guid || "",
          date: safeISO(it.isoDate || it.pubDate),
          source: title,
          summary: (it.contentSnippet || it.summary || "").slice(0, 300),
          categories: it.categories || [],
        }));
      } catch (e) {
        console.error("RSS parse failed:", feedUrl, e.message);
        return [];
      }
    })
  );

  let items = lists.flat().filter((x) => x.url && x.title && isWomenRelevant(x, x._feedUrl));

  items = items
    .sort((a, b) => (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0))
    .slice(0, 40)
    .map(({ _feedUrl, categories, ...rest }) => rest);

  await fs.mkdir("public/api", { recursive: true });
  await fs.writeFile("public/api/news.json", JSON.stringify({ items }, null, 2));
  console.log(`Wrote ${items.length} items to public/api/news.json`);
}

main().catch(async (e) => {
  console.error("Prebuild failed:", e);
  await fs.mkdir("public/api", { recursive: true });
  await fs.writeFile("public/api/news.json", JSON.stringify({ items: [] }, null, 2));
  process.exit(0);
});