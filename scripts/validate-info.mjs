/**
 * validate-info.mjs — Règle d'or نبض الرياضة
 *
 * Lit toutes les données des équipes, les vérifie via TheSportsDB,
 * détecte les placeholders et les incohérences, puis CORRIGE automatiquement
 * les valeurs invalides dans app/team/[slug]/page.jsx.
 *
 * Génère content/validation-report.json avec le résumé complet.
 * Utilisé par GitHub Actions 4× par jour.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEAM_PAGE  = path.join(__dirname, "../app/team/[slug]/page.jsx");
const REPORT_PATH = path.join(__dirname, "../content/validation-report.json");
const TSDB_BASE  = "https://www.thesportsdb.com/api/v1/json/3";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Valeurs de remplacement pour les placeholders détectés ─────────────────
const PLACEHOLDER_REPLACEMENT = "غير محدد";

// Toute valeur contenant l'une de ces chaînes est un placeholder invalide
const PLACEHOLDER_PATTERNS = [
  "المدرب الحالي",
  "المدرب الرئيسي",  // seul, sans nom propre
  "حسب الموقع الرسمي",
  "مدير فني",
];

// ─── Référentiel des équipes avec leur ID TheSportsDB ────────────────────────
const TEAMS = [
  // Premier League
  { slug: "manchester-city",    nameAr: "مانشستر سيتي",        nameEn: "Manchester City",     tsdbId: "133613" },
  { slug: "manchester-united",  nameAr: "مانشستر يونايتد",     nameEn: "Manchester United",   tsdbId: "133616" },
  { slug: "liverpool",          nameAr: "ليفربول",             nameEn: "Liverpool",           tsdbId: "133602" },
  { slug: "arsenal",            nameAr: "أرسنال",              nameEn: "Arsenal",             tsdbId: "133604" },
  { slug: "chelsea",            nameAr: "تشيلسي",              nameEn: "Chelsea",             tsdbId: "133610" },
  { slug: "tottenham",          nameAr: "توتنهام",             nameEn: "Tottenham Hotspur",   tsdbId: "133612" },
  // La Liga
  { slug: "real-madrid",        nameAr: "ريال مدريد",          nameEn: "Real Madrid",         tsdbId: "133739" },
  { slug: "barcelona",          nameAr: "برشلونة",             nameEn: "Barcelona",           tsdbId: "133736" },
  { slug: "atletico-madrid",    nameAr: "أتلتيكو مدريد",       nameEn: "Atletico Madrid",     tsdbId: "133738" },
  // Bundesliga
  { slug: "bayern-munich",      nameAr: "بايرن ميونخ",         nameEn: "Bayern Munich",       tsdbId: "133611" },
  { slug: "borussia-dortmund",  nameAr: "بوروسيا دورتموند",    nameEn: "Borussia Dortmund",   tsdbId: "133603" },
  { slug: "bayer-leverkusen",   nameAr: "باير ليفركوزن",       nameEn: "Bayer Leverkusen",    tsdbId: "133606" },
  // Serie A
  { slug: "juventus",           nameAr: "يوفنتوس",             nameEn: "Juventus",            tsdbId: "133726" },
  { slug: "inter-milan",        nameAr: "إنتر ميلان",          nameEn: "Inter Milan",         tsdbId: "133734" },
  { slug: "ac-milan",           nameAr: "ميلان",               nameEn: "AC Milan",            tsdbId: "133721" },
  { slug: "napoli",             nameAr: "نابولي",              nameEn: "Napoli",              tsdbId: "133723" },
  // Ligue 1
  { slug: "psg",                nameAr: "باريس سان جيرمان",    nameEn: "Paris Saint-Germain", tsdbId: "133751" },
  { slug: "marseille",          nameAr: "مرسيليا",             nameEn: "Marseille",           tsdbId: "133754" },
  { slug: "monaco",             nameAr: "موناكو",              nameEn: "Monaco",              tsdbId: "133752" },
  // Saudi Pro League
  { slug: "al-hilal",           nameAr: "الهلال",              nameEn: "Al-Hilal",            tsdbId: "134342" },
  { slug: "al-nassr",           nameAr: "النصر",               nameEn: "Al-Nassr",            tsdbId: "134343" },
  { slug: "al-ittihad",         nameAr: "الاتحاد",             nameEn: "Al-Ittihad",          tsdbId: "134341" },
  // Eredivisie
  { slug: "ajax",               nameAr: "أياكس",               nameEn: "Ajax",                tsdbId: "133609" },
];

// ─── Extraction du coach depuis le JSX ───────────────────────────────────────
function extractCoach(src, slug) {
  const rx = new RegExp(`"${slug}"\\s*:[\\s\\S]*?coach\\s*:\\s*"([^"]*)"`, "m");
  const m = src.match(rx);
  return m ? m[1] : null;
}

// ─── Détection de placeholder ─────────────────────────────────────────────────
function isPlaceholder(value) {
  if (!value) return false;
  // "المدرب الرئيسي" seul = placeholder, mais "اسم — المدرب الرئيسي" = ok
  if (value === "المدرب الرئيسي") return true;
  return PLACEHOLDER_PATTERNS.some((p) => value.includes(p));
}

// ─── Appel TheSportsDB ────────────────────────────────────────────────────────
async function fetchTeamTSDB(tsdbId) {
  try {
    const res = await fetch(`${TSDB_BASE}/lookupteam.php?id=${tsdbId}`);
    const data = await res.json();
    const t = data?.teams?.[0];
    if (!t) return null;
    return { manager: t.strManager || null, stadium: t.strStadium || null };
  } catch {
    return null;
  }
}

// ─── Remplacement du coach dans le JSX ───────────────────────────────────────
function replaceCoachInJSX(src, slug, oldCoach, newCoach) {
  // Remplace coach: "oldCoach" dans le bloc de l'équipe slug
  const rx = new RegExp(
    `("${slug}"[\\s\\S]*?coach\\s*:\\s*)"${escapeRx(oldCoach)}"`,
    "m"
  );
  return src.replace(rx, `$1"${newCoach}"`);
}

function escapeRx(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const timestamp = new Date().toISOString();
  console.log(`\n🔍 Validation — ${timestamp}\n`);

  let src = fs.readFileSync(TEAM_PAGE, "utf8");
  const issues   = [];
  const fixed    = [];
  const checked  = [];

  for (const team of TEAMS) {
    process.stdout.write(`  ${team.nameAr} (${team.slug})... `);

    const currentCoach = extractCoach(src, team.slug);
    const tsdb = await fetchTeamTSDB(team.tsdbId);
    await sleep(400);

    const result = {
      slug: team.slug,
      nameAr: team.nameAr,
      currentCoach,
      tsdbManager: tsdb?.manager || null,
      issues: [],
      autoFixed: [],
    };

    // 1. Placeholder détecté → remplacer par "غير محدد"
    if (isPlaceholder(currentCoach)) {
      const replacement = PLACEHOLDER_REPLACEMENT;
      src = replaceCoachInJSX(src, team.slug, currentCoach, replacement);
      result.issues.push({ type: "PLACEHOLDER", field: "coach", oldValue: currentCoach });
      result.autoFixed.push({ field: "coach", oldValue: currentCoach, newValue: replacement });
      fixed.push({ slug: team.slug, nameAr: team.nameAr, field: "coach", oldValue: currentCoach, newValue: replacement });
    }

    // 2. API indisponible → signaler sans bloquer
    if (!tsdb) {
      result.issues.push({ type: "API_UNAVAILABLE", field: "all", action: "MANUAL_REVIEW" });
    }

    // 3. Mismatch coach (si API disponible et coach non placeholder)
    if (tsdb?.manager && currentCoach && !isPlaceholder(currentCoach)) {
      const norm = (s) => s.toLowerCase().replace(/[\s-]/g, "");
      const tsdbShort = norm(tsdb.manager).slice(0, 8);
      const currentShort = norm(currentCoach).slice(0, 8);
      if (tsdbShort && currentShort && tsdbShort !== currentShort) {
        result.issues.push({
          type: "POSSIBLE_MISMATCH",
          field: "coach",
          currentValue: currentCoach,
          tsdbValue: tsdb.manager,
          action: "MANUAL_VERIFY",
          note: "Les noms sont différents — vérification manuelle recommandée",
        });
      }
    }

    const label = result.autoFixed.length > 0
      ? `🔧 AUTO-CORRIGÉ (${result.autoFixed.length})`
      : result.issues.length > 0
        ? `⚠️  ${result.issues.length} problème(s)`
        : "✅";
    console.log(label);

    checked.push(result);
    if (result.issues.length > 0) issues.push(result);
  }

  // ─── Écriture du JSX corrigé ────────────────────────────────────────────────
  if (fixed.length > 0) {
    fs.writeFileSync(TEAM_PAGE, src);
    console.log(`\n✍️  ${fixed.length} correction(s) appliquée(s) dans app/team/[slug]/page.jsx`);
  }

  // ─── Rapport ────────────────────────────────────────────────────────────────
  const report = {
    generatedAt: timestamp,
    totalTeamsChecked: checked.length,
    teamsWithIssues: issues.length,
    autoFixedCount: fixed.length,
    status: issues.filter(t => t.issues.some(i => i.type !== "POSSIBLE_MISMATCH")).length === 0
      ? "ALL_OK"
      : "ISSUES_FOUND",
    autoFixed: fixed,
    issues: issues,
    allTeams: checked,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("\n─────────────────────────────────────────────────");
  console.log(`📊 ${checked.length} équipes vérifiées`);
  console.log(`🔧 ${fixed.length} corrections automatiques`);
  console.log(`⚠️  ${issues.length} équipes avec observations`);
  console.log(`📄 Rapport → content/validation-report.json`);
  console.log("─────────────────────────────────────────────────\n");

  // Sortie non-zéro uniquement si des problèmes critiques subsistent
  const criticalLeft = issues.filter(t =>
    t.issues.some(i => i.type === "PLACEHOLDER" && t.autoFixed.length === 0)
  ).length;
  process.exit(criticalLeft > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Erreur validation:", e.message);
  process.exit(1);
});
