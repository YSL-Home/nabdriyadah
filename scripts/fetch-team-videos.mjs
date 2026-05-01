/**
 * fetch-team-videos.mjs
 * Searches YouTube broadly for match highlights, recaps & compilations
 * for every team — ANY channel, not just official ones.
 * Saves up to 6 video IDs per team into content/teams-data.json
 *
 * Uses GOOGLE_API_KEY (YouTube Data API v3)
 * Quota cost: ~3-4 search units per team × 175 = ~600-700 units (free tier: 10 000/day)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TEAMS_PATH = path.join(ROOT, "content/teams-data.json");
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const YT_SEARCH = "https://www.googleapis.com/youtube/v3/search";
const YT_VIDEOS = "https://www.googleapis.com/youtube/v3/videos";

const VIDEOS_PER_TEAM = 6;

// Multiple search queries per team to get diverse content
// Arabic queries get Arabic highlight channels, English ones get international channels
function buildQueries(teamName, teamSlug) {
  return [
    `ملخص ${teamName} 2025`,              // Arabic: "highlights [team] 2025"
    `${teamName} highlights 2025`,         // English highlights
    `${teamName} match recap 2025`,        // English recap
    `أهداف ${teamName}`,                   // Arabic: "goals [team]"
    `${teamName} goals compilation`,       // Goals compilation
    `${teamName} résumé match 2025`,       // French (for Moroccan/French teams)
  ];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function searchYouTube(query, maxResults = 5) {
  const params = new URLSearchParams({
    part: "id,snippet",
    q: query,
    type: "video",
    maxResults: String(maxResults),
    videoDuration: "medium",       // 4–20 min: good for highlights
    order: "relevance",
    key: GOOGLE_API_KEY
  });
  const res = await fetch(`${YT_SEARCH}?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`YT ${res.status}: ${err?.error?.message || res.statusText}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return (data.items || []).map(i => i.id?.videoId).filter(Boolean);
}

async function verifyIds(ids) {
  if (!ids.length) return ids;
  try {
    const params = new URLSearchParams({
      part: "id,status,contentDetails",
      id: ids.join(","),
      key: GOOGLE_API_KEY
    });
    const res = await fetch(`${YT_VIDEOS}?${params}`);
    if (!res.ok) return ids;
    const data = await res.json();
    return (data.items || [])
      .filter(v => v.status?.embeddable !== false && v.status?.privacyStatus === "public")
      .map(v => v.id);
  } catch {
    return ids; // If verification fails, keep originals
  }
}

async function getTeamVideos(slug, teamName) {
  const queries = buildQueries(teamName, slug);
  const collected = new Set();
  const results = [];

  for (const query of queries) {
    if (results.length >= VIDEOS_PER_TEAM * 2) break; // enough candidates
    try {
      const ids = await searchYouTube(query, 5);
      for (const id of ids) {
        if (!collected.has(id)) {
          collected.add(id);
          results.push(id);
        }
      }
      await sleep(400);
    } catch (e) {
      // quota exceeded — stop gracefully
      if (e.message.includes("quota") || e.message.includes("403")) {
        console.warn("\n⚠ YouTube quota reached — stopping early");
        return null; // signal to stop
      }
      // other error — skip this query
      await sleep(200);
    }
  }

  if (results.length === 0) return [];

  // Verify embeddability (batch check)
  const verified = await verifyIds(results.slice(0, VIDEOS_PER_TEAM * 2));
  await sleep(300);

  return verified.slice(0, VIDEOS_PER_TEAM);
}

async function main() {
  if (!GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_API_KEY not set");
    process.exit(1);
  }

  const teams = JSON.parse(fs.readFileSync(TEAMS_PATH, "utf-8"));
  const slugs = Object.keys(teams);
  let updated = 0;
  let quotaHit = false;

  console.log(`\n🎬 Fetching YouTube videos for ${slugs.length} teams (${VIDEOS_PER_TEAM} per team)...\n`);

  for (const slug of slugs) {
    if (quotaHit) break;

    const team = teams[slug];
    process.stdout.write(`  ${team.name} (${slug})... `);

    const ids = await getTeamVideos(slug, team.name);

    if (ids === null) {
      // Quota hit — stop and save what we have
      quotaHit = true;
      console.log("quota — stopping");
      break;
    }

    if (ids.length > 0) {
      team.videos = ids;
      updated++;
      console.log(`✓ ${ids.length} videos [${ids.slice(0, 2).join(", ")}...]`);
    } else {
      console.log(`— no results (keeping existing ${team.videos?.length || 0})`);
    }

    await sleep(600);
  }

  fs.writeFileSync(TEAMS_PATH, JSON.stringify(teams, null, 2));
  console.log(`\n✅ Updated ${updated}/${slugs.length} teams with real YouTube videos`);
  if (quotaHit) {
    console.log("⚠ Quota reached — run again tomorrow to continue remaining teams");
  }
}

main().catch(e => { console.error(e); process.exit(1); });
