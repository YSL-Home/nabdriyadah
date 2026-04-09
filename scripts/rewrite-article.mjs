import fs from "fs";
import path from "path";

// =====================
// CONFIG
// =====================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307";

// =====================
// HELPERS
// =====================
function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function arabicLeagueName(source = "") {
  const s = String(source).toLowerCase();

  if (s.includes("premier")) return "الدوري الإنجليزي الممتاز";
  if (s.includes("la liga")) return "الدوري الإسباني";
  if (s.includes("serie a")) return "الدوري الإيطالي";
  if (s.includes("bundesliga")) return "الدوري الألماني";
  if (s.includes("ligue 1")) return "الدوري الفرنسي";
  if (s.includes("champions")) return "دوري أبطال أوروبا";
  if (s.includes("saudi")) return "الدوري السعودي";
  if (s.includes("padel")) return "البادل";

  return "كرة القدم";
}

function cleanArabicText(value, fallback = "") {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return fallback;
  return text;
}

function extractJson(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Empty model text");

  // direct JSON
  try {
    return JSON.parse(raw);
  } catch (_) {}

  // fenced code block
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    return JSON.parse(fenced[1].trim());
  }

  // first JSON object
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }

  throw new Error("No valid JSON found in model response");
}

function buildPrompt(item) {
  const league = arabicLeagueName(item.source);

  return `
أنت محرر رياضي عربي وخبير SEO لموقع "نبض الرياضة".

مهم جداً:
- اكتب بالعربية فقط 100%.
- لا تستخدم الإنجليزية في العنوان أو الوصف أو النص.
- ترجم معنى الخبر إلى العربية بأسلوب صحفي واضح.
- لا تخترع حقائق غير موجودة.
- اجعل العنوان جذاباً وقابلاً للنقر.
- اجعل الوصف مناسباً لنتائج البحث.
- أعد النتيجة في JSON فقط.

شكل JSON المطلوب:
{
  "title": "",
  "shortTitle": "",
  "description": "",
  "content": ["", "", "", "", ""],
  "faq": [{"q": "", "a": ""}, {"q": "", "a": ""}],
  "keywords": ["", "", "", ""]
}

العنوان الأصلي: ${item.title || ""}
الملخص الأصلي: ${item.summary || ""}
المصدر: ${item.source || ""}
اسم البطولة بالعربية: ${league}
`;
}

