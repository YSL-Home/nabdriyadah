import fs from "fs/promises";

const INPUT = "content/articles/raw-news.json";
const OUTPUT = "content/articles/seo-articles.json";

// 🔥 CONFIG
const MAX_ARTICLES = 12;
const MIN_CONTENT_LENGTH = 4;

// 🧠 fallback local si API HS
function buildLocalArticle(item) {
  const title = item.title || "خبر رياضي عاجل";
  const league = item.source || "كرة القدم";

  return {
    title: `🔥 ${title}`,
    description: `تعرف على تفاصيل ${title} وأبرز ما جاء في هذا الخبر الرياضي ضمن ${league}.`,
    content: [
      `شهدت الساحة الرياضية تطورات جديدة بخصوص ${title}، حيث بدأت التفاصيل تتضح تدريجياً حول هذا الحدث.`,
      `ويأتي هذا الخبر في سياق المنافسة القوية ضمن ${league}، والتي تشهد هذا الموسم العديد من المفاجآت.`,
      `كما تشير التحليلات إلى أن هذا الحدث قد يكون له تأثير مباشر على نتائج الفرق وترتيبها.`,
      `في النهاية، يبقى هذا الخبر محل متابعة كبيرة من الجماهير المهتمة بكرة القدم العالمية.`,
    ],
    keywords: [league, "كرة القدم", "أخبار رياضية"],
    faq: [
      {
        q: "ما أهمية هذا الخبر؟",
        a: "يعكس هذا الخبر تطورات مهمة في عالم كرة القدم وقد يؤثر على المنافسات.",
      },
      {
        q: "هل هناك تحديثات قادمة؟",
        a: "نعم، من المتوقع ظهور تفاصيل جديدة خلال الفترة القادمة.",
      },
    ],
  };
}

// 🧹 تنظيف + dedup
function isDuplicate(title, seen) {
  const normalized = title.toLowerCase().slice(0, 60);
  if (seen.has(normalized)) return true;
  seen.add(normalized);
  return false;
}

// 🧠 prompt PRO
function buildPrompt(item) {
  return `
أنت صحفي رياضي محترف.

أعد كتابة الخبر التالي باللغة العربية بأسلوب احترافي (مثل BBC عربي / كووورة).

القواعد:
- اكتب عنوان جذاب قوي (بدون مبالغة)
- اكتب مقدمة قصيرة صحفية
- اكتب 4 إلى 6 فقرات تحليلية
- لا تكرر نفس الجمل
- لا تستخدم أسلوب روبوتي
- اجعل النص طبيعي 100%
- أضف زاوية تحليل (تأثير، توقعات، سياق)

أرجع JSON فقط بهذا الشكل:

{
  "title": "",
  "description": "",
  "content": ["فقرة", "فقرة", "فقرة"],
  "keywords": ["", "", ""],
  "faq": [
    {"q": "", "a": ""},
    {"q": "", "a": ""}
  ]
}

الخبر:
${item.title}
${item.content || ""}
`;
}

// 🤖 OPENAI
async function rewriteWithOpenAI(item) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "user", content: buildPrompt(item) }
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error("OpenAI failed");

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;

    return JSON.parse(text);
  } catch (e) {
    console.log("⚠️ OpenAI failed → fallback");
    return null;
  }
}

// 🤖 CLAUDE
async function rewriteWithClaude(item) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: buildPrompt(item),
          },
        ],
      }),
    });

    if (!res.ok) throw new Error("Claude failed");

    const data = await res.json();
    const text = data.content?.[0]?.text;

    return JSON.parse(text);
  } catch (e) {
    console.log("❌ Claude failed:", item.title);
    return null;
  }
}

async function rewrite(item) {
  let article = await rewriteWithOpenAI(item);

  if (!article) {
    article = await rewriteWithClaude(item);
  }

  if (!article) {
    article = buildLocalArticle(item);
  }

  return article;
}

function buildSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function main() {
  const raw = JSON.parse(await fs.readFile(INPUT, "utf-8"));

  const seen = new Set();
  const finalArticles = [];

  for (const item of raw) {
    if (finalArticles.length >= MAX_ARTICLES) break;

    if (!item.title) continue;
    if (isDuplicate(item.title, seen)) continue;

    const article = await rewrite(item);

    if (!article?.content || article.content.length < MIN_CONTENT_LENGTH) continue;

    finalArticles.push({
      ...article,
      slug: buildSlug(article.title),
      source: item.source || "news",
      publishedAt: new Date().toISOString(),
    });
  }

  if (finalArticles.length === 0) {
    throw new Error("No SEO articles were generated");
  }

  await fs.writeFile(OUTPUT, JSON.stringify(finalArticles, null, 2));

  console.log("✅ SEO articles saved:", finalArticles.length);
}

main();
