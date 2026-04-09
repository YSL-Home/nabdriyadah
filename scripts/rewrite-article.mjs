import fs from "fs";
import path from "path";

// =====================
// CONFIG
// =====================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.3";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// =====================
// HELPERS
// =====================
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

// =====================
// OPENAI CALL
// =====================
async function rewriteWithOpenAI(item) {
  const prompt = `
أعد كتابة هذا الخبر الرياضي بالعربية بأسلوب احترافي SEO:

العنوان: ${item.title}
المحتوى: ${item.content || item.description || ""}

المطلوب:
- عنوان جذاب عربي فقط
- وصف مختصر
- مقال كامل
- بدون أي إنجليزي

JSON:
{
"title": "",
"description": "",
"content": ""
}
`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI error ${res.status}`);
  }

  const data = await res.json();

  const text = data.output[0].content[0].text;

  return JSON.parse(text);
}

// =====================
// CLAUDE CALL
// =====================
async function rewriteWithClaude(item) {
  const prompt = `
أعد كتابة هذا الخبر الرياضي بالعربية بأسلوب احترافي SEO:

العنوان: ${item.title}
المحتوى: ${item.content || item.description || ""}

المطلوب:
- عنوان عربي قوي
- وصف قصير
- مقال كامل
- بدون إنجليزي

JSON فقط:
{
"title": "",
"description": "",
"content": ""
}
`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Claude error ${res.status}`);
  }

  const data = await res.json();

  const text = data.content[0].text;

  return JSON.parse(text);
}

// =====================
// MAIN
// =====================
async function main() {
  const rawPath = path.join(process.cwd(), "content/articles/raw-news.json");
  const outPath = path.join(process.cwd(), "content/articles/seo-articles.json");

  const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

  const articles = [];

  for (const item of raw.slice(0, 10)) {
    try {
      let result;

      // 1️⃣ Try OpenAI
      if (OPENAI_API_KEY) {
        try {
          result = await rewriteWithOpenAI(item);
          console.log("✅ OpenAI OK:", item.title);
        } catch (err) {
          console.log("⚠️ OpenAI failed → switching to Claude");
        }
      }

      // 2️⃣ Claude fallback
      if (!result && CLAUDE_API_KEY) {
        try {
          result = await rewriteWithClaude(item);
          console.log("✅ Claude OK:", item.title);
        } catch (err) {
          console.log("❌ Claude failed:", item.title);
          continue;
        }
      }

      if (!result) continue;

      articles.push({
        ...result,
        slug: slugify(result.title),
      });

    } catch (err) {
      console.log("❌ rewrite failed for:", item.title);
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(articles, null, 2));

  console.log("seo articles saved:", articles.length);

  if (articles.length === 0) {
    throw new Error("No SEO articles were generated");
  }
}

main();
