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

function isValidArticle(item) {
  if (!item.title || item.title.length < 20) return false;
  if (!item.summary || item.summary.length < 40) return false;
  return true;
}

function buildPrompt(item) {
  return `
أنت خبير SEO عربي لموقع رياضي.

المطلوب:
- كتابة مقال رياضي عربي احترافي
- تحسين CTR بعنوان جذاب
- تحسين SEO بناءً على نية البحث
- لا تنسخ النص حرفياً
- لا تختلق معلومات غير مؤكدة

أخرج JSON فقط بهذا الشكل:

{
  "title": "",
  "shortTitle": "",
  "description": "",
  "content": ["", "", "", "", ""],
  "faq": [{"q": "", "a": ""}, {"q": "", "a": ""}],
  "keywords": ["", "", "", ""]
}

تعليمات مهمة:
- اجعل العنوان جذاباً وقابلاً للنقر
- ركز على كلمات يبحث عنها المستخدم مثل: النتيجة، التفاصيل، الموعد، الترتيب، الأهداف، التشكيل، التحليل
- اجعل الوصف مناسباً للظهور في نتائج Google
- اجعل الفقرات واضحة وسهلة القراءة
- اجعل الأسئلة الشائعة مرتبطة بنيّة البحث

الموضوع: ${item.title}
الملخص: ${item.summary}
المصدر: ${item.source}
`;
}

function fallbackArticle(item, index) {
  const shortTitle = item.title || `Article ${index + 1}`;

  return {
    slug: slugify(shortTitle) || `article-${index + 1}`,
    title: `🔥 ${shortTitle} - التفاصيل الكاملة والنتيجة`,
    shortTitle,
    description:
      item.summary ||
      `تعرف على آخر تفاصيل ${shortTitle} مع متابعة سريعة وتحليل محدث على نبض الرياضة.`,
    content: [
      `يشهد خبر ${shortTitle} اهتماماً كبيراً بين الجماهير الرياضية خلال الساعات الأخيرة.`,
      `نستعرض في هذا التقرير أهم التفاصيل المرتبطة بالحدث مع صياغة عربية واضحة ومختصرة.`,
      `يركز هذا المقال على تقديم المعلومات الأساسية التي يبحث عنها القارئ بسرعة ووضوح.`,
      `كما يهدف إلى تقديم محتوى منظم وقابل للفهم مع بنية مناسبة لمحركات البحث.`,
      `تابع المزيد من الأخبار الرياضية الحصرية والتغطيات المباشرة عبر نبض الرياضة.`
    ],
    faq: [
      {
        q: `ما أهمية خبر ${shortTitle}؟`,
        a: `يحظى هذا الخبر باهتمام جماهيري لأنه يرتبط بواحد من المواضيع الرياضية الأكثر تداولاً حالياً.`
      },
      {
        q: `هل سيتم تحديث هذا المقال لاحقاً؟`,
        a: `نعم، يمكن تحديث المقال تلقائياً كلما ظهرت معطيات جديدة مرتبطة بالموضوع.`
      }
    ],
    keywords: ["أخبار رياضية", "كرة القدم", item.source || "رياضة"],
    source: item.source,
    originalTitle: item.title,
    link: item.link,
    publishedAt: item.publishedAt
  };
}

function normalizeArticle(parsed, item, index) {
  const baseTitle = parsed.title || item.title || `Article ${index + 1}`;
  const shortTitle = parsed.shortTitle || item.title || `Article ${index + 1}`;

  const boostedTitle =
    baseTitle.includes("🔥") || baseTitle.includes("التفاصيل")
      ? baseTitle
      : `🔥 ${baseTitle} - التفاصيل الكاملة والنتيجة`;

  const description =
    parsed.description ||
    item.summary ||
    `تعرف على آخر تفاصيل ${shortTitle} مع متابعة سريعة وتحليل محدث على نبض الرياضة.`;

  const content =
    Array.isArray(parsed.content) && parsed.content.length
      ? parsed.content
      : [
          `يشهد موضوع ${shortTitle} اهتماماً متزايداً خلال الساعات الأخيرة.`,
          `في هذا التقرير نقدم ملخصاً سريعاً وواضحاً لأبرز ما يتعلق بالخبر.`,
          `نركز على أهم التفاصيل التي يبحث عنها القارئ الرياضي العربي.`,
          `كما نعرض المحتوى بصياغة مناسبة لمحركات البحث وللقراءة السريعة.`,
          `سيتم تحديث هذا المقال تلقائياً عند توفر مستجدات جديدة.`
        ];

  const faq =
    Array.isArray(parsed.faq) && parsed.faq.length
      ? parsed.faq
      : [
          {
            q: `ما أبرز تفاصيل ${shortTitle}؟`,
            a: `يعرض هذا المقال أهم ما ورد حول الموضوع مع تنظيم المحتوى بطريقة سهلة وواضحة.`
          },
          {
            q: `هل هذا المقال محدث؟`,
            a: `نعم، يتم تحديث هذا النوع من المقالات باستمرار وفق المعطيات الجديدة المتوفرة.`
          }
        ];

  const keywords =
    Array.isArray(parsed.keywords) && parsed.keywords.length
      ? parsed.keywords
      : ["أخبار رياضية", "كرة القدم", shortTitle, item.source || "رياضة"];

  return {
    slug: slugify(shortTitle) || `article-${index + 1}`,
    title: boostedTitle,
    shortTitle,
    description,
    content,
    faq,
    keywords,
    source: item.source,
    originalTitle: item.title,
    link: item.link,
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

async function tryOpenAI(item, index) {
  const res = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: buildPrompt(item)
  });

  const text = res.output_text?.trim();

  if (!text) {
    throw new Error("OpenAI returned empty text");
  }

  const parsed = JSON.parse(text);
  return normalizeArticle(parsed, item, index);
}

async function tryClaude(item, index) {
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

  const textBlock = res.content.find((c) => c.type === "text");
  const text = textBlock?.text?.trim();

  if (!text) {
    throw new Error("Claude returned empty text");
  }

  const parsed = JSON.parse(text);
  return normalizeArticle(parsed, item, index);
}

async function rewrite(item, index) {
  try {
    return await tryOpenAI(item, index);
  } catch (e) {
    console.log("OpenAI fail → Claude");
    console.log(e.message);
  }

  try {
    return await tryClaude(item, index);
  } catch (e) {
    console.log("Claude fail → fallback");
    console.log(e.message);
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
    const article = await rewrite(base, i);

    results.push(article);
    console.log("generated:", article.slug);
  }

  fs.writeFileSync(
    "content/articles/seo-articles.json",
    JSON.stringify(results, null, 2)
  );

  console.log("SEO ARTICLES READY:", results.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
