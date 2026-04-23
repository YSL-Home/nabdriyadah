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

function buildLeagueStyle(league = "") {
  if (league === "premier-league") {
    return "مشهد كروي احترافي بطابع الدوري الإنجليزي الممتاز، أجواء ملعب أوروبية، طاقة عالية، تغطية صحفية رياضية";
  }

  if (league === "la-liga") {
    return "مشهد كروي احترافي بطابع الدوري الإسباني، أجواء ملعب أوروبية، لمسة بصرية أنيقة، تغطية صحفية رياضية";
  }

  return "مشهد كرة قدم احترافي، أجواء ملعب حديث، طابع صحفي رياضي عربي، صورة غلاف لموقع رياضي";
}

function buildPrompt(article) {
  const title = normalizeText(article.title || "");
  const description = normalizeText(article.description || "");
  const league = normalizeText(article.league || "");
  const keywords = Array.isArray(article.keywords) ? article.keywords.slice(0, 5).join("، ") : "";
  const leagueStyle = buildLeagueStyle(league);

  return `
أنشئ صورة غلاف احترافية لمقال رياضي عربي.

المطلوب:
- صورة أفقية لموقع أخبار رياضية
- أسلوب بصري واقعي واحترافي وقريب من أغلفة المواقع الرياضية الحديثة
- بدون أي كتابة أو نص أو شعارات أو علامات مائية
- بدون وجوه مشهورة محددة أو شخصيات معروفة
- تركيز على كرة القدم أو أجواء الملاعب أو لحظة رياضية معبرة
- تكوين بصري قوي يصلح كصورة رئيسية لمقال
- ألوان واضحة وتباين جيد
- لا تجعل الصورة كرتونية

معلومات المقال:
- العنوان: ${title}
- الوصف: ${description}
- البطولة: ${league}
- الكلمات المفتاحية: ${keywords}

الطابع المطلوب:
${leagueStyle}
`.trim();
}

async function generateImageBase64(prompt) {
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

  if (!response.ok) {
    throw new Error(`Image API error: ${JSON.stringify(data)}`);
  }

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("No image data returned from OpenAI");
  }

  return b64;
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
      console.log(`Image already exists for ${slug}`);
      continue;
    }

    try {
      console.log(`Generating image for ${slug}`);
      const prompt = buildPrompt(article);
      const base64 = await generateImageBase64(prompt);
      fs.writeFileSync(absoluteImagePath, Buffer.from(base64, "base64"));
      article.image = publicImagePath;
      changed = true;
    } catch (error) {
      console.log(`Failed to generate image for ${slug}: ${error.message}`);
    }
  }

  if (changed) {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
  }

  console.log("Image generation finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
