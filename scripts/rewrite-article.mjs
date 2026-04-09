import fs from "fs";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

// 🚨 filtre qualité (ULTRA IMPORTANT)
function isValidArticle(item) {
  if (!item.title || item.title.length < 30) return false;
  if (!item.summary || item.summary.length < 60) return false;
  return true;
}

// 🧠 prompt SEO amélioré
function buildPrompt(item) {
  return `
أنت خبير SEO عربي لموقع رياضي.

المطلوب:
- كتابة مقال رياضي عربي احترافي
- تحسين CTR (عنوان جذاب)
- تحسين SEO (نية البحث)
- لا تكرر النص
- لا تخترع معلومات

أخرج JSON فقط:

{
"title": "",
"shortTitle": "",
"description": "",
"content": ["", "", "", "", ""],
"faq": [{"q": "", "a": ""}, {"q": "", "a": ""}],
"keywords": ["", "", "", ""]
}

الموضوع: ${item.title}
الملخص: ${item.summary}
المصدر: ${item.source}
`;
}

// 🔥 fallback intelligent (important)
function fallbackArticle(item, index) {
  return {
    slug: slugify(item.title) || `article-${index}`,
    title: `${item.title} | آخر الأخبار`,
    shortTitle: item.title,
    description: item.summary,
    content: [
      `يشهد خبر ${item.title} اهتماماً كبيراً.`,
      `نستعرض في هذا التقرير أبرز التفاصيل.`,
      `الموضوع يتصدر اهتمامات الجماهير.`,
      `نقدم تحليل سريع ومبسط.`,
      `تابع المزيد من الأخبار على نبض الرياضة.`
    ],
    faq: [
      {
        q: "ما مضمون الخبر؟",
        a: "ملخص لأهم تفاصيل الحدث الرياضي."
      },
      {
        q: "هل سيتم تحديثه؟",
        a: "نعم، يتم تحديثه باستمرار."
      }
    ],
    keywords: ["أخبار رياضية", item.source],
    source: item.source,
    originalTitle: item.title,
    link: item.link,
    publishedAt: item.publishedAt
  };
}

async function tryOpenAI(item) {
  const res = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: buildPrompt(item)
  });

  return JSON.parse(res.output_text);
}

async function tryClaude(item) {
  const res = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: buildPrompt(item)
      }
    ]
  });

  const text = res.content.find(c => c.type === "text").text;
  return JSON.parse(text);
}

async function rewrite(item, index) {
  try {
    return await tryOpenAI(item);
  } catch (e) {
    console.log("OpenAI fail → Claude");
  }

  try {
    return await tryClaude(item);
  } catch (e) {
    console.log("Claude fail → fallback");
  }

  return fallbackArticle(item, index);
}

async function main() {
  const raw = JSON.parse(
    fs.readFileSync("content/articles/raw-news.json", "utf-8")
  );

  const filtered = raw.filter(isValidArticle).slice(0, 8);

  const results = [];

  for (let i = 0; i < filtered.length; i++) {
    const base = filtered[i];
    const ai = await rewrite(base, i);

    const article = {
      slug: slugify(ai.shortTitle || ai.title),
      title: ai.title,
      shortTitle: ai.shortTitle,
      description: ai.description,
      content: ai.content,
      faq: ai.faq,
      keywords: ai.keywords,
      source: base.source,
      link: base.link,
      publishedAt: base.publishedAt
    };

    results.push(article);
    console.log("generated:", article.slug);
  }

  fs.writeFileSync(
    "content/articles/seo-articles.json",
    JSON.stringify(results, null, 2)
  );

  console.log("SEO ARTICLES READY:", results.length);
}

main();
