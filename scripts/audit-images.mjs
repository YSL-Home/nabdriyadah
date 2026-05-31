/**
 * audit-images.mjs — Audit complet des images d'articles
 *
 * Détecte et corrige :
 *   1. Mismatch sport/slug
 *   2. Fichier PNG /generated/ introuvable
 *   3. URLs blacklistées (Google News, watermarks arabes, logos/icônes)
 *   4. Images trop petites via HEAD (<20KB = logo/icône)
 *
 * Écrit content/image-audit-report.json avec la liste des problèmes.
 * Met article.image = null → generate-article-images.mjs régénèrera au prochain run.
 */

import fs from "fs";
import path from "path";

const ARTICLES_PATH  = path.join(process.cwd(), "content/articles/seo-articles.json");
const GENERATED_DIR  = path.join(process.cwd(), "public/generated");
const REPORT_PATH    = path.join(process.cwd(), "content/image-audit-report.json");

const MAX_HEAD_CHECKS = parseInt(process.env.MAX_HEAD_CHECKS || "80", 10);

const BLACKLISTED_DOMAINS = [
  "kooora.com","btolat.com","hesport.com","yallakora.com",
  "filgoal.com","goal.com","koooora.com","masr-sport.com",
  "dot-sport.com","kingfut.com","elfan.net","newsarabia.net",
  "google.com","gstatic.com","googleusercontent.com","googleapis.com",
  "news.google.com","placeholder.com","placehold.it","via.placeholder",
];
const BLACKLISTED_PATTERNS = [/\/icon[s]?\//i, /\/logo[s]?\//i, /\/favicon/i, /\.svg(\?|$)/i];

function isBlacklisted(url) {
  if (!url) return true;
  if (BLACKLISTED_DOMAINS.some(d => url.includes(d))) return true;
  if (BLACKLISTED_PATTERNS.some(p => p.test(url))) return true;
  return false;
}

async function headCheck(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
    clearTimeout(t);
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("image")) return { ok: false, reason: `Not image: ${ct.slice(0,40)}` };
    const size = parseInt(res.headers.get("content-length") || "0", 10);
    if (size > 0 && size < 20000) return { ok: false, reason: `Too small: ${size}B (logo/icon)` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message?.slice(0, 60) || "timeout" };
  }
}

const PREFIX_TO_SPORT = {
  "bball-":"basketball","tennis-":"tennis","padel-":"padel","futsal-":"futsal",
  "ft-":"football","epl-":"football","liga-":"football","ucl-":"football",
  "bund-":"football","seriea-":"football","l1-":"football","saudi-":"football","mls-":"football",
};
function sportFromSlug(slug) {
  for (const [pfx, sp] of Object.entries(PREFIX_TO_SPORT)) {
    if ((slug||"").startsWith(pfx)) return sp;
  }
  return null;
}

function safeReadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return []; }
}

async function main() {
  const articles = safeReadJson(ARTICLES_PATH);
  if (!articles.length) { console.log("Aucun article."); process.exit(0); }

  const issues = [];
  let changed = false;
  let headChecked = 0;

  for (const article of articles) {
    const slug = (article.slug || "").trim();
    if (!slug) continue;
    const img = article.image || null;
    const sport = (article.sport || "").toLowerCase();

    // 1. Mismatch sport/slug
    const expectedSport = sportFromSlug(slug);
    if (expectedSport && sport && expectedSport !== sport) {
      issues.push({ slug, type: "MISMATCH", detail: `sport="${sport}" expected="${expectedSport}"` });
      const pngPath = path.join(GENERATED_DIR, `${slug}.png`);
      if (fs.existsSync(pngPath)) { try { fs.unlinkSync(pngPath); } catch {} }
      article.sport = expectedSport;
      article.image = null;
      changed = true;
      continue;
    }

    // 2. Fichier /generated/ manquant
    if (img && img.startsWith("/generated/")) {
      const pngPath = path.join(GENERATED_DIR, path.basename(img));
      if (!fs.existsSync(pngPath)) {
        issues.push({ slug, type: "MISSING_FILE", detail: img });
        article.image = null;
        changed = true;
        continue;
      }
    }

    // 3. URL externe blacklistée
    if (img && img.startsWith("http") && isBlacklisted(img)) {
      issues.push({ slug, type: "BLACKLISTED", detail: img.slice(0, 80) });
      article.image = null;
      changed = true;
      continue;
    }

    // 4. HEAD check URL externe
    if (img && img.startsWith("http") && headChecked < MAX_HEAD_CHECKS) {
      headChecked++;
      const check = await headCheck(img);
      if (!check.ok) {
        issues.push({ slug, type: "INVALID_URL", detail: check.reason });
        article.image = null;
        changed = true;
        continue;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
  }

  const report = {
    runAt: new Date().toISOString(),
    totalArticles: articles.length,
    issuesFound: issues.length,
    headChecked,
    changed,
    issues,
  };
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");

  console.log(`\n── Audit images ──────────────────────────────────`);
  console.log(`  Articles: ${articles.length} | Problèmes: ${issues.length} | HEAD: ${headChecked}`);
  if (issues.length) {
    const byType = {};
    issues.forEach(i => { byType[i.type] = (byType[i.type]||0)+1; });
    Object.entries(byType).forEach(([t,n]) => console.log(`  ${t}: ${n}`));
  }
  console.log(`  JSON mis à jour: ${changed ? "oui" : "non"}`);
  console.log(`──────────────────────────────────────────────────\n`);

  process.exit(issues.length > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
