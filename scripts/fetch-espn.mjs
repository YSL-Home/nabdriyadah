/**
 * fetch-espn.mjs — ESPN API (100% gratuite, sans clé API)
 * Récupère classements + matchs pour toutes les ligues
 * et écrit dans content/standings/ et content/fixtures/
 *
 * Fixes v2:
 *  - Scoreboard date-range URL was broken (404). Now uses the site/v2 API
 *    with individual date queries (±30 days) which actually work.
 *  - Accumulates fixtures across CI runs (merge, never overwrite).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT          = path.join(__dirname, "..");
const STANDINGS_DIR = path.join(ROOT, "content/standings");
const FIXTURES_DIR  = path.join(ROOT, "content/fixtures");
const TEAMS_PATH    = path.join(ROOT, "content/teams-data.json");

// ESPN league IDs — used for BOTH standings and scoreboard
const ESPN_LEAGUES = [
  { slug: "premier-league",   espnId: "eng.1"         },
  { slug: "la-liga",          espnId: "esp.1"          },
  { slug: "bundesliga",       espnId: "ger.1"          },
  { slug: "serie-a",          espnId: "ita.1"          },
  { slug: "ligue-1",          espnId: "fra.1"          },
  { slug: "eredivisie",       espnId: "ned.1"          },
  { slug: "saudi-pro-league", espnId: "ksa.1"          },
  { slug: "mls",              espnId: "usa.1"          },
  { slug: "liga-portugal",    espnId: "por.1"          },
  { slug: "champions-league", espnId: "uefa.champions" },
  { slug: "futsal-monde",    espnId: "fifa.futsal"     },
];

// ── Basketball leagues ─────────────────────────────────────────────────────────
const ESPN_BASKETBALL_LEAGUES = [
  { slug: "nba", espnId: "nba" },
];

// ── Tennis tours ───────────────────────────────────────────────────────────────
const ESPN_TENNIS_TOURS = [
  { slug: "atp", espnId: "atp" },
  { slug: "wta", espnId: "wta" },
];

// ── F1 series ──────────────────────────────────────────────────────────────────
const ESPN_F1_SERIES = [
  { slug: "f1", espnId: "f1" },
];

// ── Golf tours ─────────────────────────────────────────────────────────────────
const ESPN_GOLF_TOURS = [
  { slug: "pga-tour", espnId: "pga" },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function espnGet(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; NabdBot/1.0)" }
  });
  if (!res.ok) throw new Error(`ESPN ${res.status} — ${url}`);
  return res.json();
}

/** YYYYMMDD for a Date object */
function yyyymmdd(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
}

// ── Team slug resolution ───────────────────────────────────────────────────────

const teamsData = JSON.parse(fs.readFileSync(TEAMS_PATH, "utf-8"));

// direct slug set
const ourSlugs = new Set(Object.keys(teamsData));

