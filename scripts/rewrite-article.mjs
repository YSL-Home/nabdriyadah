import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const inputPath = path.join(process.cwd(), "content/raw-news.json");
const outputPath = path.join(process.cwd(), "content/articles/seo-articles.json");

function cleanEnglish(text) {
  return text
    // supprime phrases anglaises complètes
    .replace(/[A-Za-z0-9 ,.'":\-()]+/g, "")
    // nettoie espaces
    .replace(/\s+/g, " ")
    .trim();
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function slugify(index) {
  return `article-${index + 1}`;
}

function buildImage(index) {
  const images = [
    "https://images.unsplash.com/photo-1508098682722-e99c643e7485",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018"
  ];
  return images[index % images.length];
}

async function rewriteArticle(article, index) {
  const title = article.originalTitle || article.title || "";
  const description = article.originalDescription || article.description || "";

  if (!OPENAI_API_KEY) {
    console.log("No API key → fallback");
    return fallback(article, index);
  }

  const prompt = `
قم بإعادة كتابة هذا الخبر الرياضي بالكامل باللغة العربية فقط.

المصدر:
${title}
${description}

التعليمات:
- ممنوع استخدام أي كلمة إنجليزية
- ترجم كل الأسماء الأجنبية للعربية (مثال: ريال مدريد)
- اكتب مقال احترافي 600 كلمة
- أسلوب صحفي
- SEO قوي

أرجع JSON فقط:
{
"title":"",
"description":"",
"content":"",
"keywords":[]
}
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await res.json();

    const content = data?.choices?.[0]?.message?.content;

    if (!content) return fallback(article, index);

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed) return fallback(article, index);

    return {
      title: cleanEnglish(parsed.title),
      description: cleanEnglish(parsed.description),
      content: cleanEnglish(parsed.content),
      keywords: parsed.keywords || [],
    };

  } catch (e) {
    console.log("error:", e.message);
    return fallback(article, index);
  }
}

function fallback(article, index) {
  return {
    title: `تحليل خبر رياضي ${index + 1}`,
    description: "تغطية رياضية عربية لأهم الأحداث.",
    content: "هذا مقال رياضي تحليلي باللغة العربية حول أبرز الأحداث في كرة القدم.",
    keywords: ["رياضة", "كرة القدم"]
  };
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  const results = [];

  for (let i = 0; i < raw.length; i++) {
    console.log("Rewriting:", raw[i].originalTitle);

    const rewritten = await rewriteArticle(raw[i], i);

    results.push({
      slug: slugify(i),
      title: rewritten.title,
      description: rewritten.description,
      content: rewritten.content,
      keywords: rewritten.keywords,
      image: buildImage(i)
    });
  }

  ensureDir(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("SEO articles saved:", results.length);
}

main();
