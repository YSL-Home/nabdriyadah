/**
 * fetch-channel-ids.mjs
 * Finds the official YouTube channel ID for each team.
 * Stores youtubeChannelId + latest 4 video IDs from the uploads playlist.
 *
 * Requires: GOOGLE_API_KEY (YouTube Data API v3)
 * Usage: node scripts/fetch-channel-ids.mjs [--max-teams N] [--force]
 *
 * Quota cost: ~2 units per team (1 search + 1 playlistItems)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, "..");
const TEAMS_PATH = path.join(ROOT, "content/teams-data.json");
const API_KEY    = process.env.GOOGLE_API_KEY;

const args     = process.argv.slice(2);
const maxTeams = (() => { const i = args.indexOf("--max-teams"); return i >= 0 ? parseInt(args[i+1]) : Infinity; })();
const force    = args.includes("--force");

if (!API_KEY) { console.error("❌ GOOGLE_API_KEY not set"); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Search YouTube for the official team channel */
async function findChannelId(teamName) {
  const queries = [
    `${teamName} FC official`,
    `${teamName} official channel`,
    teamName,
  ];
  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        part: "snippet", q, type: "channel",
        maxResults: "3", key: API_KEY,
      });
      const res  = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const items = data.items || [];
      // Prefer channels whose title contains the team name (case-insensitive)
      const exactMatch = items.find(i =>
        i.snippet.title.toLowerCase().includes(teamName.toLowerCase().slice(0, 8))
      );
      const channelId = exactMatch?.snippet?.channelId || items[0]?.snippet?.channelId;
      if (channelId) return channelId;
    } catch (e) {
      if (e.message?.includes("quota")) { console.warn("\n⚠ Quota hit"); return "QUOTA"; }
    }
    await sleep(200);
  }
  return null;
}

/** Fetch latest N video IDs from a channel's uploads playlist */
async function getChannelVideos(channelId, maxResults = 4) {
  // Uploads playlist ID: replace 'UC' prefix with 'UU'
  const uploadsPlaylistId = channelId.replace(/^UC/, "UU");
  try {
    const params = new URLSearchParams({
      part: "contentDetails", playlistId: uploadsPlaylistId,
      maxResults: String(maxResults), key: API_KEY,
    });
    const res  = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    const data = await res.json();
    if (data.error) return [];
    return (data.items || []).map(i => i.contentDetails?.videoId).filter(Boolean);
  } catch { return []; }
}

async function main() {
  const teams  = JSON.parse(fs.readFileSync(TEAMS_PATH, "utf-8"));
  const slugs  = Object.keys(teams).slice(0, maxTeams === Infinity ? undefined : maxTeams);
  let updated  = 0;
  let quotaHit = false;

  console.log(`\n📺 Fetching YouTube channel IDs for ${slugs.length} teams...\n`);

  for (const slug of slugs) {
    if (quotaHit) break;
    const team = teams[slug];

    if (!force && team.youtubeChannelId) {
      process.stdout.write(`  ${team.name} — already has channel ID, skipping\n`);
      continue;
    }

    process.stdout.write(`  ${team.name} (${slug})... `);

    const channelId = await findChannelId(team.name);
    if (channelId === "QUOTA") { quotaHit = true; break; }

    if (channelId) {
      team.youtubeChannelId = channelId;

      // Also fetch latest videos from this channel
      const videoIds = await getChannelVideos(channelId, 4);
      if (videoIds.length > 0) {
        team.videos = videoIds;
        console.log(`✓ channel=${channelId} + ${videoIds.length} videos`);
      } else {
        console.log(`✓ channel=${channelId} (no playlist videos)`);
      }
      updated++;
    } else {
      console.log(`— not found`);
    }

    await sleep(500);
  }

  fs.writeFileSync(TEAMS_PATH, JSON.stringify(teams, null, 2));
  console.log(`\n✅ Updated ${updated} teams with YouTube channel IDs`);
}

main().catch(e => { console.error(e); process.exit(1); });
