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
  // ── Football — sources prioritaires (arabes + anglais) ───────────────────
  { url: "https://www.bbc.com/sport/football/rss.xml",                                   name: "BBC Sport",          sport: "football", priority: 10 },
  { url: "https://www.btolat.com/rss",                                                   name: "Btolat",             sport: "football", priority: 10 },
  { url: "https://www.kooora.com/?rss",                                                  name: "Kooora",             sport: "football", priority: 9  },
  { url: "https://hesport.com/feed",                                                     name: "Hesport",            sport: "football", priority: 9  },
  { url: "https://www.yallakora.com/rss/football",                                       name: "Yalla Kora",         sport: "football", priority: 8  },
  { url: "https://www.filgoal.com/rss",                                                  name: "FilGoal",            sport: "football", priority: 8  },
  { url: "https://www.goal.com/ar/rss/news",                                             name: "Goal Arabic",        sport: "football", priority: 7  },
  { url: "https://www.skysports.com/rss/12040",                                          name: "Sky Sports Football",sport: "football", priority: 7  },
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml",                              name: "BBC Sport Alt",      sport: "football", priority: 6  },
  { url: "https://news.google.com/rss/search?q=كرة+القدم+دوري&hl=ar&gl=AR&ceid=AR:ar",  name: "GNews Foot AR",      sport: "football", priority: 6  },
  { url: "https://news.google.com/rss/search?q=Champions+League+football&hl=ar&gl=AR&ceid=AR:ar", name: "GNews UCL", sport: "football", priority: 6 },
  { url: "https://news.google.com/rss/search?q=Premier+League+football&hl=ar&gl=AR&ceid=AR:ar",   name: "GNews PL",  sport: "football", priority: 5 },
  { url: "https://news.google.com/rss/search?q=La+Liga+football&hl=ar&gl=AR&ceid=AR:ar",          name: "GNews Liga",sport: "football", priority: 5 },
  // ── Football — sources supplémentaires ──────────────────────────────────
  { url: "https://www.espn.com/espn/rss/soccer/news",                                    name: "ESPN Soccer",        sport: "football", priority: 8  },
  { url: "https://www.marca.com/rss/futbol/primera-division.xml",                        name: "Marca",              sport: "football", priority: 7  },
  { url: "https://www.as.com/rss/tags/ultimas_noticias.xml",                             name: "AS",                 sport: "football", priority: 7  },
  { url: "https://www.lequipe.fr/rss/actu_rss_Football.xml",                             name: "L'Equipe",           sport: "football", priority: 7  },
  { url: "https://news.google.com/rss/search?q=Bundesliga+football&hl=ar&gl=AR&ceid=AR:ar",     name: "GNews Bundesliga", sport: "football", priority: 5 },
  { url: "https://news.google.com/rss/search?q=Serie+A+football&hl=ar&gl=AR&ceid=AR:ar",        name: "GNews SerieA",   sport: "football", priority: 5 },
  { url: "https://news.google.com/rss/search?q=دوري+السعودي+كرة+القدم&hl=ar&gl=AR&ceid=AR:ar", name: "GNews Saudi",    sport: "football", priority: 6 },
  { url: "https://news.google.com/rss/search?q=الدوري+المصري+الممتاز&hl=ar&gl=AR&ceid=AR:ar",  name: "GNews Egypt",    sport: "football", priority: 5 },
  { url: "https://news.google.com/rss/search?q=الدوري+المغربي+كرة+القدم&hl=ar&gl=AR&ceid=AR:ar",name:"GNews Morocco",  sport: "football", priority: 5 },
  { url: "https://news.google.com/rss/search?q=الدوري+الجزائري+كرة+القدم&hl=ar&gl=AR&ceid=AR:ar",name:"GNews Algeria", sport: "football", priority: 4 },
  // ── Basket ───────────────────────────────────────────────────────────────
  { url: "https://www.espn.com/espn/rss/nba/news",                                       name: "ESPN NBA",           sport: "basketball",priority: 7  },
  { url: "https://feeds.bbci.co.uk/sport/basketball/rss.xml",                            name: "BBC Basketball",     sport: "basketball",priority: 6  },
  { url: "https://news.google.com/rss/search?q=NBA+basketball&hl=ar&gl=AR&ceid=AR:ar",  name: "GNews NBA",          sport: "basketball",priority: 5  },
  // ── Tennis ───────────────────────────────────────────────────────────────
  { url: "https://www.espn.com/espn/rss/tennis/news",                                    name: "ESPN Tennis",        sport: "tennis",   priority: 7  },
  { url: "https://feeds.bbci.co.uk/sport/tennis/rss.xml",                                name: "BBC Tennis",         sport: "tennis",   priority: 6  },
  { url: "https://news.google.com/rss/search?q=tennis+ATP+WTA&hl=ar&gl=AR&ceid=AR:ar",  name: "GNews Tennis",       sport: "tennis",   priority: 4  },
  // ── F1 ───────────────────────────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml",                              name: "BBC F1",             sport: "f1",       priority: 7  },
  { url: "https://www.espn.com/espn/rss/f1/news",                                        name: "ESPN F1",            sport: "f1",       priority: 7  },
  { url: `https://news.google.com/rss/search?q=Formula+1+F1+race+${new Date().getFullYear()}&hl=ar&gl=AR&ceid=AR:ar`, name: "GNews F1", sport: "f1", priority: 5 },
  // ── Golf ─────────────────────────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/sport/golf/rss.xml",                                  name: "BBC Golf",           sport: "golf",     priority: 5  },
  { url: `https://news.google.com/rss/search?q=golf+PGA+Masters+${new Date().getFullYear()}&hl=ar&gl=AR&ceid=AR:ar`, name: "GNews Golf", sport: "golf", priority: 4 },
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

  const safeUrl = (url) => url.replace(/[^\x00-\x7F]/g, (c) => encodeURIComponent(c));

  // ── Scan PARALLÈLE (était séquentiel : 19 × 8s = 2.5 min, maintenant ~8s) ──
  const scanResults = await Promise.allSettled(
    BREAKING_SOURCES.map(source =>
      parser.parseURL(safeUrl(source.url))
        .then(feed => ({ source, items: (feed.items || []).slice(0, 5) }))
        .catch(e => { console.log(`Scan ${source.name} failed: ${e.message?.slice(0, 60)}`); return null; })
    )
  );

  for (const result of scanResults) {
    if (result.status !== "fulfilled" || !result.value) continue;
    const { source, items } = result.value;
    for (const item of items) {
      const title = String(item.title || "").trim();
      const key = normalizeTitle(title);
      if (!key || existingTitles.has(key) || rawTitles.has(key)) continue;

      // Vérifie fraîcheur (< 12h pour capturer plus d'articles)
      const pub = item.pubDate ? new Date(item.pubDate) : null;
      if (pub && Date.now() - pub.getTime() > 12 * 60 * 60 * 1000) continue;

      // Extraire l'image depuis le flux RSS
      const imageUrl = item.enclosure?.url
        || item["media:content"]?.url
        || item.media?.content?.url
        || item.image?.url
        || (() => { const m = String(item.content || item["content:encoded"] || item.description || "").match(/<img[^>]+src=["']([^"']+)["']/i); return m?.[1] || null; })()
        || null;

      newItems.push({
        originalTitle: title,
        originalDescription: String(item.contentSnippet || item.description || "").trim().slice(0, 500),
        link: item.link || source.url,
        imageUrl: imageUrl,
        source: source.name,
        sourcePriority: source.priority + 5,
        sport: source.sport,
        league: source.sport === "football" ? "mixed" : source.sport,
        topicTags: ["عاجل", "أخبار رياضية"],
        publishedAt: pub ? pub.toISOString() : new Date().toISOString(),
        isBreaking: true,
      });
    }
  }

  // Vérifie si des sports sont absents du site → déclenche un rebuild complet
  if (newItems.length === 0) {
    try {
      const published = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));
      const sports = new Set(published.map(a => a.sport));
      const required = ["basketball", "tennis", "padel", "futsal", "f1", "golf"];
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
