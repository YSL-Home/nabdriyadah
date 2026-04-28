import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FORCE_REGENERATE = process.env.FORCE_REGENERATE_IMAGES === "true";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const OUTPUT_DIR = path.join(process.cwd(), "public/generated");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

// Extract meaningful visual keywords from article title/description
function extractVisualKeywords(article) {
  const text = `${article.title || ""} ${article.description || ""} ${(article.keywords || []).join(" ")}`;

  // Detect transfer/departure
  if (/رحيل|يغادر|يُودّع|انتقال|صفقة|تعاقد|ينضم/.test(text)) return "transfer";
  // Detect trophy/title/championship
  if (/لقب|بطولة|كأس|تتويج|يرفع|الفوز|بطل/.test(text)) return "trophy";
  // Detect injury
  if (/إصابة|غياب|يتعافى|يعود/.test(text)) return "injury";
  // Detect press conference / statement
  if (/مؤتمر|تصريح|يؤكد|كشف|قال|يرفض/.test(text)) return "statement";
  // Detect match / game action
  if (/مباراة|هدف|فاز|تعادل|خسر|نتيجة|الجولة|لقاء/.test(text)) return "match";
  // Detect training / performance
  if (/تدريب|استعداد|موسم|أداء|تحليل/.test(text)) return "training";
  return "general";
}

// Build a rich, content-aware visual scene description
function buildVisualScene(sport, league, article) {
  const context = extractVisualKeywords(article);

  // Sport-specific environments
  const environments = {
    "premier-league":    { bg: "iconic english football stadium at night, emerald pitch under floodlights, packed terraces of 60 000 fans, north london or manchester skyline visible", light: "cinematic blue-white stadium floodlights, high contrast, dramatic shadows" },
    "la-liga":           { bg: "mediterranean football stadium on a bright sunday afternoon, terracotta architecture visible beyond stands, pitch immaculately manicured, sold-out capacity", light: "warm golden hour sunlight cutting across the pitch, long player shadows" },
    "bundesliga":        { bg: "iconic german football stadium, lower ring packed in vibrant yellow, tifo display visible, city skyline at dusk", light: "stadium floodlights mixed with sunset orange glow" },
    "serie-a":           { bg: "grand italian football stadium, marble colonnades visible, packed curva stand with scarves, roman architecture detail", light: "late afternoon mediterranean light, warm amber tones" },
    "champions-league":  { bg: "enormous european football stadium at night, star-shaped spotlights, 80 000 seat capacity full, anthem atmosphere, confetti in the air", light: "dramatic blue UEFA-style lighting, intense spotlights from above" },
    "saudi-pro-league":  { bg: "ultra-modern middle eastern football stadium, palm trees silhouetted, fans in white thobes, gold architectural accents on facades", light: "desert twilight purple and gold sky, vivid green pitch" },
    "basketball":        { bg: "iconic NBA-style basketball arena, gleaming hardwood court, 20 000-seat sold-out venue, spotlight-lit court from above, rafter banners", light: "intense cool-white arena spotlights on the court, crowd in dramatic blur" },
    "tennis":            { bg: "grand slam centre court, red clay or manicured grass, full grandstand, tournament atmosphere, dramatic shadow across baseline", light: "bright afternoon sun, sharp player shadow on court surface" },
    "padel":             { bg: "professional padel court with panoramic glass walls, premium indoor sports complex, court lit in electric blue-white, modern stadium seating", light: "crisp bright indoor LED lighting, reflections in glass walls" },
    "futsal":            { bg: "indoor futsal arena, polished wooden floor, compact goals, passionate crowd close to pitch, vibrant colorful stands", light: "overhead industrial stadium lights, bright and even" },
    "football":          { bg: "football stadium at golden hour, packed stands, perfectly cut pitch, city skyline glowing in background", light: "golden hour sunlight, dramatic long shadows across the pitch" },
  };

  // Context-specific action layers
  const actions = {
    transfer:  "lone athletic figure standing at the edge of the pitch staring into the distance, suitcase silhouette metaphor, emotional farewell composition, shallow depth of field",
    trophy:    "large golden trophy sitting on the pitch grass, confetti raining from above, celebration atmosphere, dramatic low-angle hero shot",
    injury:    "medical staff and physiotherapist silhouettes on the pitch, focused and professional, golden hour backlight, empty stadium in background",
    statement: "press conference podium on pitch, microphones, dramatic spotlight from above on empty chair, anticipation atmosphere",
    match:     "intense athletic duel, two silhouetted players competing at peak athletic moment, motion blur, crowd energy in background",
    training:  "lone athlete silhouetted against a goal, dawn light on pitch, precision and focus, wide angle cinematic framing",
    general:   "sweeping aerial view of packed stadium, bird's eye perspective, geometric patterns of stands and pitch, crowd color mosaic",
  };

  const sportKey = (league && environments[league]) ? league : (sport && environments[sport] ? sport : "football");
  const env = environments[sportKey];
  const action = actions[context] || actions.general;

  return `${env.bg}. Scene: ${action}. Lighting: ${env.light}.`;
}

