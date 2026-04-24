import fs from "fs";
import path from "path";

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";
const OUTPUT_DIR = path.join(process.cwd(), "content/fixtures");
const TEAMS_MAP_PATH = path.join(process.cwd(), "content/team-ids.json");

// API-Football team IDs for all our clubs
const TEAM_IDS = {
  // Premier League
  "manchester-city": 50,
  "manchester-united": 33,
  "liverpool": 40,
  "arsenal": 42,
  "chelsea": 49,
  "tottenham": 47,
  // La Liga
  "real-madrid": 541,
  "barcelona": 529,
  "atletico-madrid": 530,
  "sevilla": 536,
  "valencia": 532,
  "real-sociedad": 548,
  // Bundesliga
  "bayern-munich": 157,
  "borussia-dortmund": 165,
  "bayer-leverkusen": 168,
  "rb-leipzig": 173,
  "eintracht-frankfurt": 169,
  "borussia-monchengladbach": 163,
  // Serie A
  "juventus": 496,
  "ac-milan": 489,
  "inter-milan": 505,
  "napoli": 492,
  "roma": 497,
  "lazio": 487,
  // Ligue 1
  "psg": 85,
  "marseille": 81,
  "monaco": 91,
  "lyon": 80,
  "lille": 79,
  "rennes": 95,
  // Saudi Pro League
  "al-hilal": 2932,
  "al-nassr": 2939,
  "al-ittihad": 2933,
  "al-ahli": 2937,
  // Eredivisie
  "ajax": 194,
  "psv": 197,
  "feyenoord": 192
};

// API-Football league IDs for competitions
const LEAGUE_IDS = {
  "premier-league": 39,
  "la-liga": 140,
  "bundesliga": 78,
  "serie-a": 135,
  "ligue-1": 61,
  "champions-league": 2,
  "saudi-pro-league": 307,
  "eredivisie": 88,
  "world-cup": 1,
  "euro": 4,
  "afcon": 6,
  "caf-champions-league": 12,
  "club-world-cup": 15
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
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
  if (!res.ok) throw new Error(`API error ${res.status} for ${endpoint}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API errors: ${JSON.stringify(data.errors)}`);
  }
  return data.response || [];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function formatMatch(fixture) {
  const f = fixture.fixture;
  const teams = fixture.teams;
  const goals = fixture.goals;
  const score = fixture.score;
  const league = fixture.league;

  return {
    id: f.id,
    date: f.date,
    timestamp: f.timestamp,
    status: f.status?.short || "NS",
    statusLong: f.status?.long || "",
    elapsed: f.status?.elapsed || null,
    venue: f.venue?.name || "",
    city: f.venue?.city || "",
    home: {
      id: teams.home?.id,
      name: teams.home?.name || "",
      logo: teams.home?.logo || "",
      winner: teams.home?.winner
    },
    away: {
      id: teams.away?.id,
      name: teams.away?.name || "",
      logo: teams.away?.logo || "",
      winner: teams.away?.winner
    },
    goals: {
      home: goals.home,
      away: goals.away
    },
    halftime: {
      home: score?.halftime?.home,
      away: score?.halftime?.away
    },
    league: {
      id: league?.id,
      name: league?.name || "",
      logo: league?.logo || "",
      round: league?.round || ""
    }
  };
}

async function fetchTeamFixtures(slug, teamId) {
  try {
    // Last 10 matches
    const past = await apiFetch(`/fixtures?team=${teamId}&last=10`);
    await sleep(400);

    // Next 5 matches
    const next = await apiFetch(`/fixtures?team=${teamId}&next=5`);
    await sleep(400);

    const pastFormatted = past.map(formatMatch).sort((a, b) => b.timestamp - a.timestamp);
    const nextFormatted = next.map(formatMatch).sort((a, b) => a.timestamp - b.timestamp);

    const data = {
      teamId,
      slug,
      fetchedAt: new Date().toISOString(),
      past: pastFormatted,
      upcoming: nextFormatted
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${slug}.json`),
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    console.log(`  ✓ ${slug}: ${pastFormatted.length} past, ${nextFormatted.length} upcoming`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${slug}: ${err.message}`);
    return false;
  }
}

async function fetchLeagueStandings(slug, leagueId) {
  try {
    const current = await apiFetch(`/standings?league=${leagueId}&season=2024`);
    await sleep(400);

    if (!current.length) return;

    const standings = current[0]?.league?.standings?.[0] || [];
    const formatted = standings.map(entry => ({
      rank: entry.rank,
      team: {
        id: entry.team?.id,
        name: entry.team?.name || "",
        logo: entry.team?.logo || ""
      },
      played: entry.all?.played || 0,
      win: entry.all?.win || 0,
      draw: entry.all?.draw || 0,
      lose: entry.all?.lose || 0,
      goalsFor: entry.all?.goals?.for || 0,
      goalsAgainst: entry.all?.goals?.against || 0,
      points: entry.points || 0,
      form: entry.form || ""
    }));

    fs.writeFileSync(
      path.join(process.cwd(), `content/standings/${slug}.json`),
      JSON.stringify({ leagueId, slug, fetchedAt: new Date().toISOString(), standings: formatted }, null, 2),
      "utf-8"
    );

    console.log(`  ✓ standings ${slug}: ${formatted.length} teams`);
  } catch (err) {
    console.log(`  ✗ standings ${slug}: ${err.message}`);
  }
}

async function main() {
  if (!API_KEY) {
    console.log("API_FOOTBALL_KEY not set — skipping fixture fetch.");
    process.exit(0);
  }

  ensureDir(OUTPUT_DIR);
  ensureDir(path.join(process.cwd(), "content/standings"));

  // Check API status
  try {
    const status = await apiFetch("/status");
    console.log(`API-Football: ${status.account?.firstname || "connected"}, requests today: ${status.requests?.current || 0}/${status.requests?.limit_day || 100}`);
  } catch (e) {
    console.log("API status check failed:", e.message);
  }

  console.log("\n── Fetching team fixtures ──");
  const teamSlugs = Object.keys(TEAM_IDS);
  for (const slug of teamSlugs) {
    await fetchTeamFixtures(slug, TEAM_IDS[slug]);
  }

  console.log("\n── Fetching league standings ──");
  const leagueSlugs = Object.keys(LEAGUE_IDS);
  for (const slug of leagueSlugs) {
    await fetchLeagueStandings(slug, LEAGUE_IDS[slug]);
    await sleep(300);
  }

  console.log("\nFixture fetch complete.");
}

main().catch(e => { console.error(e); process.exit(1); });
