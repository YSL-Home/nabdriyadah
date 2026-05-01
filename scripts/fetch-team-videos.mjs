/**
 * fetch-team-videos.mjs
 * Uses YouTube Data API v3 (GOOGLE_API_KEY) to search for real highlight
 * videos for each team and saves valid IDs to content/teams-data.json
 * ~3 requests per team = ~525 total, well within free quota (10 000/day)
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

// Official YouTube channel IDs for top clubs (avoids bad search results)
const OFFICIAL_CHANNELS = {
  "manchester-city":    "UCMcNicNHtHGiGQBJEGZPfTA",
  "manchester-united":  "UCNSMdQtn1SuFzCZjfK2C7dQ",
  "liverpool":          "UCNjAtV-djkj8HrKFBjYd_ow",
  "arsenal":            "UCGHZpAbK5HYusByMShCr7VQ",
  "chelsea":            "UCiHDJ5sTBBAlQrZ11iOJfqA",
  "tottenham":          "UCrXBtRVGtwGQbOCW-HNTDXA",
  "real-madrid":        "UCbvEMVl_mJ_Z6_5T2YnYJMw",
  "barcelona":          "UCbdKPQqq9dE_cS_QzaJgquQ",
  "atletico-madrid":    "UCbkMJlGy3u0uTfAaXeKZqtQ",
  "bayern-munich":      "UCjwIK5lDxUcnAYoJLQFjnXw",
  "borussia-dortmund":  "UCKSEb0WtHuZ3Oy-xJJvFqJQ",
  "psg":                "UC7bPKZbHpqYmT0vUuMh_LJQ",
  "juventus":           "UCN9mKsFxQnkj7HG-tQiFi2g",
  "ac-milan":           "UCFGh73YpRWtLQSLBMlHHMCg",
  "inter-milan":        "UCKEw2Wz5XZs4b8bQiQJGvxA",
  "al-hilal":           "UC9K3tNLVTU7QlzSVV5kR8NQ",
  "al-nassr":           "UCJQdFPkNHDKrUzqAtP7M3HQ",
  "ajax":               "UCzfM3oTHFhBBm7pXv_a9i4Q",
  "psv-eindhoven":      "UCZajyoqXiXMd4bsq7SJgMDQ",
  "feyenoord":          "UCJRHAioGBPr4klbM3cTrMnQ",
  "benfica":            "UCBaSR-Y2i2Q_XrCm4sToaQQ",
  "porto":              "UCJJVcb9wWzlp8RN8u8w_yVQ",
  "wydad":              "UCBh28pX5-lPELGDaqbLiPgQ",
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function searchYouTube(query, maxResults = 3) {
  const params = new URLSearchParams({
    part: "id,snippet",
    q: query,
    type: "video",
    maxResults,
    videoDuration: "medium",
    relevanceLanguage: "ar",
    key: GOOGLE_API_KEY
  });
  const res = await fetch(`${YT_SEARCH}?${params}`);
  if (!res.ok) throw new Error(`YT search ${res.status}`);
  const data = await res.json();
  return (data.items || []).map(i => i.id.videoId).filter(Boolean);
}

async function searchChannelVideos(channelId, query, maxResults = 3) {
  const params = new URLSearchParams({
    part: "id,snippet",
    channelId,
    q: query,
    type: "video",
    maxResults,
    order: "date",
    key: GOOGLE_API_KEY
  });
  const res = await fetch(`${YT_SEARCH}?${params}`);
  if (!res.ok) throw new Error(`YT channel search ${res.status}`);
  const data = await res.json();
  return (data.items || []).map(i => i.id.videoId).filter(Boolean);
}

async function verifyVideoIds(ids) {
  if (!ids.length) return [];
  const params = new URLSearchParams({
    part: "id,status",
    id: ids.join(","),
    key: GOOGLE_API_KEY
  });
  const res = await fetch(`${YT_VIDEOS}?${params}`);
  if (!res.ok) return ids; // assume valid if check fails
  const data = await res.json();
  return (data.items || [])
    .filter(i => i.status?.embeddable !== false)
    .map(i => i.id);
}

async function getTeamVideos(slug, teamName) {
  const channelId = OFFICIAL_CHANNELS[slug];
  let ids = [];

  try {
    if (channelId) {
      // Search in official channel
      ids = await searchChannelVideos(channelId, "highlights", 3);
      await sleep(300);
    }

    if (ids.length < 3) {
      // Fallback: general search
      const searched = await searchYouTube(`${teamName} highlights 2024 2025`, 3);
      await sleep(300);
      // Merge, deduplicate
      const combined = [...new Set([...ids, ...searched])];
      ids = combined.slice(0, 3);
    }

    // Verify embeddability
    const verified = await verifyVideoIds(ids);
    await sleep(200);
    return verified.slice(0, 3);
  } catch (e) {
    console.warn(`  ✗ ${slug}: ${e.message}`);
    return [];
  }
}

async function main() {
  if (!GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_API_KEY not set");
    process.exit(1);
  }

  const teams = JSON.parse(fs.readFileSync(TEAMS_PATH, "utf-8"));
  const slugs = Object.keys(teams);
  let updated = 0;

  console.log(`Fetching videos for ${slugs.length} teams...`);

  for (const slug of slugs) {
    const team = teams[slug];
    process.stdout.write(`  ${slug}... `);

    const ids = await getTeamVideos(slug, team.name);

    if (ids.length > 0) {
      team.videos = ids;
      updated++;
      console.log(`✓ ${ids.join(", ")}`);
    } else {
      // Keep existing if search failed, or set empty
      team.videos = team.videos?.length ? team.videos : [];
      console.log(`— kept existing`);
    }

    // Rate limit: YouTube allows 100 search units/100s on free tier
    await sleep(500);
  }

  fs.writeFileSync(TEAMS_PATH, JSON.stringify(teams, null, 2));
  console.log(`\n✅ Updated ${updated} teams with real video IDs`);
}

main().catch(e => { console.error(e); process.exit(1); });
