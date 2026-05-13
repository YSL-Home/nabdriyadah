/**
 * demo-cartoon-pipeline.mjs
 * Démo complète du pipeline cartoon — fonctionne avec les secrets EXISTANTS :
 *   ANTHROPIC_API_KEY  → concept satirique (Claude Haiku)
 *   OPENAI_API_KEY     → image cartoon (DALL-E 3)
 *   ffmpeg             → vidéo finale 9:16 avec branding
 *
 * Produit : public/generated/cartoons/demo_[slug].mp4 + demo_[slug].png
 * Commit  : pousse automatiquement sur main pour preuve en ligne
 */

import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ARTICLES_PATH = path.join(ROOT, "content/articles/seo-articles.json");
const OUTPUT_DIR = path.join(ROOT, "public/generated/cartoons");
const DEMO_LOG_PATH = path.join(ROOT, "content/demo-cartoon-result.json");

if (!ANTHROPIC_KEY || !OPENAI_KEY) {
  console.error("❌ ANTHROPIC_API_KEY ou OPENAI_API_KEY manquant");
  process.exit(1);
}

// ── Étape 1 : sélectionner l'article football le plus récent ────────────────
function pickArticle() {
  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));
  const football = articles
    .filter((a) => a.sport === "football" && a.title && a.description)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return football[0];
}

// ── Étape 2 : générer le concept satirique avec Claude Haiku ────────────────
async function generateConcept(article) {
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `Tu es un directeur artistique de contenu cartoon sportif.

Article: "${article.title}"
Description: "${article.description?.slice(0, 200)}"

Génère un concept visuel satirique en JSON:
{
  "metaphor": "la métaphore visuelle centrale (1 phrase)",
  "scene": "description complète de la scène en anglais pour génération d'image",
  "prompt_dalle": "Prompt complet DALL-E 3: cartoon caricature style, Sports Series style, flat design, bold colors, [décris la scène complète avec personnages et action], portrait 9:16, no text, professional motion design illustration, vibrant colors, black outlines",
  "mood": "tonalité (satirique/dramatique/humoristique)"
}

Réponds UNIQUEMENT avec le JSON, sans markdown.`,
      },
    ],
  });

  const raw = response.content[0].text.trim();
  return JSON.parse(raw);
}

// ── Étape 3 : générer l'image cartoon avec DALL-E 3 ─────────────────────────
async function generateImage(concept, slug) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, `demo_${slug}.png`);

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: concept.prompt_dalle,
      n: 1,
      size: "1024x1792",
      quality: "hd",
      style: "vivid",
      response_format: "url",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DALL-E error: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const imageUrl = data.data[0].url;

  // Télécharger l'image
  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}

// ── Étape 4 : créer vidéo 9:16 avec FFmpeg ──────────────────────────────────
function generateVideo(imagePath, slug, sportTag = "FOOTBALL") {
  const outputPath = path.join(OUTPUT_DIR, `demo_${slug}.mp4`);
  const siteText = "nabdriyadah.com";

  const ffmpegCmd = [
    "ffmpeg", "-y",
    "-loop", "1",
    "-t", "15",
    "-i", `"${imagePath}"`,
    "-vf", [
      "scale=1080:1920:force_original_aspect_ratio=increase",
      "crop=1080:1920",
      "zoompan=z='min(zoom+0.0004,1.1)':d=450:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',scale=1080:1920",
      "drawbox=x=0:y=h-140:w=iw:h=140:color=black@0.7:t=fill",
      `drawtext=text='${siteText}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=h-95:font=Arial`,
      `drawtext=text='${sportTag}':fontcolor=white@0.6:fontsize=26:x=(w-text_w)/2:y=h-50:font=Arial`,
    ].join(","),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-r", "30",
    "-crf", "22",
    "-preset", "fast",
    `"${outputPath}"`,
  ].join(" ");

  execSync(ffmpegCmd, { stdio: "pipe", timeout: 120000 });
  return outputPath;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   DÉMO CARTOON PIPELINE — نبض الرياضة               ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // Vérifier ffmpeg
  try { execSync("ffmpeg -version", { stdio: "pipe" }); }
  catch { console.error("❌ ffmpeg non disponible"); process.exit(1); }

  // 1. Sélectionner article
  console.log("[1/4] 📰 Sélection de l'article le plus récent...");
  const article = pickArticle();
  console.log(`  → "${article.title?.slice(0, 70)}"`);
  console.log(`  → Slug: ${article.slug}`);

  // 2. Générer concept
  console.log("\n[2/4] 🧠 Génération du concept satirique (Claude Haiku)...");
  const concept = await generateConcept(article);
  console.log(`  → Métaphore: ${concept.metaphor}`);
  console.log(`  → Ambiance: ${concept.mood}`);
  console.log(`  → Scène: ${concept.scene?.slice(0, 100)}...`);

  // 3. Générer image
  console.log("\n[3/4] 🎨 Génération image cartoon (DALL-E 3 HD)...");
  const imagePath = await generateImage(concept, article.slug);
  const imgSize = (fs.statSync(imagePath).size / 1024).toFixed(0);
  console.log(`  → Image générée: ${imagePath} (${imgSize} KB)`);

  // 4. Créer vidéo
  console.log("\n[4/4] 🎬 Création vidéo 9:16 (FFmpeg)...");
  const videoPath = generateVideo(imagePath, article.slug, article.sport?.toUpperCase() || "FOOTBALL");
  const vidSize = (fs.statSync(videoPath).size / 1024 / 1024).toFixed(1);
  console.log(`  → Vidéo créée: ${videoPath} (${vidSize} MB)`);

  // Sauvegarder le résultat de la démo
  const result = {
    demo_run_at: new Date().toISOString(),
    article: {
      slug: article.slug,
      title: article.title,
      sport: article.sport,
      publishedAt: article.publishedAt,
    },
    concept,
    outputs: {
      image: `/generated/cartoons/demo_${article.slug}.png`,
      video: `/generated/cartoons/demo_${article.slug}.mp4`,
      image_size_kb: Number(imgSize),
      video_size_mb: Number(vidSize),
    },
  };

  fs.writeFileSync(DEMO_LOG_PATH, JSON.stringify(result, null, 2));

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   ✅ DÉMO TERMINÉE AVEC SUCCÈS                       ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`\n📊 Résultat sauvegardé: content/demo-cartoon-result.json`);
  console.log(`🖼️  Image: public${result.outputs.image}`);
  console.log(`🎬 Vidéo: public${result.outputs.video}`);
}

main().catch((e) => {
  console.error("\n❌ Erreur démo:", e.message);
  process.exit(1);
});
