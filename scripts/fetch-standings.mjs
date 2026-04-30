/**
 * fetch-standings.mjs
 * Fetches current league standings from API-Football
 * and writes them to content/standings/[league].json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const STANDINGS_DIR = path.join(ROOT, "content/standings");
const TEAMS_DATA_PATH = path.join(ROOT, "content/teams-data.json");

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

// API-Football league IDs + current season
const LEAGUES = [
  { slug: "premier-league",   id: 39,  season: 2024 },
  { slug: "la-liga",          id: 140, season: 2024 },
  { slug: "bundesliga",       id: 78,  season: 2024 },
  { slug: "serie-a",          id: 135, season: 2024 },
  { slug: "ligue-1",          id: 61,  season: 2024 },
  { slug: "eredivisie",       id: 88,  season: 2024 },
  { slug: "saudi-pro-league", id: 307, season: 2024 },
  { slug: "botola",           id: 200, season: 2024 },
  { slug: "liga-portugal",    id: 94,  season: 2024 },
  { slug: "mls",              id: 253, season: 2024 },
];

// Map API-Football team IDs → our slug (built from teams-data.json + known IDs)
const TEAM_ID_TO_SLUG = {
  // Premier League
  50: "manchester-city", 33: "manchester-united", 40: "liverpool",
  42: "arsenal", 49: "chelsea", 47: "tottenham", 66: "aston-villa",
  51: "brighton", 48: "west-ham", 36: "fulham", 57: "ipswich",
  52: "crystal-palace", 67: "newcastle", 55: "brentford",
  63: "leeds-united", 41: "southampton", 39: "wolves",
  34: "nottingham-forest", 45: "everton", 46: "leicester-city",
  35: "bournemouth",
  // La Liga
  541: "real-madrid", 529: "barcelona", 530: "atletico-madrid",
  536: "sevilla", 532: "valencia", 548: "real-sociedad",
  533: "villarreal", 538: "celta-vigo", 534: "athletic-bilbao",
  546: "getafe", 542: "alaves", 543: "espanyol",
  531: "athletic-bilbao", 547: "girona", 545: "granada",
  540: "cadiz", 544: "osasuna", 539: "mallorca",
  723: "las-palmas", 549: "real-valladolid", 727: "leganes",
  // Bundesliga
  157: "bayern-munich", 165: "borussia-dortmund", 168: "bayer-leverkusen",
  173: "rb-leipzig", 169: "eintracht-frankfurt", 163: "borussia-monchengladbach",
  172: "vfb-stuttgart", 161: "vfl-wolfsburg", 167: "tsg-hoffenheim",
  162: "werder-bremen", 175: "sc-freiburg", 174: "augsburg",
  176: "mainz", 164: "union-berlin", 180: "bochum",
  170: "fc-koln", 171: "hertha-bsc", 1099: "holstein-kiel",
  // Serie A
  496: "juventus", 489: "ac-milan", 505: "inter-milan",
  492: "napoli", 497: "as-roma", 487: "lazio",
  488: "atalanta", 494: "fiorentina", 500: "bologna",
  491: "udinese", 498: "torino", 502: "empoli",
  499: "cagliari", 503: "hellas-verona", 504: "lecce",
  501: "venezia", 506: "parma", 867: "como",
  507: "genoa", 495: "monza",
  // Ligue 1
  85: "psg", 81: "olympique-marseille", 91: "monaco",
  80: "olympique-lyon", 79: "losc-lille", 95: "stade-rennes",
  84: "nice", 82: "stade-de-reims", 93: "nantes",
  78: "strasbourg", 94: "lens", 87: "toulouse",
  111: "montpellier", 108: "brest", 119: "angers",
  116: "auxerre", 83: "saint-etienne", 96: "metz",
  // Eredivisie
  194: "ajax", 197: "psv-eindhoven", 192: "feyenoord",
  198: "az-alkmaar", 195: "fc-utrecht", 193: "fc-groningen",
  210: "vitesse", 206: "sparta-rotterdam", 209: "rkc-waalwijk",
  204: "nec-nijmegen", 201: "sc-heerenveen", 207: "pec-zwolle",
  205: "go-ahead-eagles", 678: "almere-city", 1388: "fortuna-sittard",
  200: "heracles", 203: "fc-twente", 208: "fc-emmen",
  // Saudi Pro League
  2932: "al-hilal", 2939: "al-nassr", 2933: "al-ittihad",
  2937: "al-ahli", 2936: "al-shabab", 2938: "al-ettifaq",
  2934: "al-qadsiah", 2943: "al-fateh", 2940: "al-taawon",
  7795: "al-fayha", 7796: "damac", 7797: "al-khaleej",
  7799: "abha", 7800: "al-riyadh", 7801: "al-hazm", 7802: "al-okhdood",
  7803: "al-wehda", 7804: "al-orobah",
  // Botola
  5593: "wydad", 2575: "raja-casablanca", 7027: "far-rabat",
  7028: "renaissance-berkane", 7029: "moghreb-tetouan", 7030: "hassania-agadir",
  7031: "difaa-eljadidi", 7032: "olympique-khouribga", 7033: "ittihad-tanger",
  7034: "mouloudia-oujda", 7035: "fus-rabat", 7036: "maghreb-fez",
  7037: "chabab-mohammedia", 7038: "rapide-oued-zem", 7039: "youssoufia-berrechid",
  // Liga Portugal
  211: "benfica", 212: "porto", 228: "sporting-cp",
  217: "braga", 232: "vitoria-guimaraes", 2284: "casa-pia",
  222: "boavista", 218: "rio-ave", 220: "famalicao",
  231: "moreirense", 219: "estoril", 223: "portimonense",
  229: "nacional", 216: "arouca", 2309: "gil-vicente", 245: "farense",
  // MLS
  1598: "la-galaxy", 1611: "inter-miami", 1600: "seattle-sounders",
  1605: "atlanta-united", 1601: "portland-timbers", 1603: "nycfc",
  1602: "new-england-revolution", 1608: "philadelphia-union",
  1609: "fc-cincinnati", 1607: "columbus-crew",
  1614: "austin-fc", 1612: "real-salt-lake",
};

async function apiFetch(endpoint) {
  if (!API_KEY) throw new Error("API_FOOTBALL_KEY missing — set env var");
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "x-apisports-key": API_KEY,
      "x-rapidapi-host": "v3.football.api-sports.io"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${endpoint}`);
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    const msg = JSON.stringify(json.errors);
    if (msg.includes("rateLimit") || msg.includes("requests")) throw new Error("RATE_LIMIT");
    throw new Error(`API errors: ${msg}`);
  }
  return json.response || [];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Load teams-data to get logos
const teamsData = JSON.parse(fs.readFileSync(TEAMS_DATA_PATH, "utf-8"));

async function fetchLeagueStandings(league) {
  const { slug, id, season } = league;
  console.log(`\n📊 Fetching standings: ${slug} (league ${id}, season ${season})`);

  let rows;
  try {
    rows = await apiFetch(`/standings?league=${id}&season=${season}`);
  } catch (err) {
    if (err.message === "RATE_LIMIT") {
      console.warn("  ⏳ Rate limit hit, waiting 60s...");
      await sleep(60000);
      rows = await apiFetch(`/standings?league=${id}&season=${season}`);
    } else {
      console.error(`  ✗ Failed: ${err.message}`);
      return null;
    }
  }

  if (!rows || rows.length === 0) {
    console.warn(`  ⚠ No standings returned for ${slug}`);
    return null;
  }

  // API returns [ { league: { standings: [[...]] } } ]
  const leagueData = rows[0]?.league;
  if (!leagueData?.standings || !leagueData.standings[0]) {
    console.warn(`  ⚠ Unexpected structure for ${slug}`);
    return null;
  }

  const standingsList = leagueData.standings[0];

  const standings = standingsList.map((entry) => {
    const apiTeamId = entry.team.id;
    const teamSlug = TEAM_ID_TO_SLUG[apiTeamId] || null;
    const teamFromData = teamSlug ? teamsData[teamSlug] : null;

    return {
      rank: entry.rank,
      slug: teamSlug,
      name: teamFromData?.name || entry.team.name,
      logo: teamFromData?.logo || entry.team.logo,
      played: entry.all?.played ?? 0,
      won: entry.all?.win ?? 0,
      drawn: entry.all?.draw ?? 0,
      lost: entry.all?.lose ?? 0,
      gf: entry.all?.goals?.for ?? 0,
      ga: entry.all?.goals?.against ?? 0,
      gd: entry.goalsDiff ?? 0,
      points: entry.points ?? 0,
      form: entry.form || null,
      description: entry.description || null,
    };
  });

  const output = {
    standings,
    slug,
    leagueId: id,
    season,
    fetchedAt: new Date().toISOString(),
  };

  const outPath = path.join(STANDINGS_DIR, `${slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`  ✓ Saved ${standings.length} teams → content/standings/${slug}.json`);
  return standings.length;
}

async function main() {
  if (!API_KEY) {
    console.error("❌ API_FOOTBALL_KEY env var is not set. Aborting.");
    process.exit(1);
  }

  fs.mkdirSync(STANDINGS_DIR, { recursive: true });

  let ok = 0, fail = 0;
  for (const league of LEAGUES) {
    const result = await fetchLeagueStandings(league);
    if (result !== null) {
      ok++;
    } else {
      fail++;
    }
    // Respect rate limit: ~30 requests/min on free tier → 2s between calls
    await sleep(2500);
  }

  console.log(`\n✅ Done: ${ok} leagues updated, ${fail} failed`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
