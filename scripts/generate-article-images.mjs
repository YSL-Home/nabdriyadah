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

function buildSportStyle(league = "") {
  const styles = {
    "premier-league": "ملعب كرة قدم إنجليزي، أجواء احترافية أوروبية، إضاءة قوية، حشود غفيرة، صورة صحفية رياضية",
    "la-liga": "ملعب كرة قدم إسباني، أجواء حارة ومتوسطية، ألوان زاهية، لحظة رياضية مشوقة",
    "basketball": "ملعب كرة سلة احترافي، إضاءة ساطعة، طاقة عالية، لاعبون في حركة، طابع NBA",
    "padel": "ملعب بادل احترافي، زجاج شفاف، إضاءة داخلية، أجواء رياضية حديثة",
    "tennis": "ملعب تنس احترافي، سطح أحمر أو أزرق، لحظة ضرب كرة، طابع بطولة كبرى",
    "futsal": "ملعب كرة قدم صالات، أجواء ساخنة، طاقة عالية، لاعبون في حركة سريعة",
    "mixed": "ملعب رياضي احترافي حديث، أجواء تنافسية، طابع صحفي رياضي عربي"
  };
  return styles[league] || styles["mixed"];
}

function buildPrompt(article) {
  const title = normalizeText(article.title || "");
  const description = normalizeText(article.description || "");
  const league = normalizeText(article.league || "");
  const keywords = Array.isArray(article.keywords) ? article.keywords.slice(0, 5).join("، ") : "";
  const sportStyle = buildSportStyle(league);

  return `
صورة غلاف احترافية لمقال رياضي عربي.

المطلوب:
- صورة أفقية لموقع أخبار رياضية
- أسلوب واقعي واحترافي كأغلفة المواقع الرياضية الحديثة
- بدون أي نص أو شعارات أو علامات مائية أو وجوه مشهورة
- تركيز على الرياضة أو أجواء الملاعب أو لحظة رياضية معبرة
- تكوين بصري قوي، ألوان واضحة، تباين جيد
- ليست كرتونية

المقال:
- العنوان: ${title}
- الوصف: ${description}
- الرياضة/البطولة: ${league}
- الكلمات المفتاحية: ${keywords}

الطابع البصري المطلوب: ${sportStyle}
`.trim();
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
    console.log(`gpt-image-1 failed (${e1.message}), trying dall-e-3...`);
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

    if (!FORCE_REGENERATE && fs.existsSync(absoluteImagePath)) {
      if (article.image !== publicImagePath) {
        article.image = publicImagePath;
        changed = true;
      }
      console.log(`Image exists: ${slug}`);
      continue;
    }

    try {
      console.log(`Generating image: ${slug}`);
      const prompt = buildPrompt(article);
      const base64 = await generateImageBase64(prompt);
      fs.writeFileSync(absoluteImagePath, Buffer.from(base64, "base64"));
      article.image = publicImagePath;
      changed = true;
      await sleep(1200);
    } catch (error) {
      console.log(`Image failed for ${slug}: ${error.message}`);
    }
  }

  if (changed) {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
    console.log("Updated articles with new image paths.");
  }

  console.log("Image generation finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
