/**
 * post-to-twitter.mjs — Auto-posting des nouveaux articles sur Twitter/X
 *
 * Publie jusqu'à MAX_POSTS tweets par run sur les articles des dernières 3h
 * non encore postés. Utilise l'API v2 de Twitter avec OAuth 1.0a.
 *
 * Secrets GitHub requis :
 *   TWITTER_API_KEY            — Consumer Key (API Key)
 *   TWITTER_API_SECRET         — Consumer Secret (API Key Secret)
 *   TWITTER_ACCESS_TOKEN       — Access Token (ton compte)
 *   TWITTER_ACCESS_SECRET      — Access Token Secret (ton compte)
 *
 * Usage : node scripts/post-to-twitter.mjs
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const POSTED_PATH   = path.join(process.cwd(), "content/twitter-posted.json");
const BASE_URL      = "https://nabdriyadah.com";
const MAX_POSTS     = 4;          // max tweets par run CI
const WINDOW_MS     = 3 * 60 * 60 * 1000; // articles des 3 dernières heures
const DELAY_MS      = 3000;       // pause entre tweets (évite rate-limit)

// ── Credentials ──────────────────────────────────────────────────────────────
const API_KEY       = process.env.TWITTER_API_KEY;
const API_SECRET    = process.env.TWITTER_API_SECRET;
const ACCESS_TOKEN  = process.env.TWITTER_ACCESS_TOKEN;
const ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
  console.log("Credentials Twitter manquants — post ignoré.");
  process.exit(0);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Hashtags par sport ────────────────────────────────────────────────────────
const SPORT_HASHTAGS = {
  football:   ["#كرة_القدم", "#نبض_الرياضة"],
  basketball: ["#كرة_السلة", "#NBA", "#نبض_الرياضة"],
  tennis:     ["#التنس", "#Roland_Garros", "#نبض_الرياضة"],
  padel:      ["#البادل", "#Padel", "#نبض_الرياضة"],
  futsal:     ["#الفوتسال", "#كرة_الصالات", "#نبض_الرياضة"],
};

const SPORT_EMOJI = {
  football:   "⚽",
  basketball: "🏀",
  tennis:     "🎾",
  padel:      "🏓",
  futsal:     "🥅",
};

const LEAGUE_LABELS = {
  "premier-league":   "الدوري الإنجليزي",
  "la-liga":          "الدوري الإسباني",
  "bundesliga":       "البوندسليغا",
  "serie-a":          "الدوري الإيطالي",
  "ligue-1":          "الدوري الفرنسي",
  "champions-league": "دوري أبطال أوروبا",
  "saudi-pro-league": "الدوري السعودي",
  football:           "كرة القدم",
  basketball:         "كرة السلة",
  tennis:             "التنس",
  padel:              "البادل",
  futsal:             "كرة الصالات",
};

// ── Formater le tweet ─────────────────────────────────────────────────────────
function buildTweet(article) {
  const sport   = article.sport || "football";
  const emoji   = SPORT_EMOJI[sport] || "🏅";
  const label   = LEAGUE_LABELS[article.league] || LEAGUE_LABELS[sport] || "الرياضة";
  const tags    = (SPORT_HASHTAGS[sport] || ["#نبض_الرياضة"]).join(" ");
  const url     = `${BASE_URL}/articles/${article.slug}/`;
  const title   = (article.title || "").slice(0, 140);

  // Format : emoji titre \n\n label \n\n url \n\n hashtags
  const tweet = `${emoji} ${title}\n\n${label}\n\n${url}\n\n${tags}`;

  // Twitter limit = 280 chars (URLs comptent pour 23 chars)
  return tweet.slice(0, 280);
}

// ── OAuth 1.0a signing ────────────────────────────────────────────────────────
function percentEncode(str) {
  return encodeURIComponent(String(str))
    .replace(/!/g, "%21").replace(/'/g, "%27")
    .replace(/\(/g, "%28").replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

function oauthSign(method, url, params, consumerSecret, tokenSecret) {
  const sorted = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  const paramStr = sorted.map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`).join("&");
  const baseStr  = `${method}&${percentEncode(url)}&${percentEncode(paramStr)}`;
  const sigKey   = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  return crypto.createHmac("sha1", sigKey).update(baseStr).digest("base64");
}

function buildAuthHeader(method, url, extraParams = {}) {
  const nonce     = crypto.randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams = {
    oauth_consumer_key:     API_KEY,
    oauth_nonce:            nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp:        timestamp,
    oauth_token:            ACCESS_TOKEN,
    oauth_version:          "1.0",
  };

  const allParams = { ...oauthParams, ...extraParams };
  const signature = oauthSign(method, url, allParams, API_SECRET, ACCESS_SECRET);
  oauthParams.oauth_signature = signature;

  const header = "OAuth " + Object.entries(oauthParams)
    .map(([k, v]) => `${percentEncode(k)}="${percentEncode(v)}"`)
    .join(", ");

  return header;
}

// ── Poster un tweet ────────────────────────────────────────────────────────────
async function postTweet(text) {
  const url    = "https://api.twitter.com/2/tweets";
  const body   = JSON.stringify({ text });
  const auth   = buildAuthHeader("POST", url, {});

  const res = await fetch(url, {
    method:  "POST",
    headers: {
      Authorization:  auth,
      "Content-Type": "application/json",
    },
    body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Twitter API ${res.status}: ${JSON.stringify(data?.errors || data).slice(0, 200)}`);
  return data?.data?.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║       AUTO-POSTING TWITTER — نبض الرياضة            ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));

  // Charger l'historique des posts
  let posted = {};
  try { posted = JSON.parse(fs.readFileSync(POSTED_PATH, "utf-8")); } catch {}

  // Articles récents non encore postés
  const now = Date.now();
  const candidates = articles.filter(a => {
    if (posted[a.slug]) return false;
    if (!a.publishedAt) return false;
    return (now - new Date(a.publishedAt).getTime()) < WINDOW_MS;
  });

  console.log(`📰 Articles récents (< 3h) : ${candidates.length}`);
  console.log(`📤 À poster (max ${MAX_POSTS}) : ${Math.min(candidates.length, MAX_POSTS)}`);

  if (candidates.length === 0) {
    console.log("Rien à poster — tous les articles récents ont déjà été publiés.");
    process.exit(0);
  }

  const toPost = candidates.slice(0, MAX_POSTS);
  let successCount = 0;

  for (const article of toPost) {
    const tweet = buildTweet(article);
    console.log(`\n→ Posting: ${article.slug}`);
    console.log(`  "${tweet.slice(0, 80)}..."`);

    try {
      const tweetId = await postTweet(tweet);
      posted[article.slug] = {
        tweetId,
        postedAt: new Date().toISOString(),
        title: (article.title || "").slice(0, 80),
      };
      console.log(`  ✅ Tweet ID: ${tweetId}`);
      successCount++;
    } catch (err) {
      console.log(`  ❌ Échec: ${err.message.slice(0, 100)}`);
    }

    if (toPost.indexOf(article) < toPost.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Sauvegarder l'historique
  fs.writeFileSync(POSTED_PATH, JSON.stringify(posted, null, 2), "utf-8");
  console.log(`\n✅ ${successCount}/${toPost.length} tweets publiés.`);
  console.log("───────────────────────────────────────────────────────");
}

main().catch(e => {
  console.error("Twitter posting error:", e.message);
  process.exit(1);
});