function buildPrompt(article) {
  const title = normalizeText(article.title || "");
  const sport = normalizeText(article.sport || "football");
  const league = normalizeText(article.league || "");
  const scene = buildVisualScene(sport, league, article);

  // Extract up to 3 content keywords for extra specificity
  const kw = (article.keywords || []).filter(k => k && k.length > 2).slice(0, 3).join(", ");

  return `You are generating a professional sports news article header image for an Arabic sports news website.

STRICT RULES — never violate:
- NO text, letters, numbers, captions, watermarks, or UI elements anywhere in the image
- NO recognizable real player faces or portraits
- NO team logos, club badges, sponsor marks, jersey numbers, or brand trademarks
- NO flags used as main subject (background crowd flags are OK)
- Photorealistic photography style only — no illustration, no cartoon, no painting
- Horizontal/landscape format (16:9 ratio), suitable for a web article banner

VISUAL COMPOSITION:
${scene}

ARTICLE CONTEXT (for tonal reference only — do NOT add text):
Topic: "${title.slice(0, 100)}"
${kw ? `Themes: ${kw}` : ""}

QUALITY TARGET:
- Premium sports journalism photography, like Getty Images or AFP wire photo
- Emotionally resonant, visually striking, immediately communicates the sport's energy
- High contrast, rich colors, sharp focus on the main subject with cinematic depth of field
- The image must feel SPECIFIC to this article's story, not a generic stock photo`.trim();
}

async function tryGptImage1(prompt) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1536x1024",
      quality: "medium",
      output_format: "png"
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`gpt-image-1 error: ${JSON.stringify(data?.error || data)}`);

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("gpt-image-1: no image data returned");
  return b64;
}

async function tryDallE3(prompt) {
  const truncated = prompt.slice(0, 900);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: truncated,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      response_format: "b64_json"
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`dall-e-3 error: ${JSON.stringify(data?.error || data)}`);

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("dall-e-3: no image data returned");
  return b64;
}

async function generateImageBase64(prompt) {
  try {
    return await tryGptImage1(prompt);
  } catch (e1) {
    console.log(`  gpt-image-1 failed (${e1.message.slice(0, 80)}), trying dall-e-3...`);
    return await tryDallE3(prompt);
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadImage(url, destPath) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("image")) throw new Error(`Not an image: ${contentType}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 5000) throw new Error("Image too small, likely a placeholder");
  fs.writeFileSync(destPath, buffer);
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY missing, skipping image generation.");
    process.exit(0);
  }

  const articles = safeReadJson(ARTICLES_PATH);

  if (!Array.isArray(articles) || articles.length === 0) {
    console.log("No articles found, skipping image generation.");
    process.exit(0);
  }

  ensureDir(OUTPUT_DIR);

  let changed = false;

  for (const article of articles) {
    const slug = normalizeText(article.slug || "");
    if (!slug) continue;

    const fileName = `${slug}.png`;
    const absoluteImagePath = path.join(OUTPUT_DIR, fileName);
    const publicImagePath = `/generated/${fileName}`;

    // Skip if image already exists and is not Unsplash / not forced
    const alreadyGenerated = fs.existsSync(absoluteImagePath);
    const isUnsplash = (article.image || "").includes("unsplash.com");

    if (!FORCE_REGENERATE && alreadyGenerated && !isUnsplash) {
      if (article.image !== publicImagePath) {
        article.image = publicImagePath;
        changed = true;
      }
      console.log(`Image exists: ${slug}`);
      continue;
    }

    // Try RSS image URL first (free, no API cost)
    const rssImageUrl = article.imageUrl;
    if (rssImageUrl && !FORCE_REGENERATE) {
      try {
        console.log(`Downloading RSS image: ${slug}`);
        await downloadImage(rssImageUrl, absoluteImagePath);
        article.image = publicImagePath;
        changed = true;
        console.log(`  Downloaded from RSS: ${fileName}`);
        continue;
      } catch (dlErr) {
        console.log(`  RSS image download failed (${dlErr.message.slice(0, 60)}), falling back to AI...`);
      }
    }

    // AI generation fallback
    try {
      console.log(`Generating image: ${slug} (sport: ${article.sport || "football"})`);
      const prompt = buildPrompt(article);
      const base64 = await generateImageBase64(prompt);
      fs.writeFileSync(absoluteImagePath, Buffer.from(base64, "base64"));
      article.image = publicImagePath;
      changed = true;
      console.log(`  Generated: ${fileName}`);
      await sleep(1500);
    } catch (error) {
      console.log(`  Image failed for ${slug}: ${error.message}`);
    }
  }

  if (changed) {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
    console.log("Updated articles with generated image paths.");
  }

  console.log("Image generation finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
