/**
 * fetch-videos-ytdlp.mjs
 * Searches YouTube for team highlight videos using yt-dlp (no API key needed).
 * Validates each ID via thumbnail size check, then saves to teams-data.json.
 *
 * Requires: yt-dlp installed (pip install yt-dlp)
 * Usage:    node scripts/fetch-videos-ytdlp.mjs [--max-teams N] [--force]
 *
 * --max-teams N  only process first N teams (default: all)
 * --force        re-fetch even for teams that already have videos
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, "..");
const TEAMS_PATH = path.join(ROOT, "content/teams-data.json");

const VIDEOS_PER_TEAM = 4;
const SEARCH_COUNT    = 8; // candidates before filtering

const args     = process.argv.slice(2);
const maxTeams = (() => { const i = args.indexOf("--max-teams"); return i >= 0 ? parseInt(args[i + 1]) : Infinity; })();
const force    = args.includes("--force");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Search YouTube with yt-dlp and return video IDs (no API key needed).
 * Uses ytsearch: prefix; yt-dlp fetches from YouTube search pages.
 */
function ytdlpSearch(query, count = SEARCH_COUNT) {
  try {
    const escaped = query.replace(/"/g, '\\"');
    const cmd = `yt-dlp "ytsearch${count}:${escaped}" --get-id --no-playlist --quiet --ignore-errors 2>/dev/null`;
    const output = execSync(cmd, { timeout: 30000, encoding: "utf-8" });
    return output.trim().split("\n").map(l => l.trim()).filter(l => /^[A-Za-z0-9_-]{11}$/.test(l));
  } catch {
    return [];
  }
}

/** Validate video ID by checking thumbnail size (> 5 KB = real video) */
async function isValidVideo(id) {
  try {
    const res = await fetch(`https://img.youtube.com/vi/${id}/hqdefault.jpg`, { method: "HEAD" });
    const size = parseInt(res.headers.get("content-length") || "0");
    return size > 5000;
  } catch {
    return true; // keep on network error
  }
}

async function filterValid(ids) {
  const valid = [];
  for (const id of ids) {
    if (valid.length >= VIDEOS_PER_TEAM) break;
    if (await isValidVideo(id)) valid.push(id);
    await sleep(80);
  }
  return valid;
}

// Slug → English name map — Arabic queries fail on GitHub Actions non-interactive shell
const TEAM_EN_NAMES = {
  "arsenal":"Arsenal","aston-villa":"Aston Villa","brentford":"Brentford","brighton":"Brighton",
  "chelsea":"Chelsea","crystal-palace":"Crystal Palace","everton":"Everton","fulham":"Fulham",
  "liverpool":"Liverpool","manchester-city":"Manchester City","manchester-united":"Manchester United",
  "newcastle":"Newcastle United","nottingham-forest":"Nottingham Forest","tottenham":"Tottenham Hotspur",
  "west-ham":"West Ham United","wolves":"Wolverhampton Wanderers","real-madrid":"Real Madrid",
  "barcelona":"FC Barcelona","atletico-madrid":"Atletico Madrid","villarreal":"Villarreal",
  "real-betis":"Real Betis","real-sociedad":"Real Sociedad","athletic-bilbao":"Athletic Bilbao",
  "celta-vigo":"Celta Vigo","sevilla":"Sevilla FC","getafe":"Getafe CF","osasuna":"Osasuna",
  "girona":"Girona FC","mallorca":"RCD Mallorca","rayo-vallecano":"Rayo Vallecano",
  "espanyol":"RCD Espanyol","alaves":"Alaves","valencia":"Valencia CF","bayern-munich":"Bayern Munich",
  "borussia-dortmund":"Borussia Dortmund","rb-leipzig":"RB Leipzig","bayer-leverkusen":"Bayer Leverkusen",
  "eintracht-frankfurt":"Eintracht Frankfurt","vfb-stuttgart":"VfB Stuttgart","wolfsburg":"VfL Wolfsburg",
  "hoffenheim":"TSG Hoffenheim","freiburg":"SC Freiburg","mainz":"FSV Mainz 05","augsburg":"FC Augsburg",
  "werder-bremen":"Werder Bremen","union-berlin":"Union Berlin","fc-koln":"FC Koln",
  "heidenheim":"FC Heidenheim","st-pauli":"FC St. Pauli","ac-milan":"AC Milan","inter-milan":"Inter Milan",
  "juventus":"Juventus","napoli":"Napoli","as-roma":"AS Roma","lazio":"SS Lazio","atalanta":"Atalanta",
  "fiorentina":"Fiorentina","bologna":"Bologna FC","torino":"Torino FC","genoa":"Genoa","udinese":"Udinese",
  "cagliari":"Cagliari","lecce":"US Lecce","hellas-verona":"Hellas Verona","como":"Como 1907",
  "parma":"Parma Calcio","psg":"Paris Saint-Germain","olympique-marseille":"Olympique Marseille",
  "olympique-lyon":"Olympique Lyonnais","monaco":"AS Monaco","losc-lille":"LOSC Lille","nice":"OGC Nice",
  "stade-rennes":"Stade Rennais","lens":"RC Lens","toulouse":"Toulouse FC","stade-brestois":"Stade Brestois",
  "nantes":"FC Nantes","strasbourg":"RC Strasbourg","le-havre":"Le Havre AC","lorient":"FC Lorient",
  "metz":"FC Metz","angers":"Angers SCO","auxerre":"AJ Auxerre",
  "al-hilal":"Al-Hilal","al-nassr":"Al-Nassr","al-ittihad":"Al-Ittihad","al-ahli":"Al-Ahli",
  "al-shabab":"Al-Shabab","al-qadsiah":"Al-Qadsiah","al-ettifaq":"Al-Ettifaq","al-fateh":"Al-Fateh",
  "al-riyadh":"Al-Riyadh","al-fayha":"Al-Fayha","al-hazm":"Al-Hazm","al-kholood":"Al-Kholood",
  "al-okhdood":"Al-Okhdood","al-taawon":"Al-Taawon","al-wahda":"Al-Wahda","al-wehda":"Al-Wehda",
  "damac":"Damac FC","psv-eindhoven":"PSV Eindhoven","az-alkmaar":"AZ Alkmaar","fc-twente":"FC Twente",
  "fc-utrecht":"FC Utrecht","ajax":"Ajax Amsterdam","feyenoord":"Feyenoord",
  "benfica":"SL Benfica","porto":"FC Porto","sporting-cp":"Sporting CP","braga":"SC Braga",
  "inter-miami":"Inter Miami CF","atlanta-united":"Atlanta United","columbus-crew":"Columbus Crew",
  "fc-cincinnati":"FC Cincinnati","nycfc":"New York City FC","philadelphia-union":"Philadelphia Union",
  "austin-fc":"Austin FC",
};

function getEnName(slug) {
  return TEAM_EN_NAMES[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/** English-only queries — works reliably on GitHub Actions */
function buildQueries(slug) {
  const en = getEnName(slug);
  return [
    `${en} highlights 2025`,
    `${en} goals 2025`,
    `${en} match highlights`,
    `${en} best moments 2025`,
  ];
}

async function getVideosForTeam(slug) {
  const seen = new Set();
  const candidates = [];

  for (const query of buildQueries(slug)) {
    const ids = ytdlpSearch(query, SEARCH_COUNT);
    for (const id of ids) {
      if (!seen.has(id)) { seen.add(id); candidates.push(id); }
    }
    if (candidates.length >= SEARCH_COUNT * 2) break;
    await sleep(500);
  }

  return filterValid(candidates);
}

async function main() {
  // Check yt-dlp is installed
  try {
    execSync("yt-dlp --version", { stdio: "ignore" });
  } catch {
    console.error("❌ yt-dlp not found. Install it with: pip install yt-dlp");
    process.exit(1);
  }

  const teams   = JSON.parse(fs.readFileSync(TEAMS_PATH, "utf-8"));
  const slugs   = Object.keys(teams).slice(0, maxTeams === Infinity ? undefined : maxTeams);
  let updated   = 0;
  let skipped   = 0;

  console.log(`\n🎬 Fetching YouTube videos for ${slugs.length} teams via yt-dlp...\n`);

  for (const slug of slugs) {
    const team = teams[slug];

    // Skip teams that already have videos (unless --force)
    if (!force && Array.isArray(team.videos) && team.videos.length > 0) {
      skipped++;
      continue;
    }

    process.stdout.write(`  ${getEnName(slug)} (${slug})... `);

    try {
      const ids = await getVideosForTeam(slug);

      if (ids.length > 0) {
        team.videos = ids;
        updated++;
        console.log(`✓ ${ids.length} videos`);
      } else {
        // Keep existing videos or empty array
        console.log(`— no results`);
      }
    } catch (e) {
      console.log(`✗ error: ${e.message}`);
    }

    await sleep(1000); // be polite to YouTube
  }

  fs.writeFileSync(TEAMS_PATH, JSON.stringify(teams, null, 2));
  console.log(`\n✅ Updated ${updated} teams (${skipped} already had videos, ${slugs.length - updated - skipped} no results)`);
}

main().catch(e => { console.error(e); process.exit(1); });
