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

function normalizeArticle(parsed, item, index) {
  const title = parsed.title || item.title || `Article ${index + 1}`;
  const shortTitle = parsed.shortTitle || title;
  const description =
    parsed.description ||
    item.summary ||
    "آخر الأخبار الرياضية من نبض الرياضة.";
  const content = Array.isArray(parsed.content) && parsed.content.length
    ? parsed.content
    : [
        `يشهد موضوع ${shortTitle} اهتماماً متزايداً خلال الساعات الأخيرة.`,
        `يقدم نبض الرياضة تغطية عربية سريعة ومبسطة لهذا الخبر.`,
        `يتابع الجمهور الرياضي آخر التطورات المتعلقة بهذا الحدث.`,
        `نعرض هنا أهم التفاصيل المتاحة حالياً مع صياغة مناسبة لمحركات البحث.`,
        `سيتم تحديث المقال عند توفر مستجدات إضافية.`
      ];
  const faq = Array.isArray(parsed.faq)
    ? parsed.faq
    : [
        {
          q: `ما أهمية ${shortTitle}؟`,
          a: `يحظى هذا الموضوع باهتمام جماهيري وإعلامي كبير في الوسط الرياضي.`
        },
        {
          q: `هل سيتم تحديث هذا المقال؟`,
          a: `نعم، يمكن تحديثه تلقائياً عند توفر معطيات جديدة.`
        }
      ];
  const keywords = Array.isArray(parsed.keywords) && parsed.keywords.length
    ? parsed.keywords
    : ["أخبار رياضية", "كرة القدم", shortTitle];

  return {
    slug: slugify(shortTitle) || `article-${index + 1}`,
    title,
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

function fallbackArticle(item, index) {
  return normalizeArticle(
    {
      title: `${item.title || `Article ${index + 1}`} | آخر الأخبار الرياضية`,
      shortTitle: item.title || `Article ${index + 1}`,
      description:
        item.summary ||
        "آخر الأخبار الرياضية والتحليلات المحدثة على نبض الرياضة.",
      content: [
        `يعد موضوع ${item.title || `Article ${index + 1}`} من المواضيع الرياضية التي تشهد اهتماماً ملحوظاً.`,
        `في هذا التقرير، نستعرض أبرز ما ورد حول الخبر بأسلوب عربي واضح ومناسب للقراءة السريعة.`,
        `يعتمد هذا المحتوى على المعلومات الأولية المتاحة من المصدر مع إعادة صياغة تحريرية.`,
        `يهدف المقال إلى تقديم ملخص سريع ومفيد للزائر مع بنية مناسبة لمحركات البحث.`,
        `سيتم تحسين هذا المحتوى وتحديثه عند توفر بيانات إضافية أو إعادة تشغيل النظام.`
      ],
      faq: [
        {
          q: "ما مضمون هذا الخبر؟",
          a: "يعرض هذا المقال ملخصاً سريعاً لأبرز ما ورد في الخبر الرياضي."
        },
        {
          q: "هل يمكن تحديث المعلومات لاحقاً؟",
          a: "نعم، يمكن تحديث المقال تلقائياً عند وصول بيانات جديدة."
        }
      ],
      keywords: ["أخبار رياضية", "كرة القدم", item.source || "رياضة"]
    },
    item,
    index
  );
}

function buildPrompt(item) {
  return `
أنت محرر SEO عربي لموقع رياضي اسمه "نبض الرياضة".

المطلوب:
- أعد كتابة الخبر بالعربية الطبيعية.
- اجعله مفيداً للقارئ أولاً.
- لا تنسخ حرفياً.
- لا تختلق حقائق غير مؤكدة.
- أخرج JSON فقط بهذا الشكل:
{
  "title": "",
  "shortTitle": "",
  "description": "",
  "content": ["", "", "", "", ""],
  "faq": [{"q": "", "a": ""}, {"q": "", "a": ""}],
  "keywords": ["", "", "", ""]
}

العنوان: ${item.title}
الملخص: ${item.summary}
المصدر: ${item.source}
`;
}

async function tryOpenAI(item, index) {
  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.4",
    input: buildPrompt(item)
  });

  const text = response.output_text?.trim();
  if (!text) throw new Error("OpenAI empty response");

  const parsed = JSON.parse(text);
  return normalizeArticle(parsed, item, index);
}

async function tryClaude(item, index) {
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
    max_tokens: 1800,
    temperature: 0.4,
    messages: [
      {
        role: "user",
        content: buildPrompt(item)
      }
    ]
  });

  const text = response.content
    ?.filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("Claude empty response");

  const parsed = JSON.parse(text);
  return normalizeArticle(parsed, item, index);
}

async function rewriteOne(item, index) {
  try {
    return await tryOpenAI(item, index);
  } catch (error) {
    console.error(`OpenAI failed for: ${item.title}`);
    console.error(error.message);
  }

  try {
    return await tryClaude(item, index);
  } catch (error) {
    console.error(`Claude failed for: ${item.title}`);
    console.error(error.message);
  }

  return fallbackArticle(item, index);
}

async function main() {
  const raw = JSON.parse(
    fs.readFileSync("content/articles/raw-news.json", "utf-8")
  );

  const limited = raw.slice(0, 8);
  const results = [];

  for (let i = 0; i < limited.length; i++) {
    const article = await rewriteOne(limited[i], i);
    results.push(article);
    console.log(`generated: ${article.slug}`);
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
