/**
 * breaking-news-scan.mjs
 * Scanne les flux RSS, compare avec les articles existants.
 * Si un titre vraiment nouveau est détecté, écrit /tmp/breaking_changed = true
 * et met à jour content/raw-news.json avec UNIQUEMENT les nouveaux articles.
 *
 * Si FORCE_FULL_PIPELINE=true → lance fetch-news.mjs d'abord + marque toujours changed=true
 */
import fs from "fs";
import path from "path";
import Parser from "rss-parser";
import { execFileSync } from "child_process";

const RAW_PATH    = path.join(process.cwd(), "content/raw-news.json");
const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const FLAG_FILE   = "/tmp/breaking_changed";

const BREAKING_SOURCES = [
  { url: "https://www.bbc.com/sport/football/rss.xml",          name: "BBC Sport",    sport: "football", priority: 10 },
  { url: "https://www.btolat.com/rss",                          name: "Btolat",       sport: "football", priority: 9  },
  { url: "https://www.kooora.com/?rss",                         name: "Kooora",       sport: "football", priority: 8  },
  { url: "https://hesport.com/feed",                            name: "Hesport",      sport: "football", priority: 7  },
  { url: "https://news.google.com/rss/search?q=football+arabic&hl=ar&gl=AR&ceid=AR:ar", name: "Google News Football", sport: "football", priority: 6 },
  { url: "https://news.google.com/rss/search?q=NBA+basketball&hl=ar&gl=AR&ceid=AR:ar", name: "Google News Basketball", sport: "basketball", priority: 5 },
  { url: "https://news.google.com/rss/search?q=tennis&hl=ar&gl=AR&ceid=AR:ar",         name: "Google News Tennis",     sport: "tennis",     priority: 5 },
];

const parser = new Parser({ timeout: 8000 });

function normalizeTitle(t = "") {
  return String(t).replace(/\s+/g, " ").trim().toLowerCase();
}

async function main() {
  // Mode pipeline complet (déclenché manuellement)
  if (process.env.FORCE_FULL_PIPELINE === "true") {
    console.log("FORCE_FULL_PIPELINE=true — lancement du pipeline complet...");
    try {
      execFileSync("node", [path.join(process.cwd(), "scripts/fetch-news.mjs")], { stdio: "inherit" });
    } catch (e) {
      console.log("fetch-news failed:", e.message?.slice(0, 100));
    }
    fs.writeFileSync(FLAG_FILE, "true");
    process.exit(0);
  }

  // Titres déjà publiés
  let existingTitles = new Set();
  try {
    const arts = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));
    arts.forEach(a => existingTitles.add(normalizeTitle(a.title)));
  } catch {}

  // Titres déjà en raw (éviter doublon)
  let rawItems = [];
  try { rawItems = JSON.parse(fs.readFileSync(RAW_PATH, "utf-8")); } catch {}
  const rawTitles = new Set(rawItems.map(i => normalizeTitle(i.originalTitle || i.title || "")));

  const newItems = [];

  for (const source of BREAKING_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || []).slice(0, 5); // seulement les 5 derniers
      for (const item of items) {
        const title = String(item.title || "").trim();
        const key = normalizeTitle(title);
        if (!key || existingTitles.has(key) || rawTitles.has(key)) continue;

        // Vérifie fraîcheur (< 2h)
        const pub = item.pubDate ? new Date(item.pubDate) : null;
        if (pub && Date.now() - pub.getTime() > 2 * 60 * 60 * 1000) continue;

        newItems.push({
          originalTitle: title,
          originalDescription: String(item.contentSnippet || item.description || "").trim().slice(0, 500),
          link: item.link || source.url,
          source: source.name,
          sourcePriority: source.priority + 5, // priorité haute = breaking
          sport: source.sport,
          league: source.sport === "football" ? "mixed" : source.sport,
          topicTags: ["عاجل", "أخبار رياضية"],
          publishedAt: pub ? pub.toISOString() : new Date().toISOString(),
          isBreaking: true,
        });
      }
    } catch (e) {
      console.log(`Scan ${source.name} failed: ${e.message}`);
    }
  }

  // Vérifie si des sports sont absents du site → déclenche un rebuild complet
  if (newItems.length === 0) {
    try {
      const published = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));
      const sports = new Set(published.map(a => a.sport));
      const required = ["basketball", "tennis", "padel", "futsal"];
      const missing = required.filter(s => !sports.has(s));
      if (missing.length > 0) {
        console.log(`Sports manquants dans les articles publiés: ${missing.join(", ")} — lancement fetch + rebuild...`);
        try {
          execFileSync("node", [path.join(process.cwd(), "scripts/fetch-news.mjs")], { stdio: "inherit" });
        } catch (e) { console.log("fetch-news failed:", e.message?.slice(0, 100)); }
        fs.writeFileSync(FLAG_FILE, "true");
        process.exit(0);
      }
    } catch {}
    console.log("Aucun nouveau titre breaking détecté.");
    fs.writeFileSync(FLAG_FILE, "false");
    process.exit(0);
  }

  console.log(`${newItems.length} nouvelles breaking trouvées !`);
  newItems.forEach(i => console.log(" •", i.originalTitle?.slice(0, 70)));

  // Injecte en tête du raw-news.json
  const updated = [...newItems, ...rawItems].slice(0, 60);
  fs.mkdirSync(path.dirname(RAW_PATH), { recursive: true });
  fs.writeFileSync(RAW_PATH, JSON.stringify(updated, null, 2), "utf-8");

  fs.writeFileSync(FLAG_FILE, "true");
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  fs.writeFileSync(FLAG_FILE, "false");
  process.exit(0);
});
