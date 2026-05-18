/**
 * backfill-translations.mjs
 * Traduit en batch les titres/descriptions/corps manquants (en_title, fr_title, en_description,
 * fr_description, en_content, fr_content) via l'API Anthropic Claude.
 *
 * Pass 1 : titre + description (batch de 10)
 * Pass 2 : corps d'article (batch de 3, articles récents < 48h en priorité)
 *
 * Usage : node scripts/backfill-translations.mjs
 * Env   : ANTHROPIC_API_KEY, ANTHROPIC_MODEL
 */

import fs from "fs";
import path from "path";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const API_KEY  = process.env.ANTHROPIC_API_KEY;
const MODEL    = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
const BATCH    = 10; // articles par appel API (titres/descriptions)
const BATCH_CONTENT = 3; // articles par appel API (corps)
const DELAY_MS = 800;
const MAX_CONTENT_CHARS = 700; // tronquer le corps pour limiter les tokens
const CONTENT_WINDOW_H  = 48;  // ne traduire le corps que pour les articles récents

if (!API_KEY) {
  console.log("ANTHROPIC_API_KEY manquant — backfill ignoré.");
  process.exit(0);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normalizeText(v = "") { return String(v).replace(/\s+/g, " ").trim(); }

/* ── Appel Claude — passe 1 : titre + description ───────────────────────── */
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

  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`No JSON array in response: ${raw.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}

/* ── Appel Claude — passe 2 : corps d'article ───────────────────────────── */
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

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 6000,
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

  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`No JSON array in content response: ${raw.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}

/* ── Main ────────────────────────────────────────────────────────────────── */
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║        BACKFILL TRADUCTIONS EN/FR — نبض الرياضة     ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));

  // Articles needing at least one title/description translation
  const needsTranslation = articles.filter(a =>
    !a.en_title || !a.fr_title ||
    (a.description && (!a.en_description || !a.fr_description))
  );

  // Articles needing content translation (récents < 48h seulement)
  const cutoff = Date.now() - CONTENT_WINDOW_H * 3_600_000;
  const needsContent = articles.filter(a =>
    a.content?.trim() &&
    (!a.en_content || !a.fr_content) &&
    new Date(a.publishedAt || 0).getTime() > cutoff
  );

  console.log(`📰 Total articles    : ${articles.length}`);
  console.log(`🌍 Titres à traduire : ${needsTranslation.length}`);
  console.log(`📖 Corps à traduire  : ${needsContent.length} (< ${CONTENT_WINDOW_H}h)`);
  console.log(`📦 Batch titres      : ${BATCH} | Batch corps: ${BATCH_CONTENT}`);
  console.log(`🤖 Modèle            : ${MODEL}`);
  console.log("───────────────────────────────────────────────────────");

  let totalFixed = 0;
  let changed = false;

  // Build slug→article index
  const bySlug = Object.fromEntries(articles.map(a => [a.slug, a]));

  // ── Pass 1 : titres + descriptions ───────────────────────────────────────
  if (needsTranslation.length > 0) {
    console.log("\n▶ PASSE 1 — Titres & Descriptions");
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

          if (t.en_title && !article.en_title) { article.en_title = normalizeText(t.en_title).slice(0, 120); updated = true; }
          if (t.en_description && !article.en_description) { article.en_description = normalizeText(t.en_description).slice(0, 300); updated = true; }
          if (t.fr_title && !article.fr_title) { article.fr_title = normalizeText(t.fr_title).slice(0, 120); updated = true; }
          if (t.fr_description && !article.fr_description) { article.fr_description = normalizeText(t.fr_description).slice(0, 300); updated = true; }

          if (updated) { totalFixed++; changed = true; console.log(`  ✓ ${t.slug} — EN: ${t.en_title?.slice(0, 50) || "—"}`); }
        }
      } catch (err) {
        const msg = err.message || "";
        console.log(`  ⚠ Batch ${batchNum} échoué: ${msg.slice(0, 120)}`);
        // Arrêt immédiat si erreur fatale (crédit insuffisant, clé invalide, compte désactivé)
        if (/credit|invalid.*key|deactivated|permission|Your cre/i.test(msg)) {
          console.log("  ⛔ Erreur fatale Anthropic — arrêt immédiat du backfill.");
          if (changed) fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
          process.exit(0);
        }
      }

      if (i + BATCH < needsTranslation.length) await sleep(DELAY_MS);
    }
  } else {
    console.log("✅ Titres/descriptions déjà traduits.");
  }

  // ── Pass 2 : corps d'article (articles récents seulement) ────────────────
  if (needsContent.length > 0) {
    console.log("\n▶ PASSE 2 — Corps d'articles (récents < 48h)");
    for (let i = 0; i < needsContent.length; i += BATCH_CONTENT) {
      const batch = needsContent.slice(i, i + BATCH_CONTENT);
      const batchNum = Math.floor(i / BATCH_CONTENT) + 1;
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
        if (/credit|invalid.*key|deactivated|permission|Your cre/i.test(msg)) {
          console.log("  ⛔ Erreur fatale Anthropic — arrêt immédiat.");
          if (changed) fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
          process.exit(0);
        }
      }

      if (i + BATCH_CONTENT < needsContent.length) await sleep(DELAY_MS * 2);
    }
  } else {
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
