/**
 * fetch-fixtures.mjs
 * Stratégie efficace: 1 requête par ligue (next=50 + last=50)
 * puis distribution vers content/fixtures/[team-slug].json
 * Total: ~20 requêtes au lieu de 350 (1 par équipe)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "content/fixtures");
const STANDINGS_DIR = path.join(ROOT, "content/standings");

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";
const SEASON = 2024;

// ── Slug → API-Football team ID ──────────────────────────────────────────────
const TEAM_IDS = {
  // Premier League
  "manchester-city": 50, "manchester-united": 33, "liverpool": 40,
  "arsenal": 42, "chelsea": 49, "tottenham": 47, "aston-villa": 66,
  "brighton": 51, "west-ham": 48, "fulham": 36, "ipswich": 57,
  "crystal-palace": 52, "newcastle": 67, "brentford": 55,
  "leeds-united": 63, "southampton": 41, "wolves": 39,
  "nottingham-forest": 34, "everton": 45, "leicester-city": 46,
  "bournemouth": 35,
  // La Liga
  "real-madrid": 541, "barcelona": 529, "atletico-madrid": 530,
  "sevilla": 536, "valencia": 532, "real-sociedad": 548,
  "villarreal": 533, "celta-vigo": 538, "athletic-bilbao": 534,
  "getafe": 546, "alaves": 542, "espanyol": 543,
  "girona": 547, "granada": 545, "cadiz": 540,
  "osasuna": 544, "mallorca": 539, "las-palmas": 723,
  "real-valladolid": 549, "leganes": 727, "rayo-vallecano": 728,
  "real-betis": 543,
  // Bundesliga
  "bayern-munich": 157, "borussia-dortmund": 165, "bayer-leverkusen": 168,
  "rb-leipzig": 173, "eintracht-frankfurt": 169, "borussia-monchengladbach": 163,
  "vfb-stuttgart": 172, "vfl-wolfsburg": 161, "tsg-hoffenheim": 167,
  "werder-bremen": 162, "sc-freiburg": 175, "augsburg": 174,
  "mainz": 176, "union-berlin": 164, "bochum": 180,
  "fc-koln": 170, "hertha-bsc": 171, "holstein-kiel": 1099,
  "heidenheim": 1093, "st-pauli": 186,
  // Serie A
  "juventus": 496, "ac-milan": 489, "inter-milan": 505,
  "napoli": 492, "as-roma": 497, "lazio": 487,
  "atalanta": 488, "fiorentina": 494, "bologna": 500,
  "udinese": 491, "torino": 498, "empoli": 502,
  "cagliari": 499, "hellas-verona": 503, "lecce": 504,
  "venezia": 501, "parma": 506, "como": 867,
  "genoa": 507, "monza": 495, "salernitana": 514,
  // Ligue 1
  "psg": 85, "olympique-marseille": 81, "monaco": 91,
  "olympique-lyon": 80, "losc-lille": 79, "stade-rennes": 95,
  "nice": 84, "stade-de-reims": 82, "nantes": 93,
  "strasbourg": 78, "lens": 94, "toulouse": 87,
  "montpellier": 111, "brest": 108, "angers": 116,
  "auxerre": 83, "saint-etienne": 96, "metz": 119,
  "stade-brestois": 108, "le-havre": 1139, "reims": 82,
  // Eredivisie
  "ajax": 194, "psv-eindhoven": 197, "feyenoord": 192,
  "az-alkmaar": 198, "fc-utrecht": 195, "fc-groningen": 193,
  "vitesse": 210, "sparta-rotterdam": 206, "rkc-waalwijk": 209,
  "nec-nijmegen": 204, "sc-heerenveen": 201, "pec-zwolle": 207,
  "go-ahead-eagles": 205, "almere-city": 678, "fortuna-sittard": 1388,
  "heracles": 200, "fc-twente": 203, "fc-emmen": 208,
  "heerenveen": 201, "nac-breda": 2318, "groningen": 193, "sc-volendam": 2283,
  // Saudi Pro League
  "al-hilal": 2932, "al-nassr": 2939, "al-ittihad": 2933,
  "al-ahli": 2937, "al-shabab": 2936, "al-ettifaq": 2938,
  "al-qadsiah": 2934, "al-fateh": 2943, "al-taawon": 2940,
  "al-fayha": 7795, "damac": 7796, "al-khaleej": 7797,
  "abha": 7799, "al-riyadh": 7800, "al-hazm": 7801, "al-okhdood": 7802,
  "al-wehda": 7804, "al-orobah": 7803, "al-kholood": 2941, "al-tai": 2942,
  // Botola
  "wydad": 5593, "raja-casablanca": 2575, "far-rabat": 7027,
  "renaissance-berkane": 7028, "moghreb-tetouan": 7029, "hassania-agadir": 7030,
  "difaa-eljadidi": 7031, "olympique-khouribga": 7032, "ittihad-tanger": 7033,
  "mouloudia-oujda": 7034, "fus-rabat": 7035, "maghreb-fez": 7036,
  "chabab-mohammedia": 7037, "rapide-oued-zem": 7038, "youssoufia-berrechid": 7039,
  // Liga Portugal
  "benfica": 211, "porto": 212, "sporting-cp": 228,
  "braga": 217, "vitoria-guimaraes": 232, "casa-pia": 2284,
  "boavista": 222, "rio-ave": 218, "famalicao": 220,
  "moreirense": 231, "estoril": 219, "portimonense": 223,
  "nacional": 229, "arouca": 216, "gil-vicente": 2309, "farense": 245,
  // MLS
  "la-galaxy": 1598, "inter-miami": 1611, "seattle-sounders": 1600,
  "atlanta-united": 1605, "portland-timbers": 1601, "nycfc": 1603,
  "new-england-revolution": 1602, "philadelphia-union": 1608,
  "fc-cincinnati": 1609, "columbus-crew": 1607,
  "austin-fc": 1614, "real-salt-lake": 1612,
};

// ── League ID → slug (for distribution) ───────────────────────────────────────
const LEAGUES = [
  { slug: "premier-league",   id: 39  },
  { slug: "la-liga",          id: 140 },
  { slug: "bundesliga",       id: 78  },
  { slug: "serie-a",          id: 135 },
  { slug: "ligue-1",          id: 61  },
  { slug: "eredivisie",       id: 88  },
  { slug: "saudi-pro-league", id: 307 },
  { slug: "botola",           id: 200 },
  { slug: "liga-portugal",    id: 94  },
  { slug: "mls",              id: 253 },
  { slug: "champions-league", id: 2   },
];

// Reverse map: apiTeamId → slug
const ID_TO_SLUG = Object.fromEntries(
  Object.entries(TEAM_IDS).map(([slug, id]) => [id, slug])
);

// ─────────────────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function apiFetch(endpoint) {
  if (!API_KEY) throw new Error("API_FOOTBALL_KEY missing");
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "x-apisports-key": API_KEY,
      "x-rapidapi-host": "v3.football.api-sports.io"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    const msg = JSON.stringify(json.errors);
    if (msg.includes("rateLimit") || msg.includes("requests")) throw new Error("RATE_LIMIT");
    throw new Error(`API: ${msg}`);
  }
  return json.response || [];
}

function formatFixture(f) {
  return {
    id: f.fixture.id,
    date: f.fixture.date,
    timestamp: f.fixture.timestamp,
    status: f.fixture.status?.short || "NS",
    statusLong: f.fixture.status?.long || "",
    elapsed: f.fixture.status?.elapsed || null,
    venue: f.fixture.venue?.name || "",
    city: f.fixture.venue?.city || "",
    home: {
      id: f.teams.home?.id,
      name: f.teams.home?.name || "",
      logo: f.teams.home?.logo || "",
      winner: f.teams.home?.winner ?? null
    },
    away: {
      id: f.teams.away?.id,
      name: f.teams.away?.name || "",
      logo: f.teams.away?.logo || "",
      winner: f.teams.away?.winner ?? null
    },
    goals: {
      home: f.goals?.home ?? null,
      away: f.goals?.away ?? null
    },
    league: {
      id: f.league?.id,
      name: f.league?.name || "",
      logo: f.league?.logo || "",
      round: f.league?.round || ""
    }
  };
}

// Historical seasons to fetch (for the year filter)
const HISTORICAL_SEASONS = [2023, 2022, 2021];

// Initialise empty fixture buckets for every known team
function initBuckets() {
  const buckets = {};
  for (const [slug, id] of Object.entries(TEAM_IDS)) {
    if (!buckets[slug]) {
      // Load existing file to preserve historical data
      const filePath = path.join(OUTPUT_DIR, `${slug}.json`);
      let existing = { teamId: id, slug, past: [], upcoming: [], seasons: {} };
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        existing = { ...existing, ...raw, teamId: id, slug };
        if (!existing.seasons) existing.seasons = {};
      } catch {}
      buckets[slug] = existing;
    }
  }
  return buckets;
}

async function fetchLeagueFixtures(leagueId, leagueSlug, season = SEASON) {
  const isCurrent = season === SEASON;

  // Upcoming: only for current season
  let upcoming = [];
  if (isCurrent) {
    try {
      const raw = await apiFetch(`/fixtures?league=${leagueId}&season=${season}&next=30`);
      upcoming = raw.map(formatFixture);
      console.log(`  → ${leagueSlug} upcoming: ${upcoming.length}`);
    } catch (e) {
      if (e.message === "RATE_LIMIT") { await sleep(60000); }
      console.warn(`  ✗ upcoming ${leagueSlug}: ${e.message}`);
    }
    await sleep(1200);
  }

  // Past: all finished matches (status=FT) for this season
  let past = [];
  try {
    const raw = await apiFetch(
      isCurrent
        ? `/fixtures?league=${leagueId}&season=${season}&last=60`
        : `/fixtures?league=${leagueId}&season=${season}&status=FT`
    );
    past = raw.map(formatFixture).sort((a, b) => b.timestamp - a.timestamp);
    console.log(`  → ${leagueSlug} season ${season} past: ${past.length}`);
  } catch (e) {
    if (e.message === "RATE_LIMIT") { await sleep(60000); }
    console.warn(`  ✗ past ${leagueSlug} ${season}: ${e.message}`);
  }
  await sleep(1200);

  return { upcoming, past };
}

async function main() {
  if (!API_KEY) {
    console.log("⚠ API_FOOTBALL_KEY not set — skipping fixture fetch.");
    process.exit(0);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(STANDINGS_DIR, { recursive: true });

  // Check quota
  try {
    const status = await apiFetch("/status");
    const req = status[0]?.requests || status?.requests || {};
    console.log(`✅ API connected — requests today: ${req.current || "?"}/${req.limit_day || "?"}`);
  } catch (e) {
    console.warn("Status check failed:", e.message);
  }
  await sleep(1000);

  const buckets = initBuckets();

  // Helper: distribute fixtures into team buckets
  function distribute(fixtures, buckets, season) {
    const isCurrent = season === SEASON;
    for (const fix of fixtures) {
      for (const side of ["home", "away"]) {
        const apiId = fix[side]?.id;
        const slug = ID_TO_SLUG[apiId];
        if (!slug || !buckets[slug]) continue;

        if (isCurrent) {
          const already = buckets[slug].past.some(f => f.id === fix.id);
          if (!already) buckets[slug].past.push(fix);
        } else {
          // Store in historical seasons map
          if (!buckets[slug].seasons) buckets[slug].seasons = {};
          if (!buckets[slug].seasons[season]) buckets[slug].seasons[season] = [];
          const already = buckets[slug].seasons[season].some(f => f.id === fix.id);
          if (!already) buckets[slug].seasons[season].push(fix);
        }
      }
    }
  }

  console.log("\n── Fetching current season fixtures & standings ──");
  for (const league of LEAGUES) {
    console.log(`\n📅 ${league.slug} (${SEASON})`);
    const { upcoming, past } = await fetchLeagueFixtures(league.id, league.slug, SEASON);

    // Distribute upcoming
    for (const fix of upcoming) {
      for (const side of ["home", "away"]) {
        const apiId = fix[side]?.id;
        const slug = ID_TO_SLUG[apiId];
        if (slug && buckets[slug]) {
          buckets[slug].upcoming.push(fix);
        }
      }
    }
    // Distribute past (current season)
    distribute(past, buckets, SEASON);

    // Also fetch standings for this league
    try {
      const rows = await apiFetch(`/standings?league=${league.id}&season=${SEASON}`);
      await sleep(1000);
      if (rows.length && rows[0]?.league?.standings?.[0]) {
        const standingsList = rows[0].league.standings[0];
        const standings = standingsList.map(entry => {
          const apiId = entry.team?.id;
          const teamSlug = ID_TO_SLUG[apiId] || null;
          return {
            rank: entry.rank,
            slug: teamSlug,
            name: entry.team?.name || "",
            logo: entry.team?.logo || "",
            played: entry.all?.played ?? 0,
            won: entry.all?.win ?? 0,
            drawn: entry.all?.draw ?? 0,
            lost: entry.all?.lose ?? 0,
            gf: entry.all?.goals?.for ?? 0,
            ga: entry.all?.goals?.against ?? 0,
            gd: entry.goalsDiff ?? 0,
            points: entry.points ?? 0,
            form: entry.form || null,
            description: entry.description || null
          };
        });
        fs.writeFileSync(
          path.join(STANDINGS_DIR, `${league.slug}.json`),
          JSON.stringify({ standings, slug: league.slug, leagueId: league.id, season: SEASON, fetchedAt: new Date().toISOString() }, null, 2)
        );
        console.log(`  ✓ standings saved: ${standings.length} teams`);
      }
    } catch (e) {
      console.warn(`  ✗ standings ${league.slug}: ${e.message}`);
    }
    await sleep(1000);
  }

  // ── Fetch historical seasons ───────────────────────────────────────────────
  // Only fetch if we have enough quota left (historical = nice-to-have)
  console.log("\n── Fetching historical seasons ──");
  for (const season of HISTORICAL_SEASONS) {
    for (const league of LEAGUES) {
      // Skip if we already have data for this season in most teams
      const sampleSlug = Object.keys(buckets).find(s =>
        buckets[s].seasons?.[season]?.length > 0
      );
      if (sampleSlug) {
        console.log(`  ✓ ${league.slug} ${season} — already cached`);
        continue;
      }

      console.log(`  📅 ${league.slug} ${season}...`);
      try {
        const { past } = await fetchLeagueFixtures(league.id, league.slug, season);
        distribute(past, buckets, season);
      } catch (e) {
        console.warn(`  ✗ ${league.slug} ${season}: ${e.message}`);
      }
    }
  }

  // Write all per-team fixture files
  console.log("\n── Writing per-team fixture files ──");
  let written = 0;
  for (const [slug, data] of Object.entries(buckets)) {
    // Sort current season: past desc, upcoming asc
    data.past.sort((a, b) => b.timestamp - a.timestamp);
    data.upcoming.sort((a, b) => a.timestamp - b.timestamp);
    // Sort historical seasons
    if (data.seasons) {
      for (const y of Object.keys(data.seasons)) {
        data.seasons[y].sort((a, b) => b.timestamp - a.timestamp);
      }
    }
    data.fetchedAt = new Date().toISOString();
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${slug}.json`),
      JSON.stringify(data, null, 2)
    );
    written++;
  }
  console.log(`✅ Written ${written} fixture files`);
}

main().catch(e => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
