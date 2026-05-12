/**
 * post-to-social.mjs — Auto-posting Facebook + Instagram + TikTok
 *
 * Publie les nouveaux articles (< 3h) sur 3 plateformes via leurs APIs.
 * Tracking dans content/social-posted.json pour éviter les doublons.
 *
 * Secrets GitHub requis :
 *   FACEBOOK_PAGE_ID       — ID numérique de ta page Facebook
 *   FACEBOOK_PAGE_TOKEN    — Token de page (permanent, généré via Meta for Developers)
 *   INSTAGRAM_USER_ID      — ID du compte Instagram Business lié à la page
 *   TIKTOK_ACCESS_TOKEN    — Token d'accès TikTok Content Posting API
 *
 * Usage : node scripts/post-to-social.mjs
 */

import fs from "fs";
import path from "path";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const POSTED_PATH   = path.join(process.cwd(), "content/social-posted.json");
const BASE_URL      = "https://nabdriyadah.com";
const MAX_POSTS     = 3;               // articles par run par plateforme
const WINDOW_MS     = 3 * 60 * 60 * 1000; // fenêtre 3h
const DELAY_MS      = 2000;

// ── Credentials ───────────────────────────────────────────────────────────────
const FB_PAGE_ID    = process.env.FACEBOOK_PAGE_ID;
const FB_TOKEN      = process.env.FACEBOOK_PAGE_TOKEN;
const IG_USER_ID    = process.env.INSTAGRAM_USER_ID;
const TK_TOKEN      = process.env.TIKTOK_ACCESS_TOKEN;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Labels & emojis ───────────────────────────────────────────────────────────
const SPORT_EMOJI = {
  football: "⚽", basketball: "🏀", tennis: "🎾", padel: "🏓", futsal: "🥅",
};

const LEAGUE_LABELS = {
  "premier-league":   "الدوري الإنجليزي الممتاز",
  "la-liga":          "الدوري الإسباني",
  "bundesliga":       "البوندسليغا",
  "serie-a":          "الدوري الإيطالي",
  "ligue-1":          "الدوري الفرنسي",
  "champions-league": "دوري أبطال أوروبا",
  "saudi-pro-league": "الدوري السعودي للمحترفين",
  football:           "كرة القدم",
  basketball:         "كرة السلة",
  tennis:             "التنس",
  padel:              "البادل",
  futsal:             "كرة الصالات",
};

const SPORT_HASHTAGS = {
  football:   "#كرة_القدم #أخبار_الرياضة #نبض_الرياضة",
  basketball: "#كرة_السلة #NBA #نبض_الرياضة",
  tennis:     "#التنس #Grand_Slam #نبض_الرياضة",
  padel:      "#البادل #Padel #نبض_الرياضة",
  futsal:     "#الفوتسال #كرة_الصالات #نبض_الرياضة",
};

// ── Construire le texte du post ───────────────────────────────────────────────
function buildPostText(article, platform = "facebook") {
  const sport  = article.sport || "football";
  const emoji  = SPORT_EMOJI[sport] || "🏅";
  const label  = LEAGUE_LABELS[article.league] || LEAGUE_LABELS[sport] || "الرياضة";
  const tags   = SPORT_HASHTAGS[sport] || "#نبض_الرياضة";
  const url    = `${BASE_URL}/articles/${article.slug}/`;
  const title  = (article.title  || "").slice(0, 200);
  const desc   = (article.description || "").slice(0, 300);

  if (platform === "facebook") {
    return `${emoji} ${title}\n\n${desc}\n\n📍 ${label}\n\n👉 ${url}\n\n${tags}`;
  }

  if (platform === "instagram") {
    // Instagram : pas de liens cliquables dans la caption → mettre URL en fin + mention bio
    return `${emoji} ${title}\n\n${desc}\n\n📍 ${label}\n\n🔗 Lien dans la bio : nabdriyadah.com\n\n${tags} #sport #arabsport`;
  }

  if (platform === "tiktok") {
    // TikTok : titre court + hashtags tendance
    return `${emoji} ${title.slice(0, 150)}\n\n${tags} #sport #football #viral`;
  }

  return `${emoji} ${title}\n\n${url}`;
}

// ── Image publique de l'article ───────────────────────────────────────────────
function getPublicImageUrl(article) {
  if (article.image?.startsWith("http")) return article.image;
  if (article.image?.startsWith("/")) return `${BASE_URL}${article.image}`;
  if (article.imageUrl) return article.imageUrl;
  return null;
}

// ── FACEBOOK : poster sur la page ────────────────────────────────────────────
async function postToFacebook(article) {
  if (!FB_PAGE_ID || !FB_TOKEN) throw new Error("Facebook credentials manquants");

  const message = buildPostText(article, "facebook");
  const url     = `${BASE_URL}/articles/${article.slug}/`;

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        link: url,
        access_token: FB_TOKEN,
      }),
    }
  );

  const data = await res.json();
  if (!res.ok || data.error) throw new Error(JSON.stringify(data.error || data).slice(0, 200));
  return data.id;
}

