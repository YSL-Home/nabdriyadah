/**
 * post-to-social.mjs — Génère une vidéo + poste sur Facebook / Instagram / TikTok
 *
 * Pipeline par article :
 *   1. Récupère l'image de l'article (depuis public/generated/ ou imageUrl)
 *   2. Génère une vidéo 1080×1920 (9:16, 20s) avec ffmpeg
 *   3. Upload + publie sur Facebook Page, Instagram Reels, TikTok
 *
 * Secrets GitHub requis :
 *   FACEBOOK_PAGE_ID       — ID numérique de la page
 *   FACEBOOK_PAGE_TOKEN    — Token de page (permissions: pages_manage_posts, pages_read_engagement)
 *   INSTAGRAM_USER_ID      — ID du compte Instagram Business lié à la page
 *   TIKTOK_ACCESS_TOKEN    — Token OAuth TikTok (Content Posting API)
 *
 * Dépendances système : ffmpeg (pré-installé sur ubuntu-latest GitHub Actions)
 */

import fs   from "fs";
import path from "path";
import os   from "os";
import { execSync } from "child_process";
import { generateCartoonVideo } from "./cartoon-video-pipeline.mjs";
import { postRecentArticlesToYouTube, HAS_YOUTUBE } from "./post-to-youtube.mjs";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const POSTED_PATH   = path.join(process.cwd(), "content/social-posted.json");
const GENERATED_DIR = path.join(process.cwd(), "public/generated");
const BASE_URL      = "https://nabdriyadah.com";
const MAX_POSTS     = 3;
const WINDOW_MS     = 3 * 60 * 60 * 1000; // 3 heures
const DELAY_MS      = 3000;

const FB_PAGE_ID  = process.env.FACEBOOK_PAGE_ID;
const FB_TOKEN    = process.env.FACEBOOK_PAGE_TOKEN;
const IG_USER_ID  = process.env.INSTAGRAM_USER_ID;
const TK_TOKEN    = process.env.TIKTOK_ACCESS_TOKEN;

const HAS_FB = !!(FB_PAGE_ID && FB_TOKEN);
const HAS_IG = !!(IG_USER_ID && FB_TOKEN);
const HAS_TK = !!TK_TOKEN;
const HAS_CARTOON = !!(process.env.GEMINI_API_KEY && process.env.LEONARDO_API_KEY && process.env.KLING_ACCESS_KEY && process.env.KLING_SECRET_KEY);

if (!HAS_FB && !HAS_IG && !HAS_TK) {
  console.log("Aucun credential social configuré — posting ignoré.");
  process.exit(0);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Labels ────────────────────────────────────────────────────────────────────
const SPORT_EMOJI = {
  football: "⚽", basketball: "🏀", tennis: "🎾", padel: "🏓", futsal: "🥅",
};
const LEAGUE_LABEL = {
  "premier-league": "الدوري الإنجليزي", "la-liga": "الدوري الإسباني",
  "bundesliga": "البوندسليغا", "serie-a": "الدوري الإيطالي",
  "ligue-1": "الدوري الفرنسي", "champions-league": "دوري أبطال أوروبا",
  "saudi-pro-league": "الدوري السعودي",
  football: "كرة القدم", basketball: "كرة السلة",
  tennis: "التنس", padel: "البادل", futsal: "كرة الصالات",
};
const SPORT_TAGS = {
  football:   "#كرة_القدم #أخبار_رياضية #نبض_الرياضة",
  basketball: "#كرة_السلة #NBA #نبض_الرياضة",
  tennis:     "#التنس #Roland_Garros #نبض_الرياضة",
  padel:      "#البادل #Padel #نبض_الرياضة",
  futsal:     "#الفوتسال #كرة_الصالات #نبض_الرياضة",
};

function buildCaption(article, platform = "facebook") {
  const sport  = article.sport || "football";
  const emoji  = SPORT_EMOJI[sport] || "🏅";
  const label  = LEAGUE_LABEL[article.league] || LEAGUE_LABEL[sport] || "الرياضة";
  const tags   = SPORT_TAGS[sport] || "#نبض_الرياضة";
  const title  = (article.title || "").slice(0, 220);
  const desc   = (article.description || "").slice(0, 280);
  const url    = `${BASE_URL}/articles/${article.slug}/`;

  if (platform === "instagram") {
    return `${emoji} ${title}\n\n${desc}\n\n📍 ${label}\n🔗 nabdriyadah.com\n\n${tags} #sport`;
  }
  if (platform === "tiktok") {
    return `${emoji} ${title.slice(0, 130)}\n\n${tags} #sport #football #viral`.slice(0, 300);
  }
  // facebook
  return `${emoji} ${title}\n\n${desc}\n\n📍 ${label}\n👉 ${url}\n\n${tags}`;
}

// ── Télécharger l'image de l'article ─────────────────────────────────────────
async function getImageBuffer(article) {
  // 1. Chercher dans public/generated/ (image générée localement)
  const localPath = path.join(GENERATED_DIR, `${article.slug}.png`);
  if (fs.existsSync(localPath)) {
    return { buffer: fs.readFileSync(localPath), ext: "png" };
  }

  // 2. Télécharger depuis imageUrl ou l'image deployée
  const urls = [
    article.imageUrl,
    article.image?.startsWith("/") ? `${BASE_URL}${article.image}` : article.image,
  ].filter(Boolean);

  for (const url of urls) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("image")) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 4000) continue;
      const ext = ct.includes("png") ? "png" : "jpg";
      return { buffer, ext };
    } catch {}
  }

  throw new Error("Aucune image disponible pour cet article");
}

