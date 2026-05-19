/**
 * backfill-translations.mjs
 * Traduit en batch les titres/descriptions manquants (en_title, fr_title,
 * en_description, fr_description) via Gemini (primaire) ou Anthropic (fallback).
 *
 * Pass 1 : titre + description (batch de 15)
 * Pass 2 : corps d'article (batch de 4, articles récents < 48h en priorité)
 *
 * Usage : node scripts/backfill-translations.mjs
 * Env   : GOOGLE_API_KEY (primaire), ANTHROPIC_API_KEY (fallback)
 */

import fs from "fs";
import path from "path";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");

// ── Clés API ──────────────────────────────────────────────────────────────────
const GOOGLE_API_KEY    = process.env.GOOGLE_API_KEY    || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// Modèles
const GEMINI_MODEL    = "gemini-2.0-flash";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

// Paramètres
const BATCH             = 10;   // articles par appel (titres/descriptions)
const BATCH_CONTENT     = 3;    // articles par appel (corps)
const DELAY_MS          = 5000; // 5s entre chaque appel (Gemini free tier: 15 RPM)
const MAX_CONTENT_CHARS = 700;
const CONTENT_WINDOW_H  = 48;
const MAX_TITLE_ARTICLES = 100; // cap raisonnable pour free tier (1500 RPD / nb_batches)

if (!GOOGLE_API_KEY && !ANTHROPIC_API_KEY) {
  console.log("Aucune clé API disponible — backfill ignoré.");
  process.exit(0);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function normalizeText(v = "") { return String(v).replace(/\s+/g, " ").trim(); }

function isFatalError(msg = "") {
  return /billing hard limit|insufficient_quota|invalid_api_key|account.*deactivated|API_KEY_INVALID|exceeded your current quota|You exceeded.*quota|QUOTA_EXCEEDED|daily.*limit|credit balance is too low|Your credit balance|balance is too low|PERMISSION_DENIED|API key.*leaked|reported as leaked/i.test(msg);
}
function isRateLimit(msg = "") {
  return /429|rate.*limit|RESOURCE_EXHAUSTED/i.test(msg);
}

// ── Appel Gemini avec retry sur 429 ──────────────────────────────────────────
async function callGemini(systemPrompt, userPrompt, maxTokens = 4096) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 }
  };
  // Retry loop pour 429 rate limit
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    const err = await res.text();
    if (res.status === 429) {
      // Quota journalier épuisé → fatal, pas de retry
      if (/exceeded your current quota|You exceeded|QUOTA_EXCEEDED|daily.*limit/i.test(err)) {
        throw new Error(`Gemini quota fatal: ${err.slice(0, 200)}`);
      }
      // Rate limit temporaire → retry avec backoff
      if (attempt < 3) {
        const waitMs = 20000 * attempt; // 20s, 40s
        console.log(`  ↩ Gemini 429 — attente ${waitMs/1000}s (tentative ${attempt}/3)…`);
        await sleep(waitMs);
        continue;
      }
    }
    throw new Error(`Gemini API ${res.status}: ${err.slice(0, 200)}`);
  }
}

// ── Appel Anthropic (fallback) ─────────────────────────────────────────────────
async function callAnthropic(systemPrompt, userPrompt, maxTokens = 4096) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.content?.[0]?.text || "";
}

// ── Appel générique avec fallback ─────────────────────────────────────────────
let _geminiDead = false;
let _anthropicDead = false;

async function callLLM(systemPrompt, userPrompt, maxTokens = 4096) {
  // Essayer Gemini en premier
  if (GOOGLE_API_KEY && !_geminiDead) {
    try {
      return await callGemini(systemPrompt, userPrompt, maxTokens);
    } catch (err) {
      const msg = err.message || "";
      if (isFatalError(msg)) {
        console.log("  ⛔ Gemini fatal — passage au fallback Anthropic.");
        _geminiDead = true;
      } else {
        throw err;
      }
    }
  }
  // Fallback Anthropic
  if (ANTHROPIC_API_KEY && !_anthropicDead) {
    try {
      return await callAnthropic(systemPrompt, userPrompt, maxTokens);
    } catch (err) {
      const msg = err.message || "";
      if (isFatalError(msg)) {
        console.log("  ⛔ Anthropic fatal — arrêt du backfill.");
        _anthropicDead = true;
      }
      throw err;
    }
  }
  throw new Error("Aucune API disponible.");
}