// ESPN slug (or normalized display name) → our slug
// Keys can be EITHER the ESPN team.slug value OR a normalized display name
// (needed because site/v2 scoreboard returns no team.slug, only displayName)
const ESPN_SLUG_MAP = {
  // ── Premier League ────────────────────────────────────────────────────────
  "tottenham-hotspur":          "tottenham",
  "wolverhampton-wanderers":    "wolves",
  "wolverhampton":              "wolves",
  "nottingham-forest":          "nottingham-forest",
  "west-ham-united":            "west-ham",
  "west-ham":                   "west-ham",
  "newcastle-united":           "newcastle",
  "newcastle":                  "newcastle",
  "manchester-city":            "manchester-city",
  "manchester-united":          "manchester-united",
  "aston-villa":                "aston-villa",
  "crystal-palace":             "crystal-palace",
  "leicester-city":             "leicester",
  "leicester":                  "leicester",
  "brighton-hove-albion":       "brighton",
  "brighton":                   "brighton",
  "ipswich-town":               "ipswich",
  "ipswich":                    "ipswich",
  // ── La Liga ──────────────────────────────────────────────────────────────
  "atletico-de-madrid":         "atletico-madrid",
  "atletico-madrid":            "atletico-madrid",
  "athletic-club":              "athletic-bilbao",
  "athletic-bilbao":            "athletic-bilbao",
  "real-sociedad":              "real-sociedad",
  "rcd-espanyol":               "espanyol",
  "espanyol":                   "espanyol",
  "deportivo-alaves":           "alaves",
  "alaves":                     "alaves",
  "real-valladolid":            "valladolid",
  "valladolid":                 "valladolid",
  "cd-leganes":                 "leganes",
  "leganes":                    "leganes",
  "rayo-vallecano":             "rayo-vallecano",
  "las-palmas":                 "las-palmas",
  // ── Bundesliga ───────────────────────────────────────────────────────────
  "borussia-dortmund":          "borussia-dortmund",
  "bayer-leverkusen":           "bayer-leverkusen",
  "rb-leipzig":                 "rb-leipzig",
  "tsg-1899-hoffenheim":        "hoffenheim",
  "tsg-hoffenheim":             "hoffenheim",
  "vfl-wolfsburg":              "wolfsburg",
  "wolfsburg":                  "wolfsburg",
  "vfb-stuttgart":              "vfb-stuttgart",
  "sc-freiburg":                "freiburg",
  "freiburg":                   "freiburg",
  "1-fsv-mainz-05":             "mainz",
  "mainz-05":                   "mainz",
  "1-fc-union-berlin":          "union-berlin",
  "union-berlin":               "union-berlin",
  "fc-augsburg":                "augsburg",
  "augsburg":                   "augsburg",
  "sv-werder-bremen":           "werder-bremen",
  "werder-bremen":              "werder-bremen",
  "vfl-bochum-1848":            "bochum",
  "bochum":                     "bochum",
  "holstein-kiel":              "holstein-kiel",
  "fc-st-pauli":                "st-pauli",
  "1-fc-heidenheim-1846":       "heidenheim",
  "1-fc-heidenheim-1846":       "heidenheim",
  "eintracht-frankfurt":        "eintracht-frankfurt",
  "fc-cologne":                 "fc-koln",        // if in our data
  "borussia-monchengladbach":   "borussia-monchengladbach",
  "hamburg-sv":                 "hamburger-sv",   // if in our data
  // ── Serie A ───────────────────────────────────────────────────────────────
  "as-roma":                    "as-roma",
  "ac-milan":                   "ac-milan",
  "inter-milan":                "inter-milan",
  "hellas-verona":              "hellas-verona",
  "inter":                      "inter-milan",
  "milan":                      "ac-milan",
  "roma":                       "as-roma",
  "lazio":                      "lazio",
  "atalanta":                   "atalanta",
  "fiorentina":                 "fiorentina",
  "torino":                     "torino",
  "bologna":                    "bologna",
  "udinese":                    "udinese",
  "empoli":                     "empoli",
  "genoa":                      "genoa",
  "cagliari":                   "cagliari",
  "lecce":                      "lecce",
  "venezia":                    "venezia",
  "como":                       "como",
  "parma":                      "parma",
  "monza":                      "monza",
  // ── Ligue 1 ───────────────────────────────────────────────────────────────
  "paris-saint-germain":        "psg",
  "olympique-de-marseille":     "olympique-marseille",
  "marseille":                  "olympique-marseille",
  "olympique-lyonnais":         "olympique-lyon",
  "lyon":                       "olympique-lyon",
  "losc-lille":                 "losc-lille",
  "lille":                      "losc-lille",
  "stade-rennais-fc":           "stade-rennes",
  "stade-rennais":              "stade-rennes",
  "rennes":                     "stade-rennes",
  "as-saint-etienne":           "saint-etienne",
  "saint-etienne":              "saint-etienne",
  "stade-de-reims":             "reims",
  "reims":                      "reims",
  "rc-strasbourg-alsace":       "strasbourg",
  "strasbourg":                 "strasbourg",
  "stade-brestois-29":          "stade-brestois",
  "brest":                      "stade-brestois",
  "as-monaco":                  "monaco",
  "monaco":                     "monaco",
  "ogc-nice":                   "nice",
  "nice":                       "nice",
  "rc-lens":                    "lens",
  "lens":                       "lens",
  "fc-nantes":                  "nantes",
  "nantes":                     "nantes",
  "toulouse-fc":                "toulouse",
  "toulouse":                   "toulouse",
  "montpellier-hsc":            "montpellier",
  "montpellier":                "montpellier",
  "aj-auxerre":                 "auxerre",
  "auxerre":                    "auxerre",
  "angers-sco":                 "angers",
  "angers":                     "angers",
  "le-havre-ac":                "le-havre",
  "le-havre":                   "le-havre",
  "lorient":                    "lorient",
  "metz":                       "metz",
  // ── Saudi Pro League ──────────────────────────────────────────────────────
  "al-hilal-saudi":             "al-hilal",
  "al-hilal":                   "al-hilal",
  "al-nassr-fc":                "al-nassr",
  "al-nassr":                   "al-nassr",
  "al-ittihad-club":            "al-ittihad",
  "al-ittihad":                 "al-ittihad",
  "al-ahli-saudi":              "al-ahli",
  "al-ahli":                    "al-ahli",
  "al-shabab":                  "al-shabab",
  "al-qadsiah":                 "al-qadsiah",
  "al-fateh":                   "al-fateh",
  "al-taawon":                  "al-taawon",
  "al-wehda":                   "al-wehda",
  "al-fayha":                   "al-fayha",
  "al-okhdood":                 "al-okhdood",
  "al-riyadh":                  "al-riyadh",
  "al-hazem":                   "al-hazm",
  "al-kholood":                 "al-kholood",
  "al-tai":                     "al-tai",
  "damac":                      "damac",
  "abha":                       "abha",
  "al-ettifaq":                 "al-ettifaq",
  // ── Eredivisie ────────────────────────────────────────────────────────────
  "ajax":                       "ajax",
  "psv-eindhoven":              "psv-eindhoven",
  "psv":                        "psv-eindhoven",
  "feyenoord":                  "feyenoord",
  "az-alkmaar":                 "az-alkmaar",
  "az":                         "az-alkmaar",
  "fc-twente":                  "fc-twente",
  "twente":                     "fc-twente",
  "fc-utrecht":                 "fc-utrecht",
  "utrecht":                    "fc-utrecht",
  "sc-heerenveen":              "heerenveen",
  "heerenveen":                 "heerenveen",
  "sparta-rotterdam":           "sparta-rotterdam",
  "nec-nijmegen":               "nec-nijmegen",
  "nec":                        "nec-nijmegen",
  "rkc-waalwijk":               "rkc-waalwijk",
  "fortuna-sittard":            "fortuna-sittard",
  "heracles-almelo":            "heracles",
  "heracles":                   "heracles",
  "almere-city-fc":             "almere-city",
  "almere-city":                "almere-city",
  "pec-zwolle":                 "pec-zwolle",
  "nac-breda":                  "nac-breda",
  "go-ahead-eagles":            "go-ahead-eagles",
  "fc-groningen":               "groningen",
  "groningen":                  "groningen",
  "sc-volendam":                "sc-volendam",
  // ── MLS ───────────────────────────────────────────────────────────────────
  "la-galaxy":                  "la-galaxy",
  "la-galaxy-ii":               "la-galaxy",
  "inter-miami-cf":             "inter-miami",
  "inter-miami":                "inter-miami",
  "seattle-sounders-fc":        "seattle-sounders",
  "seattle-sounders":           "seattle-sounders",
  "seattle-sounders-fc":        "seattle-sounders",
  "atlanta-united-fc":          "atlanta-united",
  "atlanta-united":             "atlanta-united",
  "portland-timbers":           "portland-timbers",
  "new-york-city-fc":           "nycfc",
  "nycfc":                      "nycfc",
  "new-england-revolution":     "new-england-revolution",
  "philadelphia-union":         "philadelphia-union",
  "fc-cincinnati":              "fc-cincinnati",
  "columbus-crew":              "columbus-crew",
  "austin-fc":                  "austin-fc",
  "real-salt-lake":             "real-salt-lake",
  // ── Liga Portugal ─────────────────────────────────────────────────────────
  "sl-benfica":                 "benfica",
  "benfica":                    "benfica",
  "fc-porto":                   "porto",
  "porto":                      "porto",
  "sporting-cp":                "sporting-cp",
  "sporting":                   "sporting-cp",
  "sc-braga":                   "braga",
  "braga":                      "braga",
  "vitoria-sc":                 "vitoria-guimaraes",
  "vitoria-guimaraes":          "vitoria-guimaraes",
  "casa-pia-ac":                "casa-pia",
  "casa-pia":                   "casa-pia",
  "boavista-fc":                "boavista",
  "boavista":                   "boavista",
  "rio-ave-fc":                 "rio-ave",
  "rio-ave":                    "rio-ave",
  "fc-famalicao":               "famalicao",
  "famalicao":                  "famalicao",
  "moreirense-fc":              "moreirense",
  "moreirense":                 "moreirense",
  "estoril-praia":              "estoril",
  "estoril":                    "estoril",
  "portimonense-sc":            "portimonense",
  "portimonense":               "portimonense",
  "cd-nacional":                "nacional",
  "nacional":                   "nacional",
  "fc-arouca":                  "arouca",
  "arouca":                     "arouca",
  "gil-vicente-fc":             "gil-vicente",
  "gil-vicente":                "gil-vicente",
  "sc-farense":                 "farense",
  "farense":                    "farense",
};