// ── Générer vidéo 9:16 avec ffmpeg ───────────────────────────────────────────
async function generateVideo(article) {
  const { buffer, ext } = await getImageBuffer(article);

  const tmpDir   = os.tmpdir();
  const imgPath  = path.join(tmpDir, `nr_${article.slug}.${ext}`);
  const vidPath  = path.join(tmpDir, `nr_${article.slug}.mp4`);

  fs.writeFileSync(imgPath, buffer);

  // Construire le texte watermark (ASCII uniquement — drawtext ffmpeg)
  const siteText = "nabdriyadah.com";
  const sportTag = (article.sport || "football").toUpperCase();

  // ffmpeg : image → portrait 1080×1920, zoom doux, watermark bas de page
  const ffmpegCmd = [
    "ffmpeg", "-y",
    "-loop", "1",
    "-t", "20",
    "-i", `"${imgPath}"`,
    "-vf", [
      // Adapter au format portrait 9:16 en centrant et rognant
      "scale=1080:1920:force_original_aspect_ratio=increase",
      "crop=1080:1920",
      // Zoom progressif (Ken Burns léger)
      "zoompan=z='min(zoom+0.0006,1.15)':d=600:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',scale=1080:1920",
      // Bande semi-transparente en bas
      "drawbox=x=0:y=h-160:w=iw:h=160:color=black@0.65:t=fill",
      // Watermark site
      `drawtext=text='${siteText}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=h-110:font=Arial`,
      // Tag sport
      `drawtext=text='${sportTag}':fontcolor=white@0.7:fontsize=28:x=(w-text_w)/2:y=h-60:font=Arial`,
    ].join(","),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-r", "30",
    "-crf", "23",
    "-preset", "fast",
    `"${vidPath}"`,
  ].join(" ");

  execSync(ffmpegCmd, { stdio: "pipe", timeout: 120000 });

  // Nettoyer image temporaire
  fs.unlinkSync(imgPath);

  return vidPath;
}

// ── FACEBOOK : post image (fallback sans ffmpeg) ──────────────────────────────
async function postFacebookImage(article) {
  const caption = buildCaption(article, "facebook");
  let imageBuffer, ext;
  try {
    ({ buffer: imageBuffer, ext } = await getImageBuffer(article));
  } catch {
    // Pas d'image → post texte seul avec lien
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: caption, access_token: FB_TOKEN }),
      }
    );
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(JSON.stringify(data.error || data).slice(0, 200));
    return data.id;
  }

  const form = new FormData();
  form.append("caption", caption);
  form.append("access_token", FB_TOKEN);
  form.append("source", new Blob([imageBuffer], { type: `image/${ext}` }), `photo.${ext}`);

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`,
    { method: "POST", body: form }
  );
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(JSON.stringify(data.error || data).slice(0, 200));
  return data.id;
}

// ── FACEBOOK : upload vidéo + publication ────────────────────────────────────
async function postFacebook(videoPath, article) {
  const caption = buildCaption(article, "facebook");
  const videoBuffer = fs.readFileSync(videoPath);

  const form = new FormData();
  form.append("title", (article.title || "").slice(0, 100));
  form.append("description", caption);
  form.append("access_token", FB_TOKEN);
  form.append("source", new Blob([videoBuffer], { type: "video/mp4" }), "video.mp4");

  const res = await fetch(
    `https://graph-video.facebook.com/v19.0/${FB_PAGE_ID}/videos`,
    { method: "POST", body: form }
  );
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(JSON.stringify(data.error || data).slice(0, 200));
  return data.id;
}

