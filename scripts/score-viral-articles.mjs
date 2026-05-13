/**
 * score-viral-articles.mjs
 * Score chaque article par potentiel viral (0-100).
 * Priorise la génération cartoon sur les articles à fort score.
 *
 * Critères de scoring :
 *  - Résultat inattendu / upset (choc, surprise)
 *  - Transfert / rumeur de transfert
 *  - Polémique / clash / scandale
 *  - Record / historique
 *  - Derby / Classique / finale
 *  - Club à haute audience arabe (Real, Barça, PSG, clubs saoudiens)
 *  - Fraîcheur de l'article (pénalité pour articles > 6h)
 *
 * Écrit : content/viral-scores.json
 * Modifie : content/articles/seo-articles.json (ajoute champ viralScore)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT         = path.join(__dirname, "..");
const ARTICLES_PATH = path.join(ROOT, "content", "articles", "seo-articles.json");
const SCORES_PATH   = path.join(ROOT, "content", "viral-scores.json");

// ── Mots-clés viraux par catégorie (arabe + anglais/français) ──────────────
const VIRAL_SIGNALS = {
  // Résultats chocs (×20)
  upset: {
    weight: 20,
    keywords: [
      "مفاجأة", "صدمة", "هزيمة نكراء", "خسارة كبيرة", "فضيحة",
      "يخسر", "يُهزم", "هزم", "انهار", "كارثة", "أزمة",
      "upset", "shock", "humiliation", "collapse", "disaster",
    ],
  },
  // Transferts (×18)
  transfer: {
    weight: 18,
    keywords: [
      "انتقال", "صفقة", "ينتقل", "عرض", "يرحل", "يغادر", "يوقع",
      "يجدد", "عقد", "ميركاتو", "صفقة الانتقال",
      "transfert", "transfer", "signing", "deal", "contract",
    ],
  },
  // Polémique / clash (×16)
  controversy: {
    weight: 16,
    keywords: [
      "جدل", "خلاف", "أزمة", "غاضب", "ينتقد", "هجوم", "طرد",
      "إيقاف", "عقوبة", "تحقيق", "احتجاج", "رفض",
      "controverse", "clash", "scandal", "banned", "suspended", "criticism",
    ],
  },
  // Records / historique (×14)
  record: {
    weight: 14,
    keywords: [
      "رقم قياسي", "تاريخي", "للمرة الأولى", "أول مرة", "إنجاز",
      "الأفضل في التاريخ", "حطم رقم", "بطولة",
      "record", "historic", "first time", "milestone", "achievement",
    ],
  },
  // Derby / Clásico / Finale (×15)
  bigmatch: {
    weight: 15,
    keywords: [
      "كلاسيكو", "الكلاسيكو", "ديربي", "نهائي", "نصف نهائي",
      "دوري أبطال", "الكأس",
      "clasico", "derby", "final", "semi-final", "champions league", "cup final",
    ],
  },
  // Clubs à haute audience arabe (×10)
  topclub: {
    weight: 10,
    keywords: [
      "ريال مدريد", "برشلونة", "باريس", "مانشستر", "ليفربول",
      "الهلال", "النصر", "الاتحاد", "الأهلي", "رونالدو", "مبابي",
      "real madrid", "barcelona", "psg", "manchester", "liverpool",
      "ronaldo", "mbappe", "haaland",
    ],
  },
  // Blessure joueur star (×8)
  injury: {
    weight: 8,
    keywords: [
      "إصابة", "يغيب", "خارج", "مصاب", "عملية جراحية",
      "injury", "injured", "out", "surgery", "absence",
    ],
  },
};

// Bonus temps (article récent = plus viral)
function freshnessBonus(publishedAt) {
  if (!publishedAt) return 0;
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
  if (ageHours < 1)  return 15;
  if (ageHours < 3)  return 10;
  if (ageHours < 6)  return 5;
  if (ageHours < 12) return 0;
  if (ageHours < 24) return -5;
  return -15;
}

function scoreArticle(article) {
  const text = [
    article.title || "",
    article.description || "",
    article.content?.slice(0, 500) || "",
  ].join(" ").toLowerCase();

  let score = 0;
  const matches = [];

  for (const [category, { weight, keywords }] of Object.entries(VIRAL_SIGNALS)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += weight;
        matches.push({ category, keyword: kw, weight });
        break; // Une seule fois par catégorie
      }
    }
  }

  // Bonus fraîcheur
  const fresh = freshnessBonus(article.publishedAt);
  score += fresh;

  // Bonus football (sport le plus viral)
  if (article.sport === "football") score += 5;

  // Cap à 100
  score = Math.min(100, Math.max(0, score));

  return { score, matches, freshnessBonus: fresh };
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   VIRAL SCORING — نبض الرياضة                       ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));

  const scored = articles.map((a) => {
    const { score, matches, freshnessBonus } = scoreArticle(a);
    return { ...a, viralScore: score };
  });

  // Trier par score décroissant
  const ranking = scored
    .filter((a) => a.viralScore > 0)
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, 50)
    .map((a) => ({
      slug:        a.slug,
      title:       a.title?.slice(0, 80),
      sport:       a.sport,
      viralScore:  a.viralScore,
      publishedAt: a.publishedAt,
    }));

  // Sauvegarder les scores
  fs.writeFileSync(SCORES_PATH, JSON.stringify(ranking, null, 2));

  // Mettre à jour les articles avec le score
  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(scored, null, 2));

  // Afficher le top 10
  console.log("🔥 Top 10 articles viraux :\n");
  ranking.slice(0, 10).forEach((a, i) => {
    const bar = "█".repeat(Math.round(a.viralScore / 10));
    console.log(`  ${i + 1}. [${a.viralScore}/100] ${bar}`);
    console.log(`     ${a.title}`);
    console.log(`     ${a.sport} · ${a.publishedAt?.slice(0, 10)}\n`);
  });

  console.log(`✅ ${ranking.length} articles scorés → content/viral-scores.json`);
  console.log(`📝 viralScore ajouté à seo-articles.json`);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
