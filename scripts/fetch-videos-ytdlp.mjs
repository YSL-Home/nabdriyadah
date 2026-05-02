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

/** Build search queries for a team (Arabic + English for wider coverage) */
function buildQueries(teamName) {
  return [
    `ملخص ${teamName} 2025`,               // Arabic highlights 2025
    `أهداف ${teamName} 2025`,              // Arabic goals 2025
    `${teamName} highlights 2025`,          // English highlights
    `ملخص مباراة ${teamName} بين سبورت`,   // beIN Sports specific
  ];
}

async function getVideosForTeam(teamName) {
  const seen = new Set();
  const candidates = [];

  for (const query of buildQueries(teamName)) {
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

    process.stdout.write(`  ${team.name} (${slug})... `);

    try {
      const ids = await getVideosForTeam(team.name);

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
