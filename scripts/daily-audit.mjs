/**
 * daily-audit.mjs — Audit quotidien automatique
 * Vérifie et corrige :
 *   1. Images manquantes / sport incorrect dans les fallbacks
 *   2. Articles EN/FR sans traduction (en_title / fr_title manquants)
 *   3. Articles sans image générée
 *   4. Articles avec sport/league incohérent par rapport au slug
 *   5. Doublons d'articles (même sourceUrl)
 * Rapport JSON sauvegardé dans content/audit-report.json
 */

import fs from "fs";
import path from "path";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const GENERATED_DIR = path.join(process.cwd(), "public/generated");
const REPORT_PATH   = path.join(process.cwd(), "content/audit-report.json");

function normalizeText(v = "") { return String(v).replace(/\s+/g, " ").trim(); }
function hasArabic(t = "")     { return /[؀-ۿ]/.test(t); }

/* ── 1. Load articles ──────────────────────────────────────────────────── */
const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));
let changed = false;

const report = {
  date: new Date().toISOString(),
  total: articles.length,
  fixes: [],
  warnings: [],
};

/* ── 2. Check missing images ───────────────────────────────────────────── */
let missingImages = 0;
for (const a of articles) {
  const imgPath = a.image?.startsWith("/generated/")
    ? path.join(GENERATED_DIR, path.basename(a.image))
    : null;

  if (imgPath && !fs.existsSync(imgPath)) {
    missingImages++;
    report.warnings.push({
      type: "missing_image",
      slug: a.slug,
      sport: a.sport,
      image: a.image,
    });
  }
}
if (missingImages > 0) {
  report.fixes.push({ type: "missing_images_detected", count: missingImages, action: "will_regenerate_on_next_ci" });
}

/* ── 3. Check sport/slug coherence ─────────────────────────────────────── */
const SPORT_PREFIXES = {
  "ft-":     "football",
  "bball-":  "basketball",
  "tennis-": "tennis",
  "padel-":  "padel",
  "futsal-": "futsal",
};

let sportMismatches = 0;
for (const a of articles) {
  const slug = normalizeText(a.slug);
  for (const [prefix, sport] of Object.entries(SPORT_PREFIXES)) {
    if (slug.startsWith(prefix) && a.sport !== sport) {
      sportMismatches++;
      report.fixes.push({
        type: "sport_mismatch_fixed",
        slug: a.slug,
        was: a.sport,
        fixed_to: sport,
      });
      a.sport = sport;
      if (sport !== "football") a.league = sport; // league = sport for non-football
      changed = true;
    }
  }
}

/* ── 4. Check EN/FR translations ───────────────────────────────────────── */
let missingEn = 0, missingFr = 0;
for (const a of articles) {
  if (!a.en_title) {
    missingEn++;
    // Free fix: use sourceTitle if not Arabic
    if (a.sourceTitle && !hasArabic(a.sourceTitle)) {
      a.en_title = normalizeText(a.sourceTitle).slice(0, 100);
      report.fixes.push({ type: "en_title_from_source", slug: a.slug, value: a.en_title.slice(0, 60) });
      changed = true;
      missingEn--;
    }
  }
  if (!a.fr_title) missingFr++;
}

if (missingEn > 0)  report.warnings.push({ type: "missing_en_title",  count: missingEn,  action: "needs_llm_backfill" });
if (missingFr > 0)  report.warnings.push({ type: "missing_fr_title",  count: missingFr,  action: "needs_llm_backfill" });

/* ── 5. Check duplicates ───────────────────────────────────────────────── */
const seenUrls = new Map();
const duplicates = [];
for (const a of articles) {
  const url = normalizeText(a.sourceUrl || a.url || "");
  if (!url) continue;
  if (seenUrls.has(url)) {
    duplicates.push({ slug: a.slug, duplicate_of: seenUrls.get(url) });
  } else {
    seenUrls.set(url, a.slug);
  }
}
if (duplicates.length > 0) {
  report.warnings.push({ type: "duplicate_articles", items: duplicates });
}

/* ── 6. Check articles with no publishedAt ─────────────────────────────── */
const noDate = articles.filter(a => !a.publishedAt);
if (noDate.length > 0) {
  report.warnings.push({ type: "missing_publishedAt", count: noDate.length, slugs: noDate.map(a => a.slug) });
}

/* ── 7. Save fixes ─────────────────────────────────────────────────────── */
if (changed) {
  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
}

/* ── 8. Summary ────────────────────────────────────────────────────────── */
report.summary = {
  fixes_applied: report.fixes.filter(f => !f.action?.includes("will_")).length,
  warnings: report.warnings.length,
  missing_images: missingImages,
  missing_en_title: missingEn,
  missing_fr_title: missingFr,
  sport_mismatches_fixed: sportMismatches,
  duplicates: duplicates.length,
};

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║          AUDIT QUOTIDIEN — نبض الرياضة              ║");
console.log("╚══════════════════════════════════════════════════════╝");
console.log(`📅 Date       : ${report.date}`);
console.log(`📰 Articles   : ${report.total}`);
console.log(`✅ Fixes      : ${report.summary.fixes_applied}`);
console.log(`⚠️  Warnings   : ${report.summary.warnings}`);
console.log(`🖼️  Images mq  : ${report.summary.missing_images}`);
console.log(`🌍 Sans EN    : ${report.summary.missing_en_title}`);
console.log(`🇫🇷 Sans FR    : ${report.summary.missing_fr_title}`);
console.log(`⚽ Sport fix  : ${report.summary.sport_mismatches_fixed}`);
console.log(`🔁 Doublons   : ${report.summary.duplicates}`);
console.log("───────────────────────────────────────────────────────");
if (report.fixes.length) {
  console.log("FIXES APPLIQUÉS :");
  report.fixes.slice(0, 10).forEach(f => console.log(`  • [${f.type}] ${f.slug || ""} ${f.value || f.action || ""}`));
  if (report.fixes.length > 10) console.log(`  … et ${report.fixes.length - 10} autres`);
}
if (report.warnings.length) {
  console.log("WARNINGS :");
  // Grouper les warnings répétitifs (ex: missing_image × N)
  const grouped = {};
  report.warnings.forEach(w => {
    const key = w.type;
    if (!grouped[key]) grouped[key] = { type: w.type, count: 0, action: w.action };
    grouped[key].count += w.count || 1;
    if (w.action) grouped[key].action = w.action;
  });
  Object.values(grouped).forEach(w =>
    console.log(`  ⚠ [${w.type}] ×${w.count} ${w.action || ""}`)
  );
}
console.log("───────────────────────────────────────────────────────");
console.log(`📄 Rapport complet : content/audit-report.json`);

process.exit(0);
