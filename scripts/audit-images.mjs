/**
 * audit-images.mjs — Audit et correction des images d'articles
 *
 * Pour chaque article dans seo-articles.json :
 *   1. Détecte un mismatch entre article.sport et le préfixe du slug
 *   2. Détecte les images dont le fichier PNG n'existe pas dans public/generated/
 *   3. Pour les articles avec mauvaise image : supprime le PNG si existant, met article.image = null
 *
 * NE régénère PAS les images — ça sera fait par generate-article-images.mjs au prochain run.
 */

import fs from "fs";
import path from "path";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const GENERATED_DIR = path.join(process.cwd(), "public/generated");

// Mapping préfixe de slug → sport attendu
const PREFIX_TO_SPORT = {
  "bball-":  "basketball",
  "tennis-": "tennis",
  "padel-":  "padel",
  "futsal-": "futsal",
  // Tous les préfixes football
  "ft-":     "football",
  "epl-":    "football",
  "liga-":   "football",
  "ucl-":    "football",
  "bund-":   "football",
  "seriea-": "football",
  "l1-":     "football",
  "saudi-":  "football",
  "mls-":    "football",
};

/**
 * Détermine le sport attendu d'après le préfixe du slug.
 * Retourne null si aucun préfixe reconnu.
 */
function sportFromSlug(slug) {
  if (!slug) return null;
  for (const [prefix, sport] of Object.entries(PREFIX_TO_SPORT)) {
    if (slug.startsWith(prefix)) return sport;
  }
  return null;
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function main() {
  const articles = safeReadJson(ARTICLES_PATH);

  if (!Array.isArray(articles) || articles.length === 0) {
    console.log("Aucun article trouvé, audit ignoré.");
    process.exit(0);
  }

  let mismatchFixed   = 0;
  let missingFixed    = 0;
  let alreadyNull     = 0;
  let ok              = 0;
  let changed         = false;

  for (const article of articles) {
    const slug = (article.slug || "").trim();
    if (!slug) continue;

    const imgField    = article.image || null;
    const articleSport = (article.sport || "").toLowerCase().trim();

    // ── 1. Vérifier le mismatch sport / préfixe de slug ─────────────────
    const expectedSport = sportFromSlug(slug);
    const hasMismatch   = expectedSport !== null && articleSport !== "" && expectedSport !== articleSport;

    if (hasMismatch) {
      console.log(
        `[MISMATCH] slug="${slug}" sport="${articleSport}" mais préfixe → "${expectedSport}"` +
        (imgField ? ` image="${imgField}"` : " image=null")
      );

      // Supprimer le fichier PNG si existant
      const pngPath = path.join(GENERATED_DIR, `${slug}.png`);
      if (fs.existsSync(pngPath)) {
        try {
          fs.unlinkSync(pngPath);
          console.log(`  Supprimé: ${pngPath}`);
        } catch (e) {
          console.log(`  Impossible de supprimer ${pngPath}: ${e.message}`);
        }
      }

      // Corriger le champ sport dans l'article
      article.sport  = expectedSport;
      article.image  = null;
      changed         = true;
      mismatchFixed++;
      continue;
    }

    // ── 2. Vérifier que le fichier image existe réellement ───────────────
    if (imgField && imgField.startsWith("/generated/")) {
      const fileName = path.basename(imgField);
      const pngPath  = path.join(GENERATED_DIR, fileName);

      if (!fs.existsSync(pngPath)) {
        console.log(`[MISSING]  slug="${slug}" image="${imgField}" introuvable sur disque`);
        article.image = null;
        changed        = true;
        missingFixed++;
        continue;
      }
    }

    // ── Cas article.image déjà null ──────────────────────────────────────
    if (!imgField) {
      alreadyNull++;
      continue;
    }

    ok++;
  }

  // ── Écrire le JSON si des corrections ont eu lieu ────────────────────────
  if (changed) {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
  }

  // ── Rapport ──────────────────────────────────────────────────────────────
  console.log("\n── Rapport audit-images ──────────────────────────────────────");
  console.log(`  Total articles        : ${articles.length}`);
  console.log(`  OK (image valide)     : ${ok}`);
  console.log(`  Déjà sans image       : ${alreadyNull}`);
  console.log(`  Corrigés (mismatch)   : ${mismatchFixed}`);
  console.log(`  Corrigés (manquants)  : ${missingFixed}`);
  console.log(`  JSON mis à jour       : ${changed ? "oui" : "non (aucun changement)"}`);
  console.log("──────────────────────────────────────────────────────────────\n");
}

main();
