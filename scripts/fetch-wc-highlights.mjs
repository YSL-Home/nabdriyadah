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
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
const YT_SEARCH = "https://www.googleapis.com/youtube/v3/search";

const FINISHED = ["FT", "AET", "PEN"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadExisting() {
  try { return JSON.parse(fs.readFileSync(OUT, "utf-8")); } catch { return {}; }
}

const WC_LEAGUE_ID = 1;

// Le plan gratuit ne répond pas à league=1&season=2026, mais répond à fixtures?date=.
// On interroge depuis le début du tournoi (11 juin) jusqu'à aujourd'hui + 1.
// Idempotent : seuls les matchs sans videoId déjà en cache sont retraités.
async function fetchFinishedMatches(existing) {
  const today = new Date();
  // Trouver la date la plus récente déjà dans le JSON (pour ne pas refetch depuis le début si déjà à jour)
  const lastKnown = Object.values(existing).reduce((max, m) => {
    const d = (m.date || "").slice(0, 10);
    return d > max ? d : max;
  }, "2026-06-10");

  // Fetch depuis (lastKnown - 2 jours) jusqu'à aujourd'hui + 1 (pour les matchs du lendemain)
  const startDate = new Date(lastKnown);
  startDate.setUTCDate(startDate.getUTCDate() - 2);
  const endDate = new Date(today);
  endDate.setUTCDate(endDate.getUTCDate() + 1);

  const dates = [];
  for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  console.log(`  📅 Fetch ${dates[0]} → ${dates[dates.length - 1]} (${dates.length} jours)`);

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
  if (!GOOGLE_API_KEY) return null;
  // Requête arabe ciblée chaînes de résumés (beIN, FIFA, officiels)
  const q = `أهداف وملخص ${home} ضد ${away} كأس العالم 2026`;
  const params = new URLSearchParams({
    key: GOOGLE_API_KEY, part: "snippet", q, type: "video",
    videoEmbeddable: "true", maxResults: "1", relevanceLanguage: "ar", order: "relevance",
  });
  try {
    const res = await fetch(`${YT_SEARCH}?${params}`);
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;
    return { videoId: item.id.videoId, title: item.snippet?.title || "" };
  } catch (e) {
    console.warn("  ✗ YouTube:", e.message);
    return null;
  }
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
