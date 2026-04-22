import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const inputPath = "./content/raw-news.json";
const outputPath = "./content/articles/seo-articles.json";

async function rewriteArticle(article) {
  const prompt = `
أعد كتابة هذا الخبر الرياضي بالكامل باللغة العربية بأسلوب احترافي.

العنوان:
${article.title}

الوصف:
${article.description}

المطلوب:
- كتابة مقال عربي احترافي 100%
- بدون أي كلمات إنجليزية
- أسلوب صحفي جذاب
- طول المقال بين 600 و 900 كلمة
- تحسين SEO (كلمات مفتاحية بشكل طبيعي)
- تقسيم إلى فقرات واضحة
- إضافة مقدمة قوية وخاتمة

أرجع فقط JSON بهذا الشكل:
{
  "title": "...",
  "description": "...",
  "content": "...",
  "keywords": ["...", "..."]
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  const data = await response.json();

  const text = data.choices[0].message.content;

  try {
    return JSON.parse(text);
  } catch {
    console.log("Erreur parsing JSON, fallback utilisé");
    return {
      title: article.title,
      description: article.description,
      content: article.description,
      keywords: []
    };
  }
}

function createSlug(title, index) {
  return `article-${index + 1}`;
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  const results = [];

  for (let i = 0; i < raw.length; i++) {
    console.log("Rewriting:", raw[i].title);

    const rewritten = await rewriteArticle(raw[i]);

    results.push({
      slug: createSlug(rewritten.title, i),
      title: rewritten.title,
      description: rewritten.description,
      content: rewritten.content,
      keywords: rewritten.keywords,
      image: raw[i].image || "/images/default.jpg"
    });
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log("SEO articles saved:", results.length);
}

main();
