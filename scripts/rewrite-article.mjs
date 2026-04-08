import fs from "fs";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

async function rewriteOne(item, index) {
  const topic = item.title || `Article ${index + 1}`;
  const summary = item.summary || "No summary available.";

  const prompt = `
أنت محرر SEO عربي لموقع رياضي اسمه "نبض الرياضة".

أعد كتابة الخبر بالعربية الطبيعية.

أرجع JSON صالح فقط بهذا الشكل:
{
  "title": "",
  "shortTitle": "",
  "description": "",
  "content": ["", "", "", "", ""],
  "faq": [{"q": "", "a": ""}, {"q": "", "a": ""}],
  "keywords": ["", "", "", ""]
}

العنوان: ${topic}
الملخص: ${summary}
المصدر: ${item.source}

قواعد:
- لا تنسخ النص حرفياً
- لا تضف معلومات غير مؤكدة
- اكتب بأسلوب عربي صحفي واضح
`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.4",
    input: prompt
  });

  const text = response.output_text?.trim() || "";

  if (!text) {
    throw new Error("Empty response from OpenAI");
  }

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON returned by model:");
    console.error(text);
    throw new Error("Model did not return valid JSON");
  }

  return {
    slug: slugify(parsed.shortTitle || parsed.title || topic) || `article-${index + 1}`,
    title: parsed.title || topic,
    shortTitle: parsed.shortTitle || topic,
    description: parsed.description || summary,
    content: Array.isArray(parsed.content) ? parsed.content : [summary],
    faq: Array.isArray(parsed.faq) ? parsed.faq : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : ["أخبار رياضية"],
    source: item.source,
    originalTitle: topic,
    link: item.link,
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const raw = JSON.parse(
    fs.readFileSync("content/articles/raw-news.json", "utf-8")
  );

  const limited = raw.slice(0, 6);
  const results = [];

  for (let i = 0; i < limited.length; i++) {
    const item = limited[i];

    try {
      const article = await rewriteOne(item, i);
      results.push(article);
      console.log(`rewritten: ${article.slug}`);
    } catch (error) {
      console.error(`rewrite failed for: ${item.title}`);
      console.error(error.message);
    }
  }

  fs.writeFileSync(
    "content/articles/seo-articles.json",
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  console.log(`seo articles saved: ${results.length}`);

  if (results.length === 0) {
    throw new Error("No SEO articles were generated");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