function normalizeArticle(parsed, item, index) {
  const league = arabicLeagueName(item.source);
  const shortTitle = cleanArabicText(
    parsed?.shortTitle,
    `آخر أخبار ${league}`
  );

  const title = cleanArabicText(
    parsed?.title,
    `🔥 ${shortTitle} - التفاصيل الكاملة والتحديثات`
  );

  const description = cleanArabicText(
    parsed?.description,
    `تعرف على آخر أخبار ${league} وتحليل المباريات والنتائج بشكل يومي عبر نبض الرياضة.`
  );

  const content = Array.isArray(parsed?.content) && parsed.content.length
    ? parsed.content.map((p) =>
        cleanArabicText(
          p,
          `يقدم نبض الرياضة تغطية عربية محدثة حول ${shortTitle}.`
        )
      )
    : [
        `يشهد ${league} اهتماماً كبيراً من الجماهير الرياضية خلال الساعات الأخيرة.`,
        `في هذا التقرير نقدم ملخصاً سريعاً وواضحاً لأهم التطورات المرتبطة بالبطولة أو الخبر الحالي.`,
        `نركز على تقديم محتوى عربي سهل القراءة يساعد المتابع على فهم الصورة العامة بسرعة.`,
        `كما نعرض أبرز النقاط التي يهتم بها الجمهور مثل النتائج والتطورات والتحليل العام.`,
        `سيتم تحديث هذا المقال تلقائياً عند توفر مستجدات جديدة مرتبطة بالموضوع.`
      ];

  const faq = Array.isArray(parsed?.faq) && parsed.faq.length
    ? parsed.faq.map((f) => ({
        q: cleanArabicText(f?.q, `ما أبرز تفاصيل ${shortTitle}؟`),
        a: cleanArabicText(
          f?.a,
          `يعرض هذا المقال أهم المعلومات المرتبطة بالموضوع في صياغة عربية واضحة.`
        )
      }))
    : [
        {
          q: `ما أبرز تفاصيل ${shortTitle}؟`,
          a: `يعرض هذا المقال أهم المعلومات المرتبطة بالموضوع في صياغة عربية واضحة.`
        },
        {
          q: `هل يتم تحديث هذا المقال لاحقاً؟`,
          a: `نعم، يمكن تحديث المقال تلقائياً عند توفر معلومات جديدة.`
        }
      ];

  const keywords = Array.isArray(parsed?.keywords) && parsed.keywords.length
    ? parsed.keywords.map((k) => cleanArabicText(k, league)).filter(Boolean)
    : ["أخبار رياضية", league, "كرة القدم", "نتائج المباريات"];

  return {
    slug: slugify(shortTitle) || `article-${index + 1}`,
    title,
    shortTitle,
    description,
    content,
    faq,
    keywords,
    source: item.source || "",
    originalTitle: item.title || "",
    link: item.link || "",
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

function fallbackArticle(item, index) {
  const league = arabicLeagueName(item.source);
  const shortTitle = `آخر أخبار ${league}`;

  return {
    slug: slugify(shortTitle) || `article-${index + 1}`,
    title: `🔥 ${shortTitle} - التفاصيل الكاملة والتحديثات`,
    shortTitle,
    description: `تعرف على آخر أخبار ${league} وتحليل المباريات والنتائج بشكل يومي عبر نبض الرياضة.`,
    content: [
      `تشهد أخبار ${league} متابعة كبيرة من الجماهير الرياضية في مختلف أنحاء العالم العربي.`,
      `في هذا التقرير نقدم تغطية شاملة لأهم الأحداث والتطورات المرتبطة بالبطولة أو الخبر الجاري.`,
      `نركز على تقديم محتوى واضح وسريع يساعد القارئ على فهم أهم المستجدات بصورة مبسطة.`,
      `كما نعرض تحليلاً عاماً لأبرز النتائج وتأثيرها على المشهد الرياضي ومسار المنافسة.`,
      `تابع نبض الرياضة للحصول على أحدث الأخبار الرياضية بشكل مستمر ومحدث.`
    ],
    faq: [
      {
        q: `ما أهم أخبار ${league} اليوم؟`,
        a: `نستعرض في هذا المقال أهم المستجدات والنتائج المرتبطة بالبطولة أو الخبر الحالي.`
      },
      {
        q: `هل يتم تحديث الأخبار باستمرار؟`,
        a: `نعم، يتم تحديث المقالات بشكل دوري حسب آخر الأخبار المتوفرة.`
      }
    ],
    keywords: ["أخبار رياضية", league, "كرة القدم", "نتائج المباريات"],
    source: item.source || "",
    originalTitle: item.title || "",
    link: item.link || "",
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

// =====================
// OPENAI
// =====================
async function rewriteWithOpenAI(item, index) {
  const prompt = buildPrompt(item);

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text =
    data?.output_text ||
    data?.output?.[0]?.content?.[0]?.text ||
    "";

  const parsed = extractJson(text);
  return normalizeArticle(parsed, item, index);
}

// =====================
// ANTHROPIC
// =====================
async function rewriteWithClaude(item, index) {
  const prompt = buildPrompt(item);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text =
    data?.content?.filter((c) => c.type === "text").map((c) => c.text).join("\n") || "";

  const parsed = extractJson(text);
  return normalizeArticle(parsed, item, index);
}

// =====================
// MAIN
// =====================
async function main() {
  const rawPath = path.join(process.cwd(), "content/articles/raw-news.json");
  const outPath = path.join(process.cwd(), "content/articles/seo-articles.json");

  const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

  const selected = raw.slice(0, 10);
  const articles = [];

  for (let i = 0; i < selected.length; i++) {
    const item = selected[i];
    let result = null;

    if (OPENAI_API_KEY) {
      try {
        result = await rewriteWithOpenAI(item, i);
        console.log("✅ OpenAI OK:", item.title);
      } catch (err) {
        console.log("⚠️ OpenAI failed → Anthropic fallback");
        console.log(err.message);
      }
    }

    if (!result && ANTHROPIC_API_KEY) {
      try {
        result = await rewriteWithClaude(item, i);
        console.log("✅ Anthropic OK:", item.title);
      } catch (err) {
        console.log("⚠️ Anthropic failed → local fallback");
        console.log(err.message);
      }
    }

    if (!result) {
      result = fallbackArticle(item, i);
      console.log("✅ Local fallback OK:", item.title);
    }

    articles.push(result);
  }

  fs.writeFileSync(outPath, JSON.stringify(articles, null, 2), "utf-8");

  console.log("seo articles saved:", articles.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