// ── INSTAGRAM : upload resumable → container → publish ───────────────────────
async function postInstagram(videoPath, article) {
  const caption    = buildCaption(article, "instagram");
  const videoBuffer = fs.readFileSync(videoPath);
  const videoSize  = videoBuffer.length;

  // Étape 1 : créer container (upload resumable)
  const initRes = await fetch(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type:  "REELS",
        upload_type: "resumable",
        caption,
        access_token: FB_TOKEN,
      }),
    }
  );
  const initData = await initRes.json();
  if (!initRes.ok || initData.error) {
    throw new Error(`IG init: ${JSON.stringify(initData.error || initData).slice(0, 200)}`);
  }
  const containerId = initData.id;
  const uploadUri   = initData.uri;
  if (!containerId || !uploadUri) throw new Error("IG: pas de container ID / URI");

  // Étape 2 : upload la vidéo
  const uploadRes = await fetch(uploadUri, {
    method: "POST",
    headers: {
      Authorization:  `OAuth ${FB_TOKEN}`,
      offset:         "0",
      file_size:      String(videoSize),
      "Content-Type": "application/octet-stream",
    },
    body: videoBuffer,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`IG upload: ${err.slice(0, 200)}`);
  }

  // Étape 3 : attendre que le container soit prêt (max 60s)
  let ready = false;
  for (let i = 0; i < 12; i++) {
    await sleep(5000);
    const statusRes = await fetch(
      `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${FB_TOKEN}`
    );
    const statusData = await statusRes.json();
    if (statusData.status_code === "FINISHED") { ready = true; break; }
    if (statusData.status_code === "ERROR") throw new Error(`IG container error: ${JSON.stringify(statusData)}`);
  }
  if (!ready) throw new Error("IG container timeout (>60s)");

  // Étape 4 : publier
  const pubRes = await fetch(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: containerId, access_token: FB_TOKEN }),
    }
  );
  const pubData = await pubRes.json();
  if (!pubRes.ok || pubData.error) {
    throw new Error(`IG publish: ${JSON.stringify(pubData.error || pubData).slice(0, 200)}`);
  }
  return pubData.id;
}

