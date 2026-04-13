import fs from "fs/promises";

const INPUT = "content/articles/raw-news.json";
const OUTPUT = "content/articles/seo-articles.json";

const MAX_ARTICLES = 10;

function cleanArabic(text = "") {
  return String(text)
    .replace(/[A-Za-z]/g, "")
    .replace(/[^\u0600-\u06FF0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasEnglish(text = "") {
  return /[A-Za-z]/.test(text);
}

function arabicLeague(source = "") {
  const s = source.toLowerCase();

  if (s.includes("premier")) return "الدوري الإنجليزي";
  if (s.includes("liga")) return "الدوري الإسباني";
  if (s.includes("serie")) return "الدوري الإيطالي";
  if (s.includes("bundesliga")) return "الدوري الألماني";
  if (s.includes("ligue")) return "الدوري الفرنسي";
  if (s.includes("champions")) return "دوري أبطال أوروبا";

  return "كرة القدم";
}

function buildPrompt(item) {
  return `
اكتب مقال رياضي احترافي باللغة العربية فقط.

ممنوع:
- أي كلمة إنجليزية
- نسخ النص

مطلوب:
- عنوان جذاب
- وصف SEO
- 4 فقرات تحليلية
- 4 كلمات مفتاحية
- سؤالين FAQ

أرجع JSON فقط

الخبر:
${item.title}
`;
}

async function openai(item) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: buildPrompt(item) }],
      }),
    });

    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return null;
  }
}

async function claude(item) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

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
        max_tokens: 800,
        messages: [{ role: "user", content: buildPrompt(item) }],
      }),
    });

    const data = await res.json();
    return JSON.parse(data.content[0].text);
  } catch {
    return null;
  }
}

function fallback(item) {
  const league = arabicLeague(item.source);

  return {
    title: `آخر أخبار ${league}`,
    description: `نستعرض أبرز مستجدات ${league} وتحليل سريع.`,
    content: [
      `تشهد الساحة الرياضية تطورات جديدة في ${league}.`,
      `الخبر أثار اهتمام الجماهير والمتابعين.`,
      `التحليل يشير إلى تأثير محتمل على المنافسة.`,
      `المتابعة مستمرة لمعرفة التفاصيل القادمة.`,
    ],
    keywords: [league, "أخبار", "كرة القدم"],
    faq: [
      { q: "ما أهمية الخبر؟", a: "يحمل تأثير على المنافسة." },
      { q: "هل هناك جديد؟", a: "نعم قريباً." },
    ],
  };
}

function enforceArabic(article, item) {
  if (
    hasEnglish(article.title) ||
    article.content.some(hasEnglish)
  ) {
    return fallback(item);
  }

  return {
    title: cleanArabic(article.title),
    description: cleanArabic(article.description),
    content: article.content.map(cleanArabic),
    keywords: article.keywords.map(cleanArabic),
    faq: article.faq,
  };
}

function slugify(text) {
  return cleanArabic(text).replace(/\s+/g, "-");
}

async function main() {
  const raw = JSON.parse(await fs.readFile(INPUT, "utf-8"));

  const final = [];

  for (let i = 0; i < raw.length; i++) {
    if (final.length >= MAX_ARTICLES) break;

    const item = raw[i];

    let article = await openai(item);
    if (!article) article = await claude(item);
    if (!article) article = fallback(item);

    article = enforceArabic(article, item);

    final.push({
      ...article,
      slug: slugify(article.title),
      source: item.source,
    });
  }

  await fs.writeFile(OUTPUT, JSON.stringify(final, null, 2));
  console.log("✅ Articles SEO générés :", final.length);
}

main();
