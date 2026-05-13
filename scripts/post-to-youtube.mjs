/**
 * post-to-youtube.mjs
 * Publie des vidéos cartoon sur YouTube Shorts via YouTube Data API v3.
 * Upload resumable → définit comme Short (< 60s, 9:16) → titre arabe.
 *
 * Secret requis : YOUTUBE_REFRESH_TOKEN, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const YT_CLIENT_ID     = process.env.YOUTUBE_CLIENT_ID;
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const YT_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

const POSTED_PATH   = path.join(ROOT, "content", "social-posted.json");
const CARTOONS_DIR  = path.join(ROOT, "public", "generated", "cartoons");
const ARTICLES_PATH = path.join(ROOT, "content", "articles", "seo-articles.json");

const BASE_URL = "https://nabdriyadah.com";

export const HAS_YOUTUBE = !!(YT_CLIENT_ID && YT_CLIENT_SECRET && YT_REFRESH_TOKEN);

// ── OAuth : obtenir access_token depuis refresh_token ───────────────────────
async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     YT_CLIENT_ID,
      client_secret: YT_CLIENT_SECRET,
      refresh_token: YT_REFRESH_TOKEN,
      grant_type:    "refresh_token",
    }),
  });

  if (!res.ok) throw new Error(`YouTube OAuth error: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.access_token;
}

// ── Construire les métadonnées YouTube ──────────────────────────────────────
function buildYouTubeMetadata(article) {
  const SPORT_EMOJI = { football: "⚽", basketball: "🏀", tennis: "🎾", padel: "🏓" };
  const emoji = SPORT_EMOJI[article.sport] || "🏅";

  const title = `${emoji} ${(article.title || "").slice(0, 95)}`;
  const tags  = ["كرة القدم", "نبض الرياضة", "أخبار رياضية", "Shorts",
                  article.sport, "football", "sport"].filter(Boolean);

  const description = [
    article.description?.slice(0, 400) || article.title,
    "",
    `📍 ${BASE_URL}/articles/${article.slug}/`,
    "",
    "#Shorts #كرة_القدم #نبض_الرياضة #أخبار_رياضية",
  ].join("\n");

  return { title, description, tags };
}

// ── Upload vidéo (resumable upload) ─────────────────────────────────────────
async function uploadToYouTube(videoPath, article, accessToken) {
  const { title, description, tags } = buildYouTubeMetadata(article);
  const videoBuffer = fs.readFileSync(videoPath);
  const videoSize   = videoBuffer.length;

  // Étape 1 : initialiser l'upload resumable
  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization:           `Bearer ${accessToken}`,
        "Content-Type":          "application/json",
        "X-Upload-Content-Type": "video/mp4",
        "X-Upload-Content-Length": String(videoSize),
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
          tags,
          categoryId: "17",   // Sports
          defaultLanguage: "ar",
          defaultAudioLanguage: "ar",
        },
        status: {
          privacyStatus:           "public",
          selfDeclaredMadeForKids: false,
          madeForKids:             false,
        },
      }),
    }
  );

  if (!initRes.ok) {
    throw new Error(`YouTube init: ${(await initRes.text()).slice(0, 200)}`);
  }

  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) throw new Error("YouTube: pas d'upload URL");

  // Étape 2 : uploader le fichier vidéo
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      "Content-Type": "video/mp4",
      "Content-Length": String(videoSize),
    },
    body: videoBuffer,
  });

  if (!uploadRes.ok && uploadRes.status !== 308) {
    throw new Error(`YouTube upload: ${(await uploadRes.text()).slice(0, 200)}`);
  }

  const data = await uploadRes.json().catch(() => ({}));
  return data.id || "uploaded";
}

// ── Poster un article sur YouTube Shorts ────────────────────────────────────
export async function postYouTube(videoPath, article) {
  const accessToken = await getAccessToken();
  return uploadToYouTube(videoPath, article, accessToken);
}

// ── Batch : poster les articles récents non encore postés ───────────────────
export async function postRecentArticlesToYouTube(maxPosts = 3) {
  if (!HAS_YOUTUBE) {
    console.log("YouTube: credentials manquants — ignoré");
    return;
  }

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));
  let posted = {};
  try { posted = JSON.parse(fs.readFileSync(POSTED_PATH, "utf-8")); } catch {}

  const now        = Date.now();
  const WINDOW_MS  = 3 * 60 * 60 * 1000;

  const candidates = articles.filter((a) => {
    if (!a.publishedAt) return false;
    if (now - new Date(a.publishedAt).getTime() > WINDOW_MS) return false;
    return !(posted[a.slug]?.youtube);
  });

  console.log(`📺 YouTube Shorts: ${candidates.length} candidats`);
  const toPost = candidates.slice(0, maxPosts);

  for (const article of toPost) {
    // Préférer la vidéo cartoon si elle existe
    const cartoonPath = path.join(CARTOONS_DIR, `${article.slug}_final.mp4`);
    const demoPath    = path.join(CARTOONS_DIR, `demo_${article.slug}.mp4`);
    const videoPath   = fs.existsSync(cartoonPath) ? cartoonPath
                      : fs.existsSync(demoPath)    ? demoPath
                      : null;

    if (!videoPath) {
      console.log(`  ⏭  ${article.slug}: pas de vidéo cartoon disponible`);
      continue;
    }

    try {
      console.log(`  📤 Upload YouTube Shorts: ${article.slug}`);
      const videoId = await postYouTube(videoPath, article);
      posted[article.slug] = { ...(posted[article.slug] || {}), youtube: { videoId, postedAt: new Date().toISOString() } };
      fs.writeFileSync(POSTED_PATH, JSON.stringify(posted, null, 2));
      console.log(`  ✅ YouTube: https://youtube.com/shorts/${videoId}`);
      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      console.log(`  ❌ YouTube erreur: ${err.message.slice(0, 100)}`);
    }
  }
}
