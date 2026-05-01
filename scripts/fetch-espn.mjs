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

// ESPN slug → our slug manual overrides
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

function resolveSlug(espnSlug = "", displayName = "") {
  const s = espnSlug.toLowerCase().trim();
  if (ESPN_SLUG_MAP[s]) return ESPN_SLUG_MAP[s];
  if (ourSlugs.has(s)) return s;
  const normalized = displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  if (ourSlugs.has(normalized)) return normalized;
  return null;
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

  console.log("\n✅ ESPN fetch complete");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
