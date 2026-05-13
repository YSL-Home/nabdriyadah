/**
 * generate-cartoon-frames.mjs
 * Uses Leonardo.ai API to generate cartoon frames from a concept.
 * Manages a character library for visual consistency across videos.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
const LEONARDO_API = "https://cloud.leonardo.ai/api/rest/v1";

// Leonardo Anime XL — best for Sports Series cartoon style
const MODEL_ID = "e71a1c2f-4f80-4800-934f-2c68979d8cc8";

// Character library path — stores reference images for consistency
const CHARACTER_LIBRARY_PATH = path.join(ROOT, "content", "character-library.json");
const OUTPUT_DIR = path.join(ROOT, "public", "generated", "cartoons");

function loadCharacterLibrary() {
  if (fs.existsSync(CHARACTER_LIBRARY_PATH)) {
    return JSON.parse(fs.readFileSync(CHARACTER_LIBRARY_PATH, "utf-8"));
  }
  return {};
}

function saveCharacterLibrary(library) {
  fs.writeFileSync(CHARACTER_LIBRARY_PATH, JSON.stringify(library, null, 2));
}

async function leonardoRequest(endpoint, body) {
  const res = await fetch(`${LEONARDO_API}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LEONARDO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Leonardo API error ${res.status}: ${err}`);
  }

  return res.json();
}

async function pollGeneration(generationId, maxWaitMs = 120000) {
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 4000));

    const res = await fetch(
      `${LEONARDO_API}/generations/${generationId}`,
      { headers: { Authorization: `Bearer ${LEONARDO_API_KEY}` } }
    );

    const data = await res.json();
    const gen = data.generations_by_pk;

    if (gen?.status === "COMPLETE" && gen.generated_images?.length > 0) {
      return gen.generated_images[0].url;
    }

    if (gen?.status === "FAILED") {
      throw new Error("Leonardo generation failed");
    }

    console.log(`  ⏳ Génération en cours... (${Math.round((Date.now() - start) / 1000)}s)`);
  }

  throw new Error("Leonardo generation timeout");
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
}

/**
 * Generate cartoon frame for an article concept.
 * Returns local path to the generated image.
 *
 * @param {Object} concept - Output from generate-cartoon-concept.mjs
 * @returns {string} localImagePath
 */
export async function generateCartoonFrame(concept) {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const outputPath = path.join(OUTPUT_DIR, `${concept.article_slug}.png`);

  // Skip if already generated
  if (fs.existsSync(outputPath)) {
    console.log(`  ✓ Frame déjà générée: ${outputPath}`);
    return outputPath;
  }

  const library = loadCharacterLibrary();

  // Build character reference context from library
  const characterContext = concept.characters
    ?.map((c) => {
      const ref = library[c.name];
      return ref
        ? `${c.name} (style: use existing character design)`
        : `${c.name} (${c.action}, ${c.expression} expression)`;
    })
    .join(", ");

  // Full prompt combining concept + Sports Series style guidelines
  const fullPrompt = `${concept.prompt_en}, characters: ${characterContext || "football players"},
Sports Series cartoon style, caricature exaggerated features,
bold outlines, flat semi-detailed illustration, vibrant saturated colors,
professional motion design, clean composition, no text, no watermark,
portrait 9:16 aspect ratio, background color ${concept.background_color || "#7BB8D4"}`;

  const negativePrompt =
    "realistic, photo, 3d render, text, watermark, blurry, low quality, deformed, ugly";

  console.log(`  🎨 Génération Leonardo.ai pour: ${concept.article_title}`);
  console.log(`  Prompt: ${fullPrompt.substring(0, 100)}...`);

  const genData = await leonardoRequest("/generations", {
    modelId: MODEL_ID,
    prompt: fullPrompt,
    negative_prompt: negativePrompt,
    width: 608,
    height: 1080,
    num_images: 1,
    guidance_scale: 7,
    preset_style: "ILLUSTRATION",
    public: false,
  });

  const generationId = genData.sdGenerationJob?.generationId;
  if (!generationId) throw new Error("No generation ID returned");

  const imageUrl = await pollGeneration(generationId);
  await downloadImage(imageUrl, outputPath);

  // Cache first-time character appearances for consistency
  if (concept.characters) {
    let libraryUpdated = false;
    for (const char of concept.characters) {
      if (!library[char.name]) {
        library[char.name] = {
          first_seen: new Date().toISOString(),
          reference_slug: concept.article_slug,
          reference_url: imageUrl,
        };
        libraryUpdated = true;
        console.log(`  📚 Nouveau personnage ajouté à la bibliothèque: ${char.name}`);
      }
    }
    if (libraryUpdated) saveCharacterLibrary(library);
  }

  console.log(`  ✅ Frame générée: ${outputPath}`);
  return outputPath;
}

// CLI: node generate-cartoon-frames.mjs concept.json
if (process.argv[2]) {
  const concept = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
  generateCartoonFrame(concept).then(console.log).catch(console.error);
}
