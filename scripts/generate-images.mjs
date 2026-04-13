import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

const INPUT = "content/articles/seo-articles.json";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function cleanArabic(value = "") {
  return String(value)
    .replace(/[A-Za-z]/g, " ")
    .replace(/[^\u0600-\u06FF0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value = "") {
  return cleanArabic(value)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function needsArabicTextImage(article) {
  const title = normalizeText(article.title || "");
  const keywords = [
    "الدوري",
    "ريال",
    "برشلونة",
    "مانشستر",
    "نهائي",
    "كأس",
    "مباراة",
    "الهلال",
    "النصر",
    "ليفربول",
    "أرسنال",
    "تشيلسي",
    "بايرن",
    "يوفنتوس",
  ];

  return keywords.some((k) => title.includes(k));
}

function buildOpenAIPrompt(article) {
  const title = cleanArabic(article.title || "خبر رياضي");
  const description = cleanArabic(article.description || "");

  return `
Create a professional sports editorial image.
No text in the image.
No watermark.
No logo.
Modern football news visual.
Arabic sports website style.
Main theme: ${title}
Context: ${description}
Color style: green, white, dark neutral.
High contrast, dramatic sports lighting, premium editorial composition.
`;
}

function buildGeminiPrompt(article) {
  const title = cleanArabic(article.title || "خبر رياضي");
  const description = cleanArabic(article.description || "");

  return `
أنشئ وصفاً احترافياً لصورة خبر رياضي عربية.
المطلوب:
- صورة رياضية احترافية
- مسموح بنص عربي واضح داخل التصميم
- بدون أي نص إنجليزي
- طابع إخباري حديث
- ألوان متناسقة مع موقع رياضي عربي
- يفضل الأخضر والأبيض مع لمسات داكنة
- صياغة مناسبة لتصميم صورة غلاف خبر

العنوان:
${title}

الوصف:
${description}

أعد فقط وصفاً قصيراً جداً صالحاً لتوليد صورة.
`;
}

async function createOpenAIImage(article) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: buildOpenAIPrompt(article),
        size: "1024x1024",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.log("OpenAI image error:", err);
      return null;
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;

    if (!b64) return null;

    return Buffer.from(b64, "base64");
  } catch (error) {
    console.log("OpenAI image generation failed:", error.message);
    return null;
  }
}

async function createGeminiImage(article) {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const prompt = buildGeminiPrompt(article);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.log("Gemini prompt error:", err);
      return null;
    }

    const data = await res.json();
    const promptText =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join(" ").trim() || "";

    if (!promptText) return null;

    return await createOpenAIImage({
      ...article,
      title: cleanArabic(article.title),
      description: cleanArabic(promptText),
    });
  } catch (error) {
    console.log("Gemini flow failed:", error.message);
    return null;
  }
}

function buildFallbackSvg(article) {
  const title = cleanArabic(article.title || "خبر رياضي");
  const shortTitle = title.slice(0, 90);
  const league = cleanArabic(article.source || "كرة القدم");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#1f6b3a"/>
        <stop offset="100%" stop-color="#8BC34A"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <rect x="40" y="40" width="1120" height="550" rx="28" fill="rgba(255,255,255,0.08)"/>
    <text x="1080" y="150" font-size="42" fill="#ffffff" font-family="Arial" text-anchor="end">نبض الرياضة</text>
    <text x="1080" y="250" font-size="58" fill="#ffffff" font-family="Arial" font-weight="700" text-anchor="end">${shortTitle}</text>
    <text x="1080" y="340" font-size="34" fill="#eef7ef" font-family="Arial" text-anchor="end">${league}</text>
    <circle cx="150" cy="180" r="72" fill="rgba(255,255,255,0.18)"/>
    <circle cx="150" cy="180" r="44" fill="rgba(255,255,255,0.32)"/>
    <rect x="90" y="390" width="180" height="18" rx="9" fill="rgba(255,255,255,0.25)"/>
    <rect x="90" y="430" width="260" height="18" rx="9" fill="rgba(255,255,255,0.18)"/>
    <rect x="90" y="470" width="220" height="18" rx="9" fill="rgba(255,255,255,0.18)"/>
  </svg>`;

  return Buffer.from(svg);
}

async function uploadBufferToCloudinary(buffer, publicId) {
  const dataUri = `data:image/png;base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "nabdriyadah/articles",
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });

  return result.secure_url;
}

async function generateImageBuffer(article) {
  if (needsArabicTextImage(article)) {
    const geminiFirst = await createGeminiImage(article);
    if (geminiFirst) return geminiFirst;
  }

  const openai = await createOpenAIImage(article);
  if (openai) return openai;

  return buildFallbackSvg(article);
}

function buildPublicId(article) {
  const base = slugify(article.title || "article-image") || "article-image";
  const hash = crypto
    .createHash("md5")
    .update(`${article.title}-${article.source}-${article.publishedAt || ""}`)
    .digest("hex")
    .slice(0, 8);

  return `${base}-${hash}`;
}

async function main() {
  const raw = await fs.readFile(INPUT, "utf-8");
  const articles = JSON.parse(raw);

  if (!Array.isArray(articles) || !articles.length) {
    throw new Error("seo-articles.json is empty");
  }

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    try {
      const imageBuffer = await generateImageBuffer(article);
      const publicId = buildPublicId(article);
      const imageUrl = await uploadBufferToCloudinary(imageBuffer, publicId);

      article.image = imageUrl;
      article.imageAlt = cleanArabic(article.title || "صورة خبر رياضي");
      article.imagePublicId = `nabdriyadah/articles/${publicId}`;

      console.log(`✅ image ok: ${article.title}`);
    } catch (error) {
      console.log(`❌ image failed: ${article.title}`);
      console.log(error.message);
      article.image = "";
      article.imageAlt = cleanArabic(article.title || "صورة خبر رياضي");
    }
  }

  await fs.writeFile(INPUT, JSON.stringify(articles, null, 2), "utf-8");
  console.log("✅ Cloudinary images generated and saved");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