function parseJsonArray(raw = "") {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`Pas de tableau JSON dans la réponse: ${raw.slice(0, 200)}`);
  return JSON.parse(match[0]);
}

/* ── Pass 1 : titres + descriptions ─────────────────────────────────────────── */
async function translateBatch(items) {
  const list = items.map((a, i) => {
    const lines = [`[${i}] slug: ${a.slug}`];
    lines.push(`  ar_title: ${normalizeText(a.title).slice(0, 150)}`);
    if (a.description) lines.push(`  ar_desc: ${normalizeText(a.description).slice(0, 200)}`);
    if (!a.en_title) lines.push(`  NEED: en_title`);
    if (!a.en_description && a.description) lines.push(`  NEED: en_description`);
    if (!a.fr_title) lines.push(`  NEED: fr_title`);
    if (!a.fr_description && a.description) lines.push(`  NEED: fr_description`);
    return lines.join("\n");
  }).join("\n\n");

  const systemPrompt = `You are a sports news translation assistant.
Given Arabic sports article titles and descriptions, provide accurate translations in BOTH English and French.
Return ONLY a valid JSON array — no markdown, no code blocks, no extra text.
Each element: { "slug": string, "en_title"?: string, "en_description"?: string, "fr_title"?: string, "fr_description"?: string }
Only include fields marked NEED. Keep translations concise and journalistic.
en_title max 100 chars, fr_title max 100 chars.`;

  const userPrompt = `Translate the following Arabic sports articles:\n\n${list}`;
  const raw = await callLLM(systemPrompt, userPrompt, 5000);
  return parseJsonArray(raw);
}

/* ── Pass 2 : corps d'article ────────────────────────────────────────────────── */
async function translateContentBatch(items) {
  const list = items.map((a, i) => {
    const body = normalizeText(a.content || "").slice(0, MAX_CONTENT_CHARS);
    return [
      `[${i}] slug: ${a.slug}`,
      `  ar_title: ${normalizeText(a.title).slice(0, 100)}`,
      `  ar_content: ${body}`,
    ].join("\n");
  }).join("\n\n");

  const systemPrompt = `You are a sports journalist translator.
Given Arabic sports article titles and body text (truncated), write a natural translated version of the body in both English and French.
Return ONLY a valid JSON array — no markdown, no code blocks, no extra text.
Each element: { "slug": string, "en_content": string, "fr_content": string }
Write 2-3 coherent journalistic paragraphs per language. Do not invent facts beyond what is given.`;

  const userPrompt = `Translate the following Arabic sports article bodies:\n\n${list}`;
  const raw = await callLLM(systemPrompt, userPrompt, 7000);
  return parseJsonArray(raw);
}