// ── INSTAGRAM : créer container puis publier ──────────────────────────────────
async function postToInstagram(article) {
  if (!IG_USER_ID || !FB_TOKEN) throw new Error("Instagram credentials manquants");

  const caption  = buildPostText(article, "instagram");
  const imageUrl = getPublicImageUrl(article);

  if (!imageUrl) throw new Error("Pas d'image disponible pour Instagram");

  // Étape 1 : créer le container média
  const containerRes = await fetch(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url:    imageUrl,
        caption:      caption,
        access_token: FB_TOKEN,
      }),
    }
  );

  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error) {
    throw new Error(`Container: ${JSON.stringify(containerData.error || containerData).slice(0, 200)}`);
  }

  const creationId = containerData.id;
  if (!creationId) throw new Error("Pas de creation_id retourné");

  // Attendre que le container soit prêt (Instagram a besoin de ~2s)
  await sleep(3000);

  // Étape 2 : publier le container
  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id:  creationId,
        access_token: FB_TOKEN,
      }),
    }
  );

  const publishData = await publishRes.json();
  if (!publishRes.ok || publishData.error) {
    throw new Error(`Publish: ${JSON.stringify(publishData.error || publishData).slice(0, 200)}`);
  }

  return publishData.id;
}

// ── TIKTOK : post texte via Content Posting API ───────────────────────────────
async function postToTikTok(article) {
  if (!TK_TOKEN) throw new Error("TikTok access token manquant");

  const title = buildPostText(article, "tiktok").slice(0, 150);

  // TikTok Content Posting API — text post
  const res = await fetch("https://open.tiktokapis.com/v2/post/publish/text/init/", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${TK_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title,
        privacy_level:   "PUBLIC_TO_EVERYONE",
        disable_comment: false,
        disable_duet:    false,
        disable_stitch:  false,
      },
      source_info: { source: "PULL_FROM_URL" },
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error?.code !== "ok") {
    throw new Error(JSON.stringify(data.error || data).slice(0, 200));
  }
  return data.data?.publish_id;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   AUTO-POSTING SOCIAL MEDIA — نبض الرياضة           ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));

  // Historique des posts
  let posted = {};
  try { posted = JSON.parse(fs.readFileSync(POSTED_PATH, "utf-8")); } catch {}

  // Sélectionner les articles récents non encore postés
  const now = Date.now();
  const candidates = articles.filter(a => {
    if (!a.publishedAt) return false;
    if ((now - new Date(a.publishedAt).getTime()) > WINDOW_MS) return false;
    const p = posted[a.slug] || {};
    return !p.facebook || !p.instagram || !p.tiktok;
  });

  console.log(`📰 Nouveaux articles (< 3h) : ${candidates.length}`);
  const toPost = candidates.slice(0, MAX_POSTS);

  if (toPost.length === 0) {
    console.log("Rien à poster.");
    process.exit(0);
  }

  const platforms = [
    { name: "Facebook",  fn: postToFacebook,  enabled: !!(FB_PAGE_ID && FB_TOKEN),  key: "facebook"  },
    { name: "Instagram", fn: postToInstagram, enabled: !!(IG_USER_ID && FB_TOKEN),  key: "instagram" },
    { name: "TikTok",    fn: postToTikTok,    enabled: !!TK_TOKEN,                  key: "tiktok"    },
  ];

  for (const article of toPost) {
    const p = posted[article.slug] || {};
    console.log(`\n📄 Article: ${article.slug}`);
    console.log(`   "${(article.title || "").slice(0, 70)}"`);

    for (const platform of platforms) {
      if (!platform.enabled) {
        console.log(`   ${platform.name}: ⏭ credentials manquants`);
        continue;
      }
      if (p[platform.key]) {
        console.log(`   ${platform.name}: ✅ déjà posté`);
        continue;
      }

      try {
        const postId = await platform.fn(article);
        p[platform.key] = { postId, postedAt: new Date().toISOString() };
        console.log(`   ${platform.name}: ✅ ${postId}`);
      } catch (err) {
        console.log(`   ${platform.name}: ❌ ${err.message.slice(0, 100)}`);
      }

      await sleep(DELAY_MS);
    }

    posted[article.slug] = p;
  }

  fs.writeFileSync(POSTED_PATH, JSON.stringify(posted, null, 2), "utf-8");
  console.log("\n✅ Posting terminé — historique sauvegardé.");
  console.log("───────────────────────────────────────────────────────");
}

main().catch(e => {
  console.error("Social posting error:", e.message);
  process.exit(1);
});
