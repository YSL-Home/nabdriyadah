/**
 * cartoon-video-pipeline.mjs
 * Orchestrates the full cartoon video generation pipeline:
 * Article → Gemini concept → Leonardo.ai frame → Kling AI animation → FFmpeg final video
 *
 * Drop-in enhancement for post-to-social.mjs
 * Usage: import { generateCartoonVideo } from "./cartoon-video-pipeline.mjs"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const FINAL_OUTPUT_DIR = path.join(ROOT, "public", "generated", "cartoons");
const BRANDING_LOGO = path.join(ROOT, "public", "logo.png");

// Lazy imports to avoid loading if not needed
let _generateConcept, _generateFrame, _animateFrame;

async function getConcept() {
  if (!_generateConcept) {
    const m = await import("./generate-cartoon-concept.mjs");
    _generateConcept = m.generateCartoonConcept;
  }
  return _generateConcept;
}

async function getFrameGen() {
  if (!_generateFrame) {
    const m = await import("./generate-cartoon-frames.mjs");
    _generateFrame = m.generateCartoonFrame;
  }
  return _generateFrame;
}

async function getAnimator() {
  if (!_animateFrame) {
    const m = await import("./animate-cartoon.mjs");
    _animateFrame = m.animateCartoonFrame;
  }
  return _animateFrame;
}

/**
 * Assemble final 9:16 video with branding using FFmpeg.
 * Adds nabdriyadah logo + sport label overlay.
 */
function assembleFinalVideo(animatedVideoPath, concept, finalOutputPath) {
  const sportLabel = concept.sport || "football";
  const logoExists = fs.existsSync(BRANDING_LOGO);

  // Build FFmpeg filter chain
  let filterComplex, inputs;

  if (logoExists) {
    inputs = `-i "${animatedVideoPath}" -i "${BRANDING_LOGO}"`;
    filterComplex = [
      // Scale animated video to 1080x1920
      `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[scaled]`,
      // Scale logo to fit top-right corner
      `[1:v]scale=160:-1[logo]`,
      // Overlay logo top-right with padding
      `[scaled][logo]overlay=W-w-20:20[with_logo]`,
      // Add sport label text bottom-left
      `[with_logo]drawtext=text='نبض الرياضة':fontcolor=white:fontsize=36:x=30:y=H-60:shadowcolor=black:shadowx=2:shadowy=2[out]`,
    ].join(";");
  } else {
    inputs = `-i "${animatedVideoPath}"`;
    filterComplex = [
      `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[scaled]`,
      `[scaled]drawtext=text='نبض الرياضة':fontcolor=white:fontsize=36:x=30:y=H-60:shadowcolor=black:shadowx=2:shadowy=2[out]`,
    ].join(";");
  }

  const cmd = [
    "ffmpeg -y",
    inputs,
    `-filter_complex "${filterComplex}"`,
    `-map "[out]"`,
    `-map 0:a?`,
    `-c:v libx264 -preset fast -crf 23`,
    `-c:a aac -b:a 128k`,
    `-r 30 -pix_fmt yuv420p`,
    `-t 15`,
    `"${finalOutputPath}"`,
  ].join(" ");

  console.log(`  🎞️  Assemblage FFmpeg...`);
  execSync(cmd, { stdio: "pipe" });
}

/**
 * Full pipeline: article → final cartoon video.
 * Returns path to the final video, or null if generation fails.
 *
 * @param {Object} article - Article from seo-articles.json
 * @returns {string|null} finalVideoPath
 */
export async function generateCartoonVideo(article) {
  const finalPath = path.join(FINAL_OUTPUT_DIR, `${article.slug}_final.mp4`);

  if (fs.existsSync(finalPath)) {
    console.log(`✓ Vidéo cartoon déjà existante: ${article.slug}`);
    return finalPath;
  }

  console.log(`\n🎬 Pipeline cartoon: ${article.title}`);

  try {
    // Step 1 — Generate satirical concept with Gemini
    console.log(`[1/4] Concept Gemini...`);
    const generateConcept = await getConcept();
    const concept = await generateConcept(article);
    console.log(`  ✓ Concept: ${concept.metaphor}`);

    // Step 2 — Generate cartoon frame with Leonardo.ai
    console.log(`[2/4] Frame Leonardo.ai...`);
    const generateFrame = await getFrameGen();
    const framePath = await generateFrame(concept);

    // Step 3 — Animate with Kling AI
    console.log(`[3/4] Animation Kling AI...`);
    const animateFrame = await getAnimator();
    const animatedPath = await animateFrame(framePath, article.slug);

    // Step 4 — Assemble final video with FFmpeg + branding
    console.log(`[4/4] Assemblage final...`);
    fs.mkdirSync(FINAL_OUTPUT_DIR, { recursive: true });
    assembleFinalVideo(animatedPath, concept, finalPath);

    console.log(`✅ Vidéo cartoon prête: ${finalPath}\n`);
    return finalPath;
  } catch (err) {
    console.error(`❌ Échec pipeline cartoon pour ${article.slug}: ${err.message}`);
    return null;
  }
}

/**
 * Batch process articles — picks top N articles without cartoon videos.
 *
 * @param {Array} articles - Array of article objects
 * @param {number} limit - Max videos to generate per run
 */
export async function batchGenerateCartoonVideos(articles, limit = 5) {
  const pending = articles.filter((a) => {
    const finalPath = path.join(FINAL_OUTPUT_DIR, `${a.slug}_final.mp4`);
    return !fs.existsSync(finalPath);
  });

  console.log(`📋 ${pending.length} articles sans vidéo cartoon (limite: ${limit})`);

  const toProcess = pending.slice(0, limit);
  const results = [];

  for (const article of toProcess) {
    const videoPath = await generateCartoonVideo(article);
    if (videoPath) results.push({ slug: article.slug, path: videoPath });

    // Respect API rate limits
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\n✅ ${results.length}/${toProcess.length} vidéos générées`);
  return results;
}

// CLI: node cartoon-video-pipeline.mjs '{"slug":"test","title":"..."}'
if (process.argv[2]) {
  const article = JSON.parse(process.argv[2]);
  generateCartoonVideo(article).then(console.log).catch(console.error);
}