/* ── Main ─────────────────────────────────────────────────────────────────────── */
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║      BACKFILL TRADUCTIONS EN/FR — نبض الرياضة       ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));

  // Articles nécessitant titre/description
  const needsTranslation = articles.filter(a =>
    !a.en_title || !a.fr_title ||
    (a.description && (!a.en_description || !a.fr_description))
  ).slice(0, MAX_TITLE_ARTICLES); // cap pour free tier

  // Articles nécessitant corps (récents < 48h)
  const cutoff = Date.now() - CONTENT_WINDOW_H * 3_600_000;
  const needsContent = articles.filter(a =>
    a.content?.trim() &&
    (!a.en_content || !a.fr_content) &&
    new Date(a.publishedAt || 0).getTime() > cutoff
  );

  const provider = !_geminiDead ? "Gemini" : "Anthropic";
  console.log(`📰 Total articles    : ${articles.length}`);
  console.log(`🌍 Titres à traduire : ${needsTranslation.length} (cap: ${MAX_TITLE_ARTICLES})`);
  console.log(`📖 Corps à traduire  : ${needsContent.length} (< ${CONTENT_WINDOW_H}h)`);
  console.log(`📦 Batch titres      : ${BATCH} | Batch corps: ${BATCH_CONTENT}`);
  console.log(`🤖 Primaire          : ${provider}`);
  console.log("───────────────────────────────────────────────────────");

  let totalFixed = 0;
  let changed = false;
  const bySlug = Object.fromEntries(articles.map(a => [a.slug, a]));

  // ── Pass 1 : titres + descriptions ────────────────────────────────────────────
  const noApiLeft = () => (_geminiDead || !GOOGLE_API_KEY) && (_anthropicDead || !ANTHROPIC_API_KEY);

  if (needsTranslation.length > 0) {
    console.log("\n▶ PASSE 1 — Titres & Descriptions");
    for (let i = 0; i < needsTranslation.length; i += BATCH) {
      if (noApiLeft()) break;

      const batch = needsTranslation.slice(i, i + BATCH);
      const batchNum  = Math.floor(i / BATCH) + 1;
      const totalBatches = Math.ceil(needsTranslation.length / BATCH);
      console.log(`\nBatch ${batchNum}/${totalBatches} — articles ${i + 1}–${Math.min(i + BATCH, needsTranslation.length)}`);

      try {
        const translations = await translateBatch(batch);
        for (const t of translations) {
          if (!t.slug || !bySlug[t.slug]) continue;
          const article = bySlug[t.slug];
          let updated = false;
          if (t.en_title       && !article.en_title)       { article.en_title       = normalizeText(t.en_title).slice(0, 120);       updated = true; }
          if (t.en_description && !article.en_description) { article.en_description = normalizeText(t.en_description).slice(0, 300); updated = true; }
          if (t.fr_title       && !article.fr_title)       { article.fr_title       = normalizeText(t.fr_title).slice(0, 120);       updated = true; }
          if (t.fr_description && !article.fr_description) { article.fr_description = normalizeText(t.fr_description).slice(0, 300); updated = true; }
          if (updated) { totalFixed++; changed = true; console.log(`  ✓ ${t.slug} — EN: ${(t.en_title||"—").slice(0,50)} | FR: ${(t.fr_title||"—").slice(0,50)}`); }
        }
      } catch (err) {
        const msg = err.message || "";
        console.log(`  ⚠ Batch ${batchNum} échoué: ${msg.slice(0, 120)}`);
        if (noApiLeft()) {
          console.log("  ⛔ Toutes les APIs fatales — arrêt immédiat.");
          break;
        }
      }

      if (i + BATCH < needsTranslation.length) await sleep(DELAY_MS);
    }
  } else {
    console.log("✅ Titres/descriptions déjà traduits.");
  }

  // ── Pass 2 : corps d'article ─────────────────────────────────────────────────
  if (needsContent.length > 0 && !noApiLeft()) {
    console.log("\n▶ PASSE 2 — Corps d'articles (récents < 48h)");
    for (let i = 0; i < needsContent.length; i += BATCH_CONTENT) {
      if (noApiLeft()) break;

      const batch = needsContent.slice(i, i + BATCH_CONTENT);
      const batchNum    = Math.floor(i / BATCH_CONTENT) + 1;
      const totalBatches = Math.ceil(needsContent.length / BATCH_CONTENT);
      console.log(`\nBatch corps ${batchNum}/${totalBatches}`);

      try {
        const translations = await translateContentBatch(batch);
        for (const t of translations) {
          if (!t.slug || !bySlug[t.slug]) continue;
          const article = bySlug[t.slug];
          let updated = false;
          if (t.en_content?.trim() && !article.en_content) { article.en_content = t.en_content.trim(); updated = true; }
          if (t.fr_content?.trim() && !article.fr_content) { article.fr_content = t.fr_content.trim(); updated = true; }
          if (updated) { totalFixed++; changed = true; console.log(`  ✓ Corps ${t.slug} — EN/FR OK`); }
        }
      } catch (err) {
        const msg = err.message || "";
        console.log(`  ⚠ Batch corps ${batchNum} échoué: ${msg.slice(0, 120)}`);
      }

      if (i + BATCH_CONTENT < needsContent.length) await sleep(DELAY_MS * 2);
    }
  } else if (!needsContent.length) {
    console.log("✅ Corps d'articles déjà traduits (ou hors fenêtre 48h).");
  }

  if (changed) {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
    console.log(`\n✅ ${totalFixed} articles mis à jour — fichier sauvegardé.`);
  } else {
    console.log("\nAucune mise à jour effectuée.");
  }

  console.log("───────────────────────────────────────────────────────");
  console.log("Backfill terminé.");
}

main().catch(e => {
  console.error("Backfill error:", e.message);
  process.exit(1);
});