// ── TIKTOK : initialize → upload chunks → publish ────────────────────────────
async function postTikTok(videoPath, article) {
  const caption     = buildCaption(article, "tiktok");
  const videoBuffer = fs.readFileSync(videoPath);
  const videoSize   = videoBuffer.length;

  // Étape 1 : initialiser l'upload
  const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${TK_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title:           caption,
        privacy_level:   "PUBLIC_TO_EVERYONE",
        disable_comment: false,
        disable_duet:    false,
        disable_stitch:  false,
      },
      source_info: {
        source:           "FILE_UPLOAD",
        video_size:       videoSize,
        chunk_size:       videoSize,    // 1 seul chunk (< 64MB)
        total_chunk_count: 1,
      },
    }),
  });
  const initData = await initRes.json();
  if (!initRes.ok || initData.error?.code !== "ok") {
    throw new Error(`TikTok init: ${JSON.stringify(initData.error || initData).slice(0, 200)}`);
  }
  const { publish_id, upload_url } = initData.data;

  // Étape 2 : upload le fichier vidéo (1 chunk)
  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    headers: {
      "Content-Type":  "video/mp4",
      "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}`,
      "Content-Length": String(videoSize),
    },
    body: videoBuffer,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`TikTok upload: ${err.slice(0, 200)}`);
  }

  // Étape 3 : vérifier le statut (max 60s)
  for (let i = 0; i < 10; i++) {
    await sleep(6000);
    const statusRes = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${TK_TOKEN}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ publish_id }),
    });
    const statusData = await statusRes.json();
    const status = statusData.data?.status;
    if (status === "PUBLISH_COMPLETE") return publish_id;
    if (status === "FAILED") throw new Error(`TikTok publish failed: ${JSON.stringify(statusData.data)}`);
  }
  return publish_id; // optimistic — souvent le statut tarde
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   VIDEO SOCIAL POSTING — نبض الرياضة                ║");
  console.log(`║   FB:${HAS_FB?"✓":"✗"} IG:${HAS_IG?"✓":"✗"} TK:${HAS_TK?"✓":"✗"} CARTOON:${HAS_CARTOON?"✓":"✗"}               ║`);
  console.log("╚══════════════════════════════════════════════════════╝");

  // Vérifier ffmpeg disponible (non bloquant — fallback image si absent)
  let HAS_FFMPEG = false;
  try { execSync("ffmpeg -version", { stdio: "pipe" }); HAS_FFMPEG = true; }
  catch { console.log("⚠️  ffmpeg non disponible — mode image uniquement (pas de vidéo)."); }

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));
  let posted = {};
  try { posted = JSON.parse(fs.readFileSync(POSTED_PATH, "utf-8")); } catch {}

  const now = Date.now();
  const candidates = articles.filter(a => {
    if (!a.publishedAt) return false;
    if ((now - new Date(a.publishedAt).getTime()) > WINDOW_MS) return false;
    const p = posted[a.slug] || {};
    return (HAS_FB && !p.facebook) || (HAS_IG && !p.instagram) || (HAS_TK && !p.tiktok);
  });

  console.log(`📰 Articles récents (< 3h) à poster: ${candidates.length}`);
  const toPost = candidates.slice(0, MAX_POSTS);
  if (toPost.length === 0) { console.log("Rien à poster."); process.exit(0); }

  const platforms = [
    { name: "Facebook",  key: "facebook",  enabled: HAS_FB, fn: postFacebook  },
    { name: "Instagram", key: "instagram", enabled: HAS_IG, fn: postInstagram },
    { name: "TikTok",    key: "tiktok",    enabled: HAS_TK, fn: postTikTok    },
  ];

  for (const article of toPost) {
    const p = posted[article.slug] || {};
    console.log(`\n🎬 Article: ${article.slug}`);
    console.log(`   "${(article.title || "").slice(0, 65)}"`);

    if (!HAS_FFMPEG) {
      // ── Mode dégradé : pas de ffmpeg → image + texte sur Facebook uniquement ──
      console.log("   📸 Mode image (ffmpeg absent) — Facebook uniquement");
      if (HAS_FB && !p.facebook) {
        try {
          const postId = await postFacebookImage(article);
          p.facebook = { postId, postedAt: new Date().toISOString() };
          console.log(`   Facebook: ✅ ${postId}`);
        } catch (err) {
          console.log(`   Facebook: ❌ ${err.message.slice(0, 120)}`);
        }
      } else if (p.facebook) {
        console.log("   Facebook: ✅ déjà posté");
      }
      if (HAS_IG)  console.log("   Instagram: ⏭ nécessite ffmpeg (vidéo obligatoire)");
      if (HAS_TK)  console.log("   TikTok: ⏭ nécessite ffmpeg (vidéo obligatoire)");
    } else {
      // ── Mode vidéo complet : cartoon animé → Ken Burns ───────────────────────
      let videoPath = null;
      try {
        if (HAS_CARTOON) {
          console.log("   🎨 Génération vidéo cartoon (Gemini → Leonardo → Kling)...");
          videoPath = await generateCartoonVideo(article);
          if (videoPath) console.log("   ✅ Vidéo cartoon générée");
          else console.log("   ⚠️  Cartoon échoué, fallback Ken Burns...");
        }
        if (!videoPath) {
          console.log("   ⏳ Génération vidéo Ken Burns (ffmpeg)...");
          videoPath = await generateVideo(article);
        }
        const sizeMB = (fs.statSync(videoPath).size / 1024 / 1024).toFixed(1);
        console.log(`   ✅ Vidéo prête (${sizeMB} MB)`);
      } catch (err) {
        console.log(`   ❌ Génération vidéo échouée: ${err.message.slice(0, 100)}`);
        posted[article.slug] = p;
        fs.writeFileSync(POSTED_PATH, JSON.stringify(posted, null, 2), "utf-8");
        continue;
      }

      for (const platform of platforms) {
        if (!platform.enabled || p[platform.key]) {
          if (!platform.enabled) console.log(`   ${platform.name}: ⏭ credentials manquants`);
          else console.log(`   ${platform.name}: ✅ déjà posté`);
          continue;
        }
        try {
          const postId = await platform.fn(videoPath, article);
          p[platform.key] = { postId, postedAt: new Date().toISOString() };
          console.log(`   ${platform.name}: ✅ ${postId}`);
        } catch (err) {
          console.log(`   ${platform.name}: ❌ ${err.message.slice(0, 120)}`);
        }
        await sleep(DELAY_MS);
      }

      try { if (videoPath) fs.unlinkSync(videoPath); } catch {}
    }

    posted[article.slug] = p;
    fs.writeFileSync(POSTED_PATH, JSON.stringify(posted, null, 2), "utf-8");
  }

  // YouTube Shorts — poste les vidéos cartoon déjà générées
  if (HAS_YOUTUBE) {
    console.log("\n📺 YouTube Shorts posting...");
    await postRecentArticlesToYouTube(MAX_POSTS);
  } else {
    console.log("\n📺 YouTube: YOUTUBE_CLIENT_ID/SECRET/REFRESH_TOKEN non configurés — ignoré");
  }

  console.log("\n✅ Social posting terminé.");
  console.log("───────────────────────────────────────────────────────");
}

main().catch(e => {
  console.error("Social posting error:", e.message);
  process.exit(1);
});
