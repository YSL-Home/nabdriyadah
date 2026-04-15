import fs from "fs";
import path from "path";

const RAW_PATH = path.join(process.cwd(), "content/raw-news.json");
const SEO_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "أنت صحفي رياضي عربي محترف متخصص في كتابة مقالات SEO عالية الجودة."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });

  const data = await res.json();

  if (!data.choices) {
    console.error("OpenAI error:", data);
    return null;
  }

  return data.choices[0].message.content;
}

function buildPrompt(item) {
  return `
أعد كتابة هذا الخبر الرياضي باللغة العربية بأسلوب احترافي SEO.

الشروط:
- لغة عربية طبيعية 100%
- لا تترجم حرفيًا
- أضف تحليل بسيط
- طول المقال 300 إلى 500 كلمة
- فقرة افتتاحية قوية
- تقسيم الفقرات

أعطني النتيجة بهذا الشكل JSON فقط:

{
"title": "...",
"description": "...",
"content": "...",
"keywords": ["...", "..."]
}

الخبر الأصلي:
${item.originalTitle}

الوصف:
${item.originalDescription}
`;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function slugify(text, index) {
  return text
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 50) || `article-${index}`;
}

async function main() {
  const rawItems = readJson(RAW_PATH);

  if (!rawItems.length) {
    console.log("No raw news → skip AI");
    return;
  }

  const articles = [];

  for (let i = 0; i < Math.min(rawItems.length, 5); i++) {
    const item = rawItems[i];

    console.log("Generating article:", i + 1);

    const response = await callOpenAI(buildPrompt(item));

    if (!response) continue;

    try {
      const parsed = JSON.parse(response);

      articles.push({
        title: parsed.title,
        description: parsed.description,
        slug: slugify(parsed.title, i),
        keywords: parsed.keywords || [],
        content: parsed.content
      });
    } catch (e) {
      console.error("JSON parse failed:", response);
    }
  }

  if (articles.length === 0) {
    console.log("No AI articles generated → keeping old content");
    return;
  }

  ensureDir(SEO_PATH);
  fs.writeFileSync(SEO_PATH, JSON.stringify(articles, null, 2));

  console.log("AI articles saved:", articles.length);
}

main();