function resolveSlug(espnSlug = "", displayName = "") {
  // 1. Try ESPN team.slug directly
  const s = (espnSlug || "").toLowerCase().trim();
  if (s && ESPN_SLUG_MAP[s]) return ESPN_SLUG_MAP[s];
  if (s && ourSlugs.has(s)) return s;

  // 2. Normalize display name and try (handles site/v2 which has no team.slug)
  const norm = (displayName || "").toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-");
  if (norm && ESPN_SLUG_MAP[norm]) return ESPN_SLUG_MAP[norm];
  if (norm && ourSlugs.has(norm)) return norm;

  return null; // unknown team — skipped
}

// ── Standings ─────────────────────────────────────────────────────────────────

async function fetchStandings(league) {
  const url = `https://site.api.espn.com/apis/v2/sports/soccer/${league.espnId}/standings`;
  const data = await espnGet(url);

  let entries = data.standings?.entries || data.children?.[0]?.standings?.entries || [];
  if (!entries.length && data.children) {
    for (const child of data.children) {
      entries = child.standings?.entries || [];
      if (entries.length) break;
    }
  }

  if (!entries.length) {
    console.warn(`  ⚠ No standings entries for ${league.slug}`);
    return;
  }

  const standings = entries.map((entry, idx) => {
    const team  = entry.team || {};
    const stats = {};
    for (const s of (entry.stats || [])) stats[s.name] = s.value ?? 0;

    const slug       = resolveSlug(team.slug, team.displayName || team.name || "");
    const teamFromDB = slug ? teamsData[slug] : null;

    return {
      rank:   Math.round(stats.rank ?? stats.rankorder ?? (idx + 1)),
      slug,
      name:   teamFromDB?.name || team.displayName || team.name || "",
      logo:   teamFromDB?.logo || team.logos?.[0]?.href || "",
      played: Math.round(stats.gamesPlayed ?? 0),
      won:    Math.round(stats.wins   ?? 0),
      drawn:  Math.round(stats.ties   ?? 0),
      lost:   Math.round(stats.losses ?? 0),
      gf:     Math.round(stats.pointsFor     ?? stats.goalsFor     ?? 0),
      ga:     Math.round(stats.pointsAgainst ?? stats.goalsAgainst ?? 0),
      gd:     Math.round(stats.differential  ?? 0),
      points: Math.round(stats.points ?? 0),
    };
  }).filter(e => e.name);

  standings.sort((a, b) => a.rank - b.rank);

  fs.writeFileSync(
    path.join(STANDINGS_DIR, `${league.slug}.json`),
    JSON.stringify({ standings, slug: league.slug, fetchedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`  ✓ Standings ${league.slug}: ${standings.length} teams`);
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

function parseEvent(event, leagueName) {
  const comp = event.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors?.find(c => c.homeAway === "home");
  const away = comp.competitors?.find(c => c.homeAway === "away");
  if (!home || !away) return null;

  const statusObj = comp.status?.type;
  const completed = statusObj?.completed === true;
  const state     = statusObj?.state || "pre";

  const homeSlug = resolveSlug(home.team?.slug, home.team?.displayName || "");
  const awaySlug = resolveSlug(away.team?.slug, away.team?.displayName || "");
  const homeTeam = homeSlug ? teamsData[homeSlug] : null;
  const awayTeam = awaySlug ? teamsData[awaySlug] : null;

  const dateStr  = event.date || "";
  const ts       = Math.round(new Date(dateStr).getTime() / 1000);
  const homeGoals = completed ? (parseInt(home.score, 10) || 0) : null;
  const awayGoals = completed ? (parseInt(away.score, 10) || 0) : null;

  return {
    id:        event.id,
    date:      dateStr,
    timestamp: ts,
    status:    completed ? "FT" : state === "in" ? "LIVE" : "NS",
    statusLong: statusObj?.description || "",
    venue:     comp.venue?.fullName || "",
    city:      comp.venue?.address?.city || "",
    home: {
      id:     home.team?.id,
      slug:   homeSlug,
      name:   homeTeam?.name || home.team?.displayName || "",
      logo:   homeTeam?.logo || home.team?.logos?.[0]?.href || "",
      winner: completed ? homeGoals > awayGoals : null,
    },
    away: {
      id:     away.team?.id,
      slug:   awaySlug,
      name:   awayTeam?.name || away.team?.displayName || "",
      logo:   awayTeam?.logo || away.team?.logos?.[0]?.href || "",
      winner: completed ? awayGoals > homeGoals : null,
    },
    goals: { home: homeGoals, away: awayGoals },
    league: { name: leagueName, round: comp.notes?.[0]?.headline || "" },
    completed,
  };
}

/**
 * Fetch fixtures for a single league.
 *
 * ESPN's site/v2 scoreboard accepts:
 *   ?dates=YYYYMMDD          → matches on that specific day
 *   (no dates param)         → current/upcoming matches for the competition
 *
 * We query the undated endpoint + individual days for ±30 days.
 * Events are deduplicated by ID and merged into existing fixture files.
 */
async function fetchFixtures(league) {
  const now    = new Date();
  const allEvt = new Map(); // event.id → parsed
  let   leagueName = league.slug;

  // ① Undated scoreboard — returns current round's matches
  const baseUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.espnId}/scoreboard`;
  try {
    const data = await espnGet(`${baseUrl}?limit=100`);
    leagueName = data.leagues?.[0]?.name || leagueName;
    for (const ev of data.events || []) {
      const p = parseEvent(ev, leagueName);
      if (p) allEvt.set(p.id, p);
    }
    console.log(`  ↳ Undated scoreboard: ${data.events?.length ?? 0} events`);
  } catch (e) {
    console.warn(`  ⚠ Undated scoreboard failed: ${e.message}`);
  }

  // ② Individual date queries ±30 days
  //    Only about 1/7 of days have matches (weekends + midweeks),
  //    so most requests will be fast (empty 200 responses).
  const days = [];
  for (let i = -30; i <= 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push(yyyymmdd(d));
  }

  let dateHits = 0;
  for (const dateStr of days) {
    await sleep(120); // ~120 ms between requests
    try {
      const data = await espnGet(`${baseUrl}?dates=${dateStr}&limit=100`);
      const lName = data.leagues?.[0]?.name || leagueName;
      const evts  = data.events || [];
      for (const ev of evts) {
        const p = parseEvent(ev, lName);
        if (p && !allEvt.has(p.id)) { allEvt.set(p.id, p); }
      }
      if (evts.length > 0) dateHits++;
    } catch {
      // Silently skip 404 / empty responses for dates with no matches
    }
  }
  console.log(`  ↳ Date queries: ${dateHits}/${days.length} days returned data, total events: ${allEvt.size}`);

  // ③ Distribute events into per-team fixture files
  const buckets = {}; // slug → { upcoming[], past[] }

  for (const fix of allEvt.values()) {
    for (const side of ["home", "away"]) {
      const slug = fix[side]?.slug;
      if (!slug || !teamsData[slug]) continue;

      if (!buckets[slug]) {
        // Load existing file to ACCUMULATE historical data
        const fp = path.join(FIXTURES_DIR, `${slug}.json`);
        try {
          const existing = JSON.parse(fs.readFileSync(fp, "utf-8"));
          // Index existing events by ID for fast dedup
          buckets[slug] = {
            slug,
            teamId: existing.teamId || 0,
            byId: new Map([
              ...(existing.past     || []).map(f => [f.id, f]),
              ...(existing.upcoming || []).map(f => [f.id, f]),
            ]),
          };
        } catch {
          buckets[slug] = { slug, teamId: 0, byId: new Map() };
        }
      }

      // Overwrite/add: fresh data wins
      buckets[slug].byId.set(fix.id, fix);
    }
  }

  // ④ Write files
  const nowISO = new Date().toISOString();
  const nowTs  = Date.now() / 1000;

  for (const [slug, bucket] of Object.entries(buckets)) {
    const all      = [...bucket.byId.values()];
    const upcoming = all.filter(f => !f.completed && f.timestamp > nowTs - 3600)
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .slice(0, 20);
    const past     = all.filter(f => f.completed)
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .slice(0, 20);

    fs.writeFileSync(
      path.join(FIXTURES_DIR, `${slug}.json`),
      JSON.stringify({ slug, teamId: bucket.teamId, upcoming, past, fetchedAt: nowISO }, null, 2)
    );
  }

  console.log(`  ✓ Fixtures ${league.slug}: updated ${Object.keys(buckets).length} team files`);
  return Object.keys(buckets).length;
}

// ── Basketball Standings ──────────────────────────────────────────────────────

async function fetchBasketballStandings(league) {
  const url = `https://site.api.espn.com/apis/v2/sports/basketball/${league.espnId}/standings`;
  const data = await espnGet(url);

  let entries = data.standings?.entries || data.children?.[0]?.standings?.entries || [];
  if (!entries.length && data.children) {
    for (const child of data.children) {
      const childEntries = child.standings?.entries || [];
      if (childEntries.length) { entries = [...entries, ...childEntries]; }
    }
  }

  if (!entries.length) {
    console.warn(`  ⚠ No standings entries for ${league.slug}`);
    return;
  }

  const standings = entries.map((entry, idx) => {
    const team  = entry.team || {};
    const stats = {};
    for (const s of (entry.stats || [])) stats[s.name] = s.value ?? 0;

    const teamSlug = team.slug || "";
    const logo     = team.logos?.[0]?.href || "";
    const name     = team.displayName || team.name || "";

    return {
      rank:   Math.round(stats.rank ?? stats.rankorder ?? (idx + 1)),
      slug:   teamSlug,
      name,
      logo,
      played: Math.round(stats.gamesPlayed ?? 0),
      won:    Math.round(stats.wins   ?? 0),
      lost:   Math.round(stats.losses ?? 0),
      pct:    parseFloat((stats.winPercent ?? 0).toFixed(3)),
    };
  }).filter(e => e.name);

  standings.sort((a, b) => a.rank - b.rank);

  fs.writeFileSync(
    path.join(STANDINGS_DIR, `${league.slug}.json`),
    JSON.stringify({ standings, slug: league.slug, type: "basketball", fetchedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`  ✓ Basketball standings ${league.slug}: ${standings.length} teams`);
}

// ── Basketball Fixtures ───────────────────────────────────────────────────────

async function fetchBasketballFixtures(league) {
  const now    = new Date();
  const allEvt = new Map();
  let   leagueName = league.slug;

  const baseUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/${league.espnId}/scoreboard`;
  try {
    const data = await espnGet(`${baseUrl}?limit=100`);
    leagueName = data.leagues?.[0]?.name || leagueName;
    for (const ev of data.events || []) {
      const p = parseEvent(ev, leagueName);
      if (p) allEvt.set(p.id, p);
    }
    console.log(`  ↳ Undated scoreboard: ${data.events?.length ?? 0} events`);
  } catch (e) {
    console.warn(`  ⚠ Undated scoreboard failed: ${e.message}`);
  }

  const days = [];
  for (let i = -30; i <= 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push(yyyymmdd(d));
  }

  let dateHits = 0;
  for (const dateStr of days) {
    await sleep(120);
    try {
      const data = await espnGet(`${baseUrl}?dates=${dateStr}&limit=100`);
      const lName = data.leagues?.[0]?.name || leagueName;
      const evts  = data.events || [];
      for (const ev of evts) {
        const p = parseEvent(ev, lName);
        if (p && !allEvt.has(p.id)) { allEvt.set(p.id, p); }
      }
      if (evts.length > 0) dateHits++;
    } catch {
      // skip
    }
  }
  console.log(`  ↳ Date queries: ${dateHits}/${days.length} days, total events: ${allEvt.size}`);

  // Distribute by team slug (NBA teams not in teamsData — accept all)
  const buckets = {};
  for (const fix of allEvt.values()) {
    for (const side of ["home", "away"]) {
      const slug = fix[side]?.slug;
      if (!slug) continue;

      if (!buckets[slug]) {
        const fp = path.join(FIXTURES_DIR, `${slug}.json`);
        try {
          const existing = JSON.parse(fs.readFileSync(fp, "utf-8"));
          buckets[slug] = {
            slug,
            teamId: existing.teamId || 0,
            byId: new Map([
              ...(existing.past     || []).map(f => [f.id, f]),
              ...(existing.upcoming || []).map(f => [f.id, f]),
            ]),
          };
        } catch {
          buckets[slug] = { slug, teamId: 0, byId: new Map() };
        }
      }
      buckets[slug].byId.set(fix.id, fix);
    }
  }

  const nowISO = new Date().toISOString();
  const nowTs  = Date.now() / 1000;

  for (const [slug, bucket] of Object.entries(buckets)) {
    const all      = [...bucket.byId.values()];
    const upcoming = all.filter(f => !f.completed && f.timestamp > nowTs - 3600)
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .slice(0, 20);
    const past     = all.filter(f => f.completed)
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .slice(0, 20);
    fs.writeFileSync(
      path.join(FIXTURES_DIR, `${slug}.json`),
      JSON.stringify({ slug, teamId: bucket.teamId, upcoming, past, fetchedAt: nowISO }, null, 2)
    );
  }

  console.log(`  ✓ Basketball fixtures ${league.slug}: updated ${Object.keys(buckets).length} team files`);
}

// ── Tennis Rankings ───────────────────────────────────────────────────────────

async function fetchTennisRankings(tour) {
  // ESPN tennis: site/v2 returns rankings[0].ranks[] (not .athletes[])
  const url = `https://site.api.espn.com/apis/site/v2/sports/tennis/${tour.espnId}/rankings`;
  const data = await espnGet(url);

  // Structure: data.rankings[0].ranks[{ current, previous, points, athlete }]
  const rawRankings = data.rankings?.[0]?.ranks || [];

  if (!rawRankings.length) {
    console.warn(`  ⚠ No rankings entries for ${tour.slug}`);
    return;
  }

  const rankings = rawRankings.slice(0, 100).map((item, idx) => {
    const athlete = item.athlete || {};
    return {
      rank:    item.current ?? (idx + 1),
      slug:    athlete.id?.toString() || `player-${idx + 1}`,
      name:    athlete.displayName || "",
      // ESPN tennis: flag is a string URL, country in flagAltText / citizenshipCountry
      country: athlete.flagAltText || athlete.citizenshipCountry || (typeof athlete.flag === "string" ? "" : athlete.flag?.alt || ""),
      flag:    typeof athlete.flag === "string" ? athlete.flag : (athlete.flag?.href || ""),
      points:  item.points ?? 0,
    };
  }).filter(e => e.name);

  rankings.sort((a, b) => a.rank - b.rank);

  fs.writeFileSync(
    path.join(STANDINGS_DIR, `${tour.slug}.json`),
    JSON.stringify({ rankings, slug: tour.slug, type: "tennis-rankings", fetchedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`  ✓ Tennis rankings ${tour.slug}: ${rankings.length} players`);
}

// ── F1 Driver Standings ───────────────────────────────────────────────────────

async function fetchF1Standings(series) {
  const url = `https://site.api.espn.com/apis/v2/sports/racing/${series.espnId}/standings`;
  const data = await espnGet(url);
  let entries = data.standings?.entries || data.children?.[0]?.standings?.entries || [];
  if (!entries.length && data.children) {
    for (const child of data.children) {
      entries = child.standings?.entries || [];
      if (entries.length) break;
    }
  }
  if (!entries.length) { console.warn(`  ⚠ No F1 standings for ${series.slug}`); return; }

  const standings = entries.map((entry, idx) => {
    const athlete = entry.athlete || entry.team || {};
    const stats = {};
    for (const s of (entry.stats || [])) stats[s.name] = s.value ?? 0;
    return {
      rank: Math.round(stats.rank ?? stats.rankorder ?? (idx + 1)),
      slug: athlete.slug || (athlete.displayName || "").toLowerCase().replace(/\s+/g, "-"),
      name: athlete.displayName || athlete.name || "",
      country: athlete.flag?.alt || athlete.nationality || "",
      flag: athlete.flag?.href || "",
      team: entry.team?.displayName || stats.team || "",
      points: Math.round(stats.championshipPts ?? stats.points ?? 0),
    };
  }).filter(e => e.name);

  standings.sort((a, b) => (b.points - a.points) || (a.rank - b.rank));
  fs.writeFileSync(
    path.join(STANDINGS_DIR, `${series.slug}.json`),
    JSON.stringify({ rankings: standings, slug: series.slug, type: "f1-rankings", fetchedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`  ✓ F1 Standings ${series.slug}: ${standings.length} drivers`);
}

// ── Golf PGA Rankings ─────────────────────────────────────────────────────────

async function fetchGolfRankings(tour) {
  const url = `https://site.api.espn.com/apis/v2/sports/golf/${tour.espnId}/rankings`;
  const data = await espnGet(url);
  const rankingGroups = data.rankings || [];
  let athletes = [];
  for (const group of rankingGroups) {
    athletes = group.athletes || [];
    if (athletes.length) break;
  }
  if (!athletes.length) { console.warn(`  ⚠ No golf rankings for ${tour.slug}`); return; }

  const rankings = athletes.slice(0, 50).map((entry, idx) => {
    const athlete = entry.athlete || {};
    return {
      rank: entry.ranking ?? (idx + 1),
      slug: athlete.slug || (athlete.displayName || "").toLowerCase().replace(/\s+/g, "-"),
      name: athlete.displayName || "",
      country: athlete.flag?.alt || athlete.nationality || "",
      flag: athlete.flag?.href || "",
      points: entry.points ?? entry.rankingPoints ?? 0,
    };
  }).filter(e => e.name);

  fs.writeFileSync(
    path.join(STANDINGS_DIR, `${tour.slug}.json`),
    JSON.stringify({ rankings, slug: tour.slug, type: "golf-rankings", fetchedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`  ✓ Golf Rankings ${tour.slug}: ${rankings.length} players`);
}

// ── F1 Calendar ──────────────────────────────────────────────────────────────

async function fetchF1Calendar() {
  const url = "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard";
  const data = await espnGet(url);

  const calendarRaw = data.leagues?.[0]?.calendar || [];
  if (!calendarRaw.length) {
    console.warn("  ⚠ No F1 calendar entries found");
    return;
  }

  const now = new Date();

  // Map GP names to Arabic
  const gpNameAr = {
    "Australian Grand Prix": "الجائزة الكبرى للأسترالية",
    "Chinese Grand Prix": "الجائزة الكبرى للصين",
    "Japanese Grand Prix": "الجائزة الكبرى لليابان",
    "Bahrain Grand Prix": "الجائزة الكبرى للبحرين",
    "Saudi Arabian Grand Prix": "الجائزة الكبرى للسعودية",
    "Miami Grand Prix": "الجائزة الكبرى لميامي",
    "Canadian Grand Prix": "الجائزة الكبرى لكندا",
    "Monaco Grand Prix": "الجائزة الكبرى لموناكو",
    "Spanish Grand Prix": "الجائزة الكبرى لإسبانيا",
    "Austrian Grand Prix": "الجائزة الكبرى للنمسا",
    "British Grand Prix": "الجائزة الكبرى لبريطانيا",
    "Belgian Grand Prix": "الجائزة الكبرى لبلجيكا",
    "Hungarian Grand Prix": "الجائزة الكبرى للمجر",
    "Dutch Grand Prix": "الجائزة الكبرى لهولندا",
    "Italian Grand Prix": "الجائزة الكبرى لإيطاليا",
    "Azerbaijan Grand Prix": "الجائزة الكبرى لأذربيجان",
    "Singapore Grand Prix": "الجائزة الكبرى لسنغافورة",
    "United States Grand Prix": "الجائزة الكبرى للولايات المتحدة",
    "Mexico City Grand Prix": "الجائزة الكبرى للمكسيك",
    "São Paulo Grand Prix": "الجائزة الكبرى للبرازيل",
    "Las Vegas Grand Prix": "الجائزة الكبرى للاس فيغاس",
    "Qatar Grand Prix": "الجائزة الكبرى لقطر",
    "Abu Dhabi Grand Prix": "الجائزة الكبرى لأبوظبي",
  };

  const events = calendarRaw.map((entry, idx) => {
    const rawLabel = entry.label || "";
    // Strip sponsor prefix: "Qatar Airways Australian Grand Prix" → "Australian Grand Prix"
    const nameMatch = rawLabel.match(/(\b\w[\w\s]*Grand Prix)/);
    const cleanName = nameMatch ? nameMatch[1].trim() : rawLabel;
    const nameAr = gpNameAr[cleanName] || rawLabel;

    const endDate = new Date(entry.endDate || entry.startDate);
    const isCompleted = endDate < now;

    // Extract event ID from $ref URL
    const refUrl = entry.event?.$ref || "";
    const idMatch = refUrl.match(/events\/(\d+)/);
    const id = idMatch ? idMatch[1] : `f1-${idx + 1}`;

    return {
      id,
      name: nameAr,
      shortName: cleanName.replace(" Grand Prix", "").trim().substring(0, 6).toUpperCase(),
      date: entry.endDate || entry.startDate,
      venue: "",
      location: "",
      status: isCompleted ? "completed" : "upcoming",
      result: "",
    };
  });

  const outputPath = path.join(FIXTURES_DIR, "f1-calendar.json");
  fs.writeFileSync(outputPath, JSON.stringify({ events, fetchedAt: new Date().toISOString() }, null, 2));
  console.log(`  ✓ F1 Calendar: ${events.length} GPs saved`);
}

// ── NBA Schedule ──────────────────────────────────────────────────────────────

async function fetchNBASchedule() {
  const url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
  const data = await espnGet(`${url}?limit=100`);

  const events = data.events || [];
  const now = new Date();
  const nowTs = Date.now() / 1000;

  // Also query ±8 days for more games
  const extraGames = new Map();
  for (const e of events) {
    const comp = e.competitions?.[0];
    if (!comp) continue;
    const competitors = comp.competitors || [];
    const home = competitors.find(c => c.homeAway === "home");
    const away = competitors.find(c => c.homeAway === "away");
    if (!home || !away) continue;
    const statusType = comp.status?.type || {};
    const completed = statusType.completed || false;
    extraGames.set(e.id, {
      id: e.id,
      date: e.date,
      homeTeam: home.team?.displayName || home.team?.shortDisplayName || "",
      awayTeam: away.team?.displayName || away.team?.shortDisplayName || "",
      homeScore: completed ? (parseInt(home.score, 10) || null) : null,
      awayScore: completed ? (parseInt(away.score, 10) || null) : null,
      status: completed ? "completed" : "scheduled"
    });
  }

  // Query a few extra days
  const days = [];
  for (let i = -8; i <= 8; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push(yyyymmdd(d));
  }
  for (const dateStr of days) {
    await sleep(100);
    try {
      const d2 = await espnGet(`${url}?dates=${dateStr}&limit=50`);
      for (const e of d2.events || []) {
        if (extraGames.has(e.id)) continue;
        const comp = e.competitions?.[0];
        if (!comp) continue;
        const competitors = comp.competitors || [];
        const home = competitors.find(c => c.homeAway === "home");
        const away = competitors.find(c => c.homeAway === "away");
        if (!home || !away) continue;
        const statusType = comp.status?.type || {};
        const completed = statusType.completed || false;
        extraGames.set(e.id, {
          id: e.id,
          date: e.date,
          homeTeam: home.team?.displayName || home.team?.shortDisplayName || "",
          awayTeam: away.team?.displayName || away.team?.shortDisplayName || "",
          homeScore: completed ? (parseInt(home.score, 10) || null) : null,
          awayScore: completed ? (parseInt(away.score, 10) || null) : null,
          status: completed ? "completed" : "scheduled"
        });
      }
    } catch { /* skip */ }
  }

  const allGames = [...extraGames.values()];

  // Sort: completed desc, then scheduled asc — keep 8 most relevant
  const completed = allGames.filter(g => g.status === "completed")
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);
  const scheduled = allGames.filter(g => g.status === "scheduled")
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);
  const games = [...completed.reverse(), ...scheduled].slice(0, 8);

  const outputPath = path.join(FIXTURES_DIR, "nba-schedule.json");
  fs.writeFileSync(outputPath, JSON.stringify({ games, fetchedAt: new Date().toISOString() }, null, 2));
  console.log(`  ✓ NBA Schedule: ${games.length} games saved`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(STANDINGS_DIR, { recursive: true });
  fs.mkdirSync(FIXTURES_DIR,  { recursive: true });

  console.log("📊 ESPN Data Fetch (no API key required)\n");

  for (const league of ESPN_LEAGUES) {
    console.log(`\n🏆 ${league.slug}`);

    // Standings
    try {
      await fetchStandings(league);
    } catch (e) {
      console.warn(`  ✗ Standings: ${e.message}`);
    }
    await sleep(600);

    // Fixtures (per-day queries)
    try {
      await fetchFixtures(league);
    } catch (e) {
      console.warn(`  ✗ Fixtures: ${e.message}`);
    }
    await sleep(800);
  }

  // ── Basketball ─────────────────────────────────────────────────────────────
  for (const league of ESPN_BASKETBALL_LEAGUES) {
    console.log(`\n🏀 ${league.slug}`);
    try { await fetchBasketballStandings(league); } catch (e) { console.warn(`  ✗ Basketball standings: ${e.message}`); }
    await sleep(600);
    try { await fetchBasketballFixtures(league); } catch (e) { console.warn(`  ✗ Basketball fixtures: ${e.message}`); }
    await sleep(800);
    try { await fetchNBASchedule(); } catch (e) { console.warn(`  ✗ NBA Schedule: ${e.message}`); }
    await sleep(600);
  }

  // ── Tennis ─────────────────────────────────────────────────────────────────
  for (const tour of ESPN_TENNIS_TOURS) {
    console.log(`\n🎾 ${tour.slug}`);
    try { await fetchTennisRankings(tour); } catch (e) { console.warn(`  ✗ Tennis rankings: ${e.message}`); }
    await sleep(600);
  }

  // ── F1 ─────────────────────────────────────────────────────────────────────
  for (const series of ESPN_F1_SERIES) {
    console.log(`\n🏎️  ${series.slug}`);
    try { await fetchF1Standings(series); } catch (e) { console.warn(`  ✗ F1 Standings: ${e.message}`); }
    await sleep(600);
    try { await fetchF1Calendar(); } catch (e) { console.warn(`  ✗ F1 Calendar: ${e.message}`); }
    await sleep(600);
  }

  // ── Golf ───────────────────────────────────────────────────────────────────
  for (const tour of ESPN_GOLF_TOURS) {
    console.log(`\n⛳  ${tour.slug}`);
    try { await fetchGolfRankings(tour); } catch (e) { console.warn(`  ✗ Golf Rankings: ${e.message}`); }
    await sleep(600);
  }

  console.log("\n✅ ESPN fetch complete");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
