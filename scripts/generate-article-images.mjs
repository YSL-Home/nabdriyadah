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

// Visual style per sport/league — all described as original scenes, no logos, no trademarks
function buildVisualScene(sport = "football", league = "") {
  const scenes = {
    "premier-league": [
      "a packed football stadium at night, green pitch under floodlights, roaring crowd in stands, dramatic aerial view, cinematic photography",
      "two football players competing for a header in midfield, english stadium atmosphere, crowd blur in background, high-speed photography",
      "a football rolling across wet grass in a stadium, rain drops on pitch, shallow depth of field, sports photography"
    ],
    "la-liga": [
      "spanish football stadium interior, bright sunny afternoon, tifosi style fans with colorful scarves, pitch perfectly manicured",
      "football match action scene in a mediterranean stadium, intense tackle on grass, stadium lights",
      "close-up of football boots on pitch grass, spanish stadium background blur, golden hour light"
    ],
    "bundesliga": [
      "german football stadium full of fans in yellow and black, aerial view, evening floodlights",
      "football goalkeeper diving for save, german bundesliga stadium atmosphere, dramatic action",
      "training session at a german stadium, players warming up, morning light, professional photography"
    ],
    "serie-a": [
      "italian stadium architecture at sunset, marble stadium details, packed stands, cinematic",
      "football player celebrating goal in italian stadium, fans standing, emotional moment, telephoto lens",
      "midfield battle scene in an italian league match, grass texture close-up, stadium crowd blur"
    ],
    "ligue-1": [
      "french football stadium at dusk, city lights visible beyond stands, match underway, aerial cinematic",
      "football skill move on pitch, paris-style stadium atmosphere, evening match, blur crowd",
      "goalkeeper commands area in a french league stadium, training moment, wide angle"
    ],
    "champions-league": [
      "massive european football stadium at night, star-shaped spotlights, epic crowd energy, cinematic wide shot",
      "football player lifts trophy under stadium lights, confetti raining, emotional celebration",
      "two sets of players walking out of tunnel onto lit pitch, stadium electric atmosphere"
    ],
    "saudi-pro-league": [
      "modern middle eastern football stadium exterior at sunset, palm trees, golden architecture",
      "football match in a saudi stadium, vivid green pitch, enthusiastic fans in white thobes, evening",
      "stadium action shot in saudi arabia, floodlit pitch, dynamic play moment, photography"
    ],
    "eredivisie": [
      "dutch football stadium at golden hour, canal city visible behind stands, match day atmosphere",
      "football action in a compact european stadium, dutch fans waving flags, vivid colors",
      "training pitch in netherlands, windmill silhouette in background at sunset, professional football"
    ],
    "basketball": [
      "professional basketball arena with bright court lighting, hardwood floor perspective, empty arena before game",
      "basketball player driving to basket in a packed arena, crowd lights blur, dramatic action",
      "basketball going through net from below, arena ceiling and lights, dramatic upward shot"
    ],
    "tennis": [
      "tennis court aerial view, clay red surface, white lines, single player serving, dramatic shadow",
      "tennis ball close-up spinning mid-air over grass court, blurred player in background",
      "grand slam tournament atmosphere, packed stands, centre court, sunny day, cinematic wide"
    ],
    "padel": [
      "modern padel court interior with glass walls, clean bright lighting, two players mid-rally",
      "padel racket and ball close-up on blue court surface, shallow depth of field",
      "padel sports complex exterior at night, glass courts illuminated, modern architecture"
    ],
    "futsal": [
      "indoor futsal arena with bright overhead lights, small goals, polished floor, match in progress",
      "futsal players in fast motion, indoor hall, vibrant crowd, wide angle photography",
      "futsal ball on indoor court floor, goals visible, arena atmosphere, sports photography"
    ],
    "football": [
      "football stadium golden hour, packed stands, perfectly cut pitch, cinematic wide angle",
      "football player performing skill on pitch, stadium full of fans, action photography",
      "aerial view of football match in progress, bird's eye perspective, stadium surrounded by city"
    ]
  };

  const sportKey = league && scenes[league] ? league : (sport && scenes[sport] ? sport : "football");
  const options = scenes[sportKey];
  const idx = Math.floor(Math.random() * options.length);
  return options[idx];
}

function buildPrompt(article) {
  const title = normalizeText(article.title || "");
  const sport = normalizeText(article.sport || "football");
  const league = normalizeText(article.league || "");
  const scene = buildVisualScene(sport, league);

  return `Create a high-quality sports news article cover image.

Style requirements:
- Photorealistic, professional sports journalism photography style
- Horizontal/landscape orientation for web article header
- High contrast, vivid colors, dramatic lighting
- NO text, NO logos, NO jersey numbers, NO brand marks, NO watermarks, NO recognizable player faces
- NO team badges, NO sponsor logos, NO trademark symbols
- Original artistic composition inspired by sports atmosphere

Scene to depict:
${scene}

Context: Article about "${title.slice(0, 120)}"

The image should feel like a premium sports magazine cover photo: dynamic, emotional, and visually striking.`.trim();
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
