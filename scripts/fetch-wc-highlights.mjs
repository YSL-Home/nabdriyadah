/**
 * fetch-wc-highlights.mjs
 * Récupère les matchs TERMINÉS de la Coupe du Monde 2026 (via le proxy du site,
 * pas d'appel direct API-Football → utilise la clé Cloudflare + cache 300s),
 * puis cherche la vidéo des buts/résumé sur YouTube (YouTube Data API v3).
 *
 * Sortie: content/wc-highlights.json  { [fixtureId]: {home,away,gh,ga,date,videoId,title} }
 * Idempotent: ne recherche que les matchs sans videoId déjà stocké.
 *
 * Env: GOOGLE_API_KEY (YouTube Data API). Quota YouTube: ~100 unités/match neuf.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "content/wc-highlights.json");

const SITE = process.env.SITE_URL || "https://nabdriyadah.com";
const PROXY = `${SITE}/api/live`;
const YT_SEARCH = "https://www.googleapis.com/youtube/v3/search";

// Rotation clés YouTube (10k unités/jour chacune, search=100u → 100 recherches/clé)
const YT_KEYS = [
  process.env.GOOGLE_API_KEY,
  process.env.GOOGLE_API_KEY_2,
  process.env.GOOGLE_API_KEY_3,
  process.env.GOOGLE_API_KEY_4,
  process.env.GOOGLE_API_KEY_5,
  process.env.GOOGLE_API_KEY_6,
].filter(Boolean);

let ytKeyIdx = 0;
function nextYtKey() {
  if (!YT_KEYS.length) return null;
  const k = YT_KEYS[ytKeyIdx % YT_KEYS.length];
  ytKeyIdx++;
  return k;
}

const MAX_DAYS_PER_RUN = 5;      // max 5 appels API Football/run pour préserver le quota
const WC_END_DATE = "2026-07-20"; // jour après la finale (19 juillet)

const FINISHED = ["FT", "AET", "PEN"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadExisting() {
  try { return JSON.parse(fs.readFileSync(OUT, "utf-8")); } catch { return {}; }
}

const WC_LEAGUE_ID = 1;

// Idempotent : seuls les matchs sans videoId déjà en cache sont retraités.
// Cap à MAX_DAYS_PER_RUN pour préserver le quota API (rattrapage progressif).
async function fetchFinishedMatches(existing) {
  // Dernière date connue dans le JSON
  const lastKnown = Object.values(existing).reduce((max, m) => {
    const d = (m.date || "").slice(0, 10);
    return d > max ? d : max;
  }, "2026-06-10");

  const startDate = new Date(lastKnown);
  startDate.setUTCDate(startDate.getUTCDate() - 1); // recouverture d'1 jour
  const endDate = new Date(Math.min(new Date(WC_END_DATE).getTime(), Date.now() + 86400000));

  // Générer toutes les dates manquantes, limiter à MAX_DAYS_PER_RUN
  const allDates = [];
  for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    allDates.push(d.toISOString().slice(0, 10));
  }
  const dates = allDates.slice(0, MAX_DAYS_PER_RUN);
  const remaining = allDates.length - dates.length;
  console.log(`  📅 Fetch ${dates[0]} → ${dates[dates.length - 1]} (${dates.length} jours, ${remaining} restants pour prochains runs)`);

  const out = [];
  for (const date of dates) {
    try {
      const res = await fetch(`${PROXY}?path=${encodeURIComponent(`fixtures?date=${date}`)}`);
      const data = await res.json();
      (data.response || [])
        .filter((m) => m.league?.id === WC_LEAGUE_ID && FINISHED.includes(m.fixture?.status?.short))
        .forEach((m) => out.push(m));
    } catch (e) {
      console.warn(`  ✗ date ${date}: ${e.message}`);
    }
    await sleep(1500);
  }
  return out;
}

async function searchHighlight(home, away) {
  if (!YT_KEYS.length) return null;
  // Essayer en arabe d'abord, puis en anglais en fallback
  const queries = [
    `أهداف وملخص ${home} ضد ${away} كأس العالم 2026`,
    `${home} vs ${away} highlights FIFA World Cup 2026`,
  ];
  for (const q of queries) {
    for (let attempt = 0; attempt < YT_KEYS.length; attempt++) {
      const key = nextYtKey();
      const params = new URLSearchParams({
        key, part: "snippet", q, type: "video",
        videoEmbeddable: "true", maxResults: "3", order: "relevance",
      });
      try {
        const res = await fetch(`${YT_SEARCH}?${params}`);
        const data = await res.json();
        if (data.error?.code === 403 || data.error?.code === 429) continue; // quota épuisé → clé suivante
        const item = data.items?.[0];
        if (item?.id?.videoId) return { videoId: item.id.videoId, title: item.snippet?.title || "" };
      } catch { continue; }
    }
  }
  return null;
}

async function main() {
  const existing = loadExisting();
  let matches;
  try {
    matches = await fetchFinishedMatches(existing);
  } catch (e) {
    console.warn("⚠ Impossible de récupérer les matchs:", e.message);
    process.exit(0);
  }
  console.log(`📺 ${matches.length} matchs CDM terminés`);

  let added = 0;
  for (const m of matches) {
    const id = String(m.fixture?.id);
    const home = m.teams?.home?.name, away = m.teams?.away?.name;
    const base = {
      home, away,
      homeLogo: m.teams?.home?.logo, awayLogo: m.teams?.away?.logo,
      gh: m.goals?.home, ga: m.goals?.away,
      date: m.fixture?.date, round: m.league?.round || "",
    };
    if (existing[id]?.videoId) { existing[id] = { ...base, videoId: existing[id].videoId, title: existing[id].title }; continue; }
    const vid = await searchHighlight(home, away);
    existing[id] = { ...base, videoId: vid?.videoId || null, title: vid?.title || "" };
    if (vid?.videoId) { added++; console.log(`  ✓ ${home} ${base.gh}-${base.ga} ${away} → ${vid.videoId}`); }
    await sleep(300);
  }

  fs.writeFileSync(OUT, JSON.stringify(existing, null, 2));
  console.log(`✅ wc-highlights.json — ${Object.keys(existing).length} matchs, ${added} nouvelles vidéos`);
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(0); });
