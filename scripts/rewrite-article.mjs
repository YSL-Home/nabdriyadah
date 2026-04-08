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

المطلوب:
1) أعد كتابة الخبر بالعربية الطبيعية.
2) اجعل المحتوى مفيداً للقارئ أولاً وليس حشواً لمحركات البحث.
3) استخدم زاوية بحث قوية حول الموضوع.
4) أنشئ:
- title
- description
- shortTitle
- content (5 فقرات)
- faq (سؤالان وجوابان)
- keywords (4 عناصر)

المدخلات:
العنوان: ${topic}
الملخص: ${summary}
المصدر: ${item.source}

قواعد صارمة:
- لا تذكر أنك ذكاء اصطناعي.
- لا تنسخ النص حرفياً.
- لا تخترع حقائق غير موجودة.
- الأسلوب عربي صحفي واضح.
- ركز على نية البحث: النتيجة، آخر الأخبار، التحليل، التطورات، الموعد إذا كان مناسباً.
- أعد النتيجة في JSON فقط بهذا الشكل:
{
  "title": "",
  "shortTitle": "",
  "description": "",
  "content": ["", "", "", "", ""],
  "faq": [{"q": "", "a": ""}, {"q": "", "a": ""}],
  "keywords": ["", "", "", ""]
}
`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.4",
    input: prompt
  });

  const text = response.output_text;
  const parsed = JSON.parse(text);

  return {
    slug: slugify(parsed.shortTitle || parsed.title || topic) || `article-${index + 1}`,
    title: parsed.title,
    shortTitle: parsed.shortTitle,
    description: parsed.description,
    content: parsed.content,
    faq: parsed.faq,
    keywords: parsed.keywords,
    source: item.source,
    originalTitle: topic,
    link: item.link,
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

async function main() {
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
      console.error(`rewrite failed for: ${item.title}`, error.message);
    }
  }

  fs.writeFileSync(
    "content/articles/seo-articles.json",
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  console.log(`seo articles saved: ${results.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
