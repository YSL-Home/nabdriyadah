/**
 * backfill-translations.mjs
 * Traduit en batch les titres/descriptions manquants (en_title, fr_title, en_description, fr_description)
 * via l'API Anthropic Claude. Traitement par lots de 10 pour limiter les appels.
 *
 * Usage : node scripts/backfill-translations.mjs
 * Env   : ANTHROPIC_API_KEY, ANTHROPIC_MODEL (optionnel, défaut: claude-3-haiku-20240307)
 */

import fs from "fs";
import path from "path";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const API_KEY  = process.env.ANTHROPIC_API_KEY;
const MODEL    = process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307";
const BATCH    = 8; // articles par appel API
const DELAY_MS = 800;

if (!API_KEY) {
  console.log("ANTHROPIC_API_KEY manquant — backfill ignoré.");
  process.exit(0);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normalizeText(v = "") { return String(v).replace(/\s+/g, " ").trim(); }

/* ── Appel Claude pour traduire un batch d'articles ─────────────────────── */
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
Given Arabic sports article titles and descriptions, provide accurate translations.
Return ONLY a valid JSON array — no markdown, no code blocks, no extra text.
Each element must be an object with these fields (only include fields marked NEED):
{ "slug": string, "en_title"?: string, "en_description"?: string, "fr_title"?: string, "fr_description"?: string }
Keep translations concise and journalistic. en_title max 100 chars, fr_title max 100 chars.`;

  const userPrompt = `Translate the following Arabic sports articles:\n\n${list}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const raw = data?.content?.[0]?.text || "";

  // Extract JSON array from response
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`No JSON array in response: ${raw.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}

/* ── Main ────────────────────────────────────────────────────────────────── */
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║        BACKFILL TRADUCTIONS EN/FR — نبض الرياضة     ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));

  // Articles needing at least one translation
  const needsTranslation = articles.filter(a =>
    !a.en_title || !a.fr_title ||
    (a.description && (!a.en_description || !a.fr_description))
  );

  console.log(`📰 Total articles    : ${articles.length}`);
  console.log(`🌍 À traduire        : ${needsTranslation.length}`);
  console.log(`📦 Taille du batch   : ${BATCH}`);
  console.log(`🤖 Modèle            : ${MODEL}`);
  console.log("───────────────────────────────────────────────────────");

  if (needsTranslation.length === 0) {
    console.log("✅ Toutes les traductions sont déjà présentes.");
    process.exit(0);
  }

  let totalFixed = 0;
  let changed = false;

  // Build slug→article index
  const bySlug = Object.fromEntries(articles.map(a => [a.slug, a]));

  // Process in batches
  for (let i = 0; i < needsTranslation.length; i += BATCH) {
    const batch = needsTranslation.slice(i, i + BATCH);
    const batchNum = Math.floor(i / BATCH) + 1;
    const totalBatches = Math.ceil(needsTranslation.length / BATCH);

    console.log(`\nBatch ${batchNum}/${totalBatches} — articles ${i + 1}–${Math.min(i + BATCH, needsTranslation.length)}`);

    try {
      const translations = await translateBatch(batch);

      for (const t of translations) {
        if (!t.slug || !bySlug[t.slug]) continue;
        const article = bySlug[t.slug];
        let updated = false;

        if (t.en_title && !article.en_title) {
          article.en_title = normalizeText(t.en_title).slice(0, 120);
          updated = true;
        }
        if (t.en_description && !article.en_description) {
          article.en_description = normalizeText(t.en_description).slice(0, 300);
          updated = true;
        }
        if (t.fr_title && !article.fr_title) {
          article.fr_title = normalizeText(t.fr_title).slice(0, 120);
          updated = true;
        }
        if (t.fr_description && !article.fr_description) {
          article.fr_description = normalizeText(t.fr_description).slice(0, 300);
          updated = true;
        }

        if (updated) {
          totalFixed++;
          changed = true;
          console.log(`  ✓ ${t.slug} — EN: ${t.en_title?.slice(0, 50) || "—"}`);
        }
      }
    } catch (err) {
      console.log(`  ⚠ Batch ${batchNum} échoué: ${err.message.slice(0, 100)}`);
    }

    // Rate limit pause between batches
    if (i + BATCH < needsTranslation.length) {
      await sleep(DELAY_MS);
    }
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
