/**
 * fetch-espn.mjs — ESPN API (100% gratuite, sans clé API)
 * Récupère classements + matchs pour toutes les ligues
 * et écrit dans content/standings/ et content/fixtures/
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const STANDINGS_DIR = path.join(ROOT, "content/standings");
const FIXTURES_DIR  = path.join(ROOT, "content/fixtures");
const TEAMS_PATH    = path.join(ROOT, "content/teams-data.json");

// ESPN league IDs
const ESPN_LEAGUES = [
  { slug: "premier-league",   espnId: "eng.1"          },
  { slug: "la-liga",          espnId: "esp.1"           },
  { slug: "bundesliga",       espnId: "ger.1"           },
  { slug: "serie-a",          espnId: "ita.1"           },
  { slug: "ligue-1",          espnId: "fra.1"           },
  { slug: "eredivisie",       espnId: "ned.1"           },
  { slug: "saudi-pro-league", espnId: "sau.1"           },
  { slug: "mls",              espnId: "usa.1"           },
  { slug: "liga-portugal",    espnId: "por.1"           },
  { slug: "champions-league", espnId: "uefa.champions"  },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function espnGet(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; NabdBot/1.0)" }
  });
  if (!res.ok) throw new Error(`ESPN ${res.status} — ${url}`);
  return res.json();
}

// Build slug from ESPN team slug or display name
function espnTeamSlug(espnSlug = "", displayName = "") {
  // ESPN slugs often match ours directly
  const normalized = (espnSlug || displayName)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-");
  return normalized;
}

// Load teams-data to resolve slugs and names
const teamsData = JSON.parse(fs.readFileSync(TEAMS_PATH, "utf-8"));

// Build name→slug lookup (normalize Arabic names for matching)
const slugByName = {};
for (const [slug, team] of Object.entries(teamsData)) {
  slugByName[slug] = slug; // direct
}

// ESPN team slug → our slug (manual overrides where ESPN differs)
const ESPN_SLUG_MAP = {
  // Premier League
  "tottenham-hotspur":       "tottenham",
  "wolverhampton-wanderers": "wolves",
  "nottingham-forest":       "nottingham-forest",
  "west-ham-united":         "west-ham",
  "newcastle-united":        "newcastle",
  "manchester-city":         "manchester-city",
  "manchester-united":       "manchester-united",
  "aston-villa":             "aston-villa",
  "crystal-palace":          "crystal-palace",
  "leicester-city":          "leicester-city",
  // La Liga
  "atletico-de-madrid":      "atletico-madrid",
  "athletic-club":           "athletic-bilbao",
  "real-sociedad":           "real-sociedad",
  "rcd-espanyol":            "espanyol",
  "deportivo-alaves":        "alaves",
  "real-valladolid":         "real-valladolid",
  "cd-leganes":              "leganes",
  // Bundesliga
  "borussia-dortmund":       "borussia-dortmund",
  "bayer-leverkusen":        "bayer-leverkusen",
  "rb-leipzig":              "rb-leipzig",
  "tsg-1899-hoffenheim":     "tsg-hoffenheim",
  "vfl-wolfsburg":           "vfl-wolfsburg",
  "vfb-stuttgart":           "vfb-stuttgart",
  "sc-freiburg":             "sc-freiburg",
  "1-fsv-mainz-05":          "mainz",
  "1-fc-union-berlin":       "union-berlin",
  "fc-augsburg":             "augsburg",
  "sv-werder-bremen":        "werder-bremen",
  "vfl-bochum-1848":         "bochum",
  "holstein-kiel":           "holstein-kiel",
  "fc-st-pauli":             "st-pauli",
  "1-fc-heidenheim-1846":    "heidenheim",
  // Serie A
  "as-roma":                 "as-roma",
  "ac-milan":                "ac-milan",
  "inter-milan":             "inter-milan",
  "hellas-verona":           "hellas-verona",
  // Ligue 1
  "paris-saint-germain":     "psg",
  "olympique-de-marseille":  "olympique-marseille",
  "olympique-lyonnais":      "olympique-lyon",
  "losc-lille":              "losc-lille",
  "stade-rennais-fc":        "stade-rennes",
  "as-saint-etienne":        "saint-etienne",
  "stade-de-reims":          "stade-de-reims",
  "rc-strasbourg-alsace":    "strasbourg",
  "stade-brestois-29":       "brest",
  // Saudi
  "al-hilal-saudi":          "al-hilal",
  "al-nassr-fc":             "al-nassr",
  "al-ittihad-club":         "al-ittihad",
  // MLS
  "la-galaxy":               "la-galaxy",
  "inter-miami-cf":          "inter-miami",
  "seattle-sounders-fc":     "seattle-sounders",
  "atlanta-united-fc":       "atlanta-united",
  "portland-timbers":        "portland-timbers",
  "new-england-revolution":  "new-england-revolution",
  "philadelphia-union":      "philadelphia-union",
  "fc-cincinnati":           "fc-cincinnati",
  "columbus-crew":           "columbus-crew",
  "real-salt-lake":          "real-salt-lake",
  "austin-fc":               "austin-fc",
  // Liga Portugal
  "sl-benfica":              "benfica",
  "fc-porto":                "porto",
  "sporting-cp":             "sporting-cp",
  "sc-braga":                "braga",
  "vitoria-sc":              "vitoria-guimaraes",
};

function resolveSlug(espnSlug, displayName) {
  const s = (espnSlug || "").toLowerCase().trim();
  if (ESPN_SLUG_MAP[s]) return ESPN_SLUG_MAP[s];
  // Try direct match with our slugs
  if (slugByName[s]) return s;
  // Normalize display name and try
  const normalized = displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  if (slugByName[normalized]) return normalized;
  return null; // unknown team
}

// ── Standings ─────────────────────────────────────────────────────────────────
async function fetchStandings(league) {
  const url = `https://site.api.espn.com/apis/v2/sports/soccer/${league.espnId}/standings`;
  const data = await espnGet(url);

  // ESPN structure: data.children[0].standings.entries OR data.standings.entries
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
    const team = entry.team || {};
    const stats = {};
    for (const s of (entry.stats || [])) {
      stats[s.name] = s.value ?? 0;
    }
    const slug = resolveSlug(team.slug, team.displayName || team.name || "");
    const teamFromData = slug ? teamsData[slug] : null;
    return {
      rank: Math.round(stats.rank ?? stats.rankorder ?? (idx + 1)),
      slug,
      name: teamFromData?.name || team.displayName || team.name || "",
      logo: teamFromData?.logo || team.logos?.[0]?.href || "",
      played: Math.round(stats.gamesPlayed ?? 0),
      won:    Math.round(stats.wins  ?? 0),
      drawn:  Math.round(stats.ties  ?? 0),
      lost:   Math.round(stats.losses ?? 0),
      gf:     Math.round(stats.pointsFor     ?? stats.goalsFor     ?? 0),
      ga:     Math.round(stats.pointsAgainst ?? stats.goalsAgainst ?? 0),
      gd:     Math.round(stats.differential  ?? 0),
      points: Math.round(stats.points ?? 0),
    };
  }).filter(e => e.name); // remove blanks

  standings.sort((a, b) => a.rank - b.rank);

  fs.writeFileSync(
    path.join(STANDINGS_DIR, `${league.slug}.json`),
    JSON.stringify({ standings, slug: league.slug, fetchedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`  ✓ Standings ${league.slug}: ${standings.length} teams (top: ${standings[0]?.name}, ${standings[0]?.points}pts)`);
}

// ── Fixtures/Scoreboard ───────────────────────────────────────────────────────
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
}

function parseEvent(event, leagueName) {
  const comp = event.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors?.find(c => c.homeAway === "home");
  const away = comp.competitors?.find(c => c.homeAway === "away");
  if (!home || !away) return null;

  const status = comp.status?.type;
  const completed = status?.completed === true;
  const state = status?.state || "pre"; // pre, in, post

  const homeSlug = resolveSlug(home.team?.slug, home.team?.displayName || "");
  const awaySlug = resolveSlug(away.team?.slug, away.team?.displayName || "");
  const homeTeam = homeSlug ? teamsData[homeSlug] : null;
  const awayTeam = awaySlug ? teamsData[awaySlug] : null;

  const dateStr = event.date || "";
  const ts = new Date(dateStr).getTime() / 1000;

  const homeGoals = completed ? (parseInt(home.score, 10) || 0) : null;
  const awayGoals = completed ? (parseInt(away.score, 10) || 0) : null;

  return {
    id: event.id,
    date: dateStr,
    timestamp: Math.round(ts),
    status: completed ? "FT" : state === "in" ? "1H" : "NS",
    statusLong: status?.description || "",
    venue: comp.venue?.fullName || "",
    city: comp.venue?.address?.city || "",
    home: {
      id: home.team?.id,
      slug: homeSlug,
      name: homeTeam?.name || home.team?.displayName || "",
      logo: homeTeam?.logo || home.team?.logos?.[0]?.href || "",
      winner: completed ? homeGoals > awayGoals : null,
    },
    away: {
      id: away.team?.id,
      slug: awaySlug,
      name: awayTeam?.name || away.team?.displayName || "",
      logo: awayTeam?.logo || away.team?.logos?.[0]?.href || "",
      winner: completed ? awayGoals > homeGoals : null,
    },
    goals: { home: homeGoals, away: awayGoals },
    league: { name: leagueName, round: comp.notes?.[0]?.headline || "" },
    completed,
  };
}

async function fetchFixtures(league) {
  const now = new Date();
  const past60 = new Date(now); past60.setDate(past60.getDate() - 60);
  const next60 = new Date(now); next60.setDate(next60.getDate() + 60);

  const dateRange = `${formatDate(past60)}-${formatDate(next60)}`;
  const url = `https://site.api.espn.com/apis/v2/sports/soccer/${league.espnId}/scoreboard?limit=200&dates=${dateRange}`;

  const data = await espnGet(url);
  const events = data.events || [];

  const upcoming = [], past = [];
  const leagueName = data.leagues?.[0]?.name || league.slug;

  for (const event of events) {
    const parsed = parseEvent(event, leagueName);
    if (!parsed) continue;
    if (parsed.completed) past.push(parsed);
    else upcoming.push(parsed);
  }

  upcoming.sort((a, b) => a.timestamp - b.timestamp);
  past.sort((a, b) => b.timestamp - a.timestamp);

  console.log(`  ✓ Fixtures ${league.slug}: ${upcoming.length} upcoming, ${past.length} past`);

  // Distribute to per-team fixture files
  const buckets = {};

  for (const fix of [...upcoming, ...past]) {
    for (const side of ["home", "away"]) {
      const slug = fix[side]?.slug;
      if (!slug || !teamsData[slug]) continue;

      if (!buckets[slug]) {
        // Load existing to preserve historical seasons
        const fp = path.join(FIXTURES_DIR, `${slug}.json`);
        try {
          buckets[slug] = JSON.parse(fs.readFileSync(fp, "utf-8"));
          // Reset current season data (will be rebuilt fresh)
          buckets[slug].upcoming = [];
          buckets[slug].past = [];
        } catch {
          buckets[slug] = { slug, teamId: 0, upcoming: [], past: [], seasons: {} };
        }
        if (!buckets[slug].seasons) buckets[slug].seasons = {};
      }

      if (fix.completed) {
        const already = buckets[slug].past.some(f => f.id === fix.id);
        if (!already) buckets[slug].past.push(fix);
      } else {
        const already = buckets[slug].upcoming.some(f => f.id === fix.id);
        if (!already) buckets[slug].upcoming.push(fix);
      }
    }
  }

  // Write files
  const now8601 = new Date().toISOString();
  for (const [slug, data] of Object.entries(buckets)) {
    data.past.sort((a, b) => b.timestamp - a.timestamp);
    data.upcoming.sort((a, b) => a.timestamp - b.timestamp);
    data.fetchedAt = now8601;
    fs.writeFileSync(
      path.join(FIXTURES_DIR, `${slug}.json`),
      JSON.stringify(data, null, 2)
    );
  }

  return Object.keys(buckets).length;
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
    await sleep(800);

    // Fixtures
    try {
      const n = await fetchFixtures(league);
      console.log(`  ✓ Updated ${n} team fixture files`);
    } catch (e) {
      console.warn(`  ✗ Fixtures: ${e.message}`);
    }
    await sleep(1000);
  }

  console.log("\n✅ ESPN fetch complete");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
