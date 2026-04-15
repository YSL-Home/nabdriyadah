import fs from "fs";
import path from "path";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail", "description", "content:encoded"]
  }
});

const FEEDS = [
  {
    league: "premier-league",
    source: "BBC Sport",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml"
  },
  {
    league: "la-liga",
    source: "Sky Sports",
    url: "https://www.skysports.com/rss/12040"
  }
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildSlug(title, index) {
  return `news-${index + 1}`;
}

async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);

    return (parsed.items || []).slice(0, 8).map((item, index) => ({
      originalTitle: normalizeText(item.title || ""),
      originalDescription: normalizeText(
        stripHtml(item.contentSnippet || item.content || item.description || "")
      ),
      link: item.link || "",
      source: feed.source,
      league: feed.league,
      publishedAt: item.pubDate || new Date().toISOString(),
      slug: buildSlug(`${feed.league}-${item.title || "news"}`, index)
    }));
  } catch (error) {
    console.error(`Feed failed: ${feed.source}`, error.message);
    return [];
  }
}

async function main() {
  const allItems = [];

  for (const feed of FEEDS) {
    const items = await fetchFeed(feed);
    allItems.push(...items);
  }

  const unique = [];
  const seen = new Set();

  for (const item of allItems) {
    const key = `${item.originalTitle}-${item.link}`;
    if (!seen.has(key) && item.originalTitle) {
      seen.add(key);
      unique.push(item);
    }
  }

  const outputPath = path.join(process.cwd(), "content/raw-news.json");
  ensureDir(outputPath);

  if (unique.length === 0) {
    console.log("No raw news fetched, keeping existing files untouched.");
    process.exit(0);
  }

  fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2), "utf-8");
  console.log(`raw news saved: ${unique.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
