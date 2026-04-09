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

function arabicLeagueName(source = "") {
  const s = source.toLowerCase();

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

function buildPrompt(item) {
  return `
أنت محرر وخبير SEO عربي لموقع رياضي اسمه "نبض الرياضة".

مهم جداً:
- كل المخرجات يجب أن تكون بالعربية 100% فقط.
- ممنوع ترك أي جملة أو عنوان أو كلمة كاملة باللغة الإنجليزية.
- إذا كان عنوان المصدر بالإنجليزية، قم بترجمته وإعادة صياغته إلى عنوان عربي صحفي طبيعي.
- اسم البطولة أو النادي يمكن تعريبه بالعربية مثل:
  Premier League = الدوري الإنجليزي الممتاز
  Champions League = دوري أبطال أوروبا
  La Liga = الدوري الإسباني
  Serie A = الدوري الإيطالي
  Bundesliga = الدوري الألماني
  Ligue 1 = الدوري الفرنسي
  Saudi Pro League = الدوري السعودي

المطلوب:
- كتابة مقال رياضي عربي احترافي
- عنوان جذاب يرفع معدل النقر
- وصف قصير مناسب لنتائج البحث
- 5 فقرات عربية واضحة
- سؤالان شائعان وجوابان
- 4 كلمات مفتاحية عربية

أخرج JSON فقط بهذا الشكل:
{
  "title": "",
  "shortTitle": "",
  "description": "",
  "content": ["", "", "", "", ""],
  "faq": [{"q": "", "a": ""}, {"q": "", "a": ""}],
  "keywords": ["", "", "", ""]
}

العنوان الأصلي: ${item.title}
الملخص الأصلي: ${item.summary}
المصدر: ${item.source}
اسم البطولة بالعربية: ${arabicLeagueName(item.source)}
`;
}

function cleanArabicText(value, fallback = "") {
  if (!value || typeof value !== "string") return fallback;

  return value
    .replace(/\s+/g, " ")
    .replace(/[A-Za-z]/g, "")
    .trim() || fallback;
}

function fallbackArticle(item, index) {
  const league = arabicLeagueName(item.source);
  const shortTitle = `آخر أخبار ${league}`;
  const title = `🔥 ${shortTitle} - التفاصيل الكاملة والتحديثات الأخيرة`;

  return {
    slug: slugify(shortTitle) || `article-${index + 1}`,
    title,
    shortTitle,
    description: `تعرف على آخر أخبار ${league} مع متابعة عربية سريعة وتحليل محدث على نبض الرياضة.`,
    content: [
      `يشهد ${league} اهتماماً كبيراً من الجماهير الرياضية خلال الساعات الأخيرة، خاصة مع تزايد البحث عن آخر المستجدات المرتبطة بالمباريات والنتائج.`,
      `في هذا التقرير من نبض الرياضة نقدم تغطية عربية مبسطة تساعد القارئ على فهم أهم تفاصيل الخبر بطريقة سريعة وواضحة.`,
      `يعتمد هذا المحتوى على إعادة تنظيم المعلومات المتاحة في صياغة صحفية مناسبة لمحركات البحث وللقراءة اليومية.`,
      `كما يركز المقال على إبراز الجوانب التي يهتم بها المستخدم العربي مثل النتائج والتفاصيل والتأثير على الترتيب العام.`,
      `سيتم تحديث هذا المحتوى باستمرار عند توفر معطيات جديدة من المصادر الرياضية الموثوقة.`
    ],
    faq: [
      {
        q: `ما أهم جديد ${league}؟`,
        a: `يعرض هذا التقرير أبرز المستجدات المرتبطة بالبطولة أو الخبر الرياضي محل المتابعة بشكل عربي واضح ومختصر.`
      },
      {
        q: `هل يتم تحديث المقالات الرياضية تلقائياً؟`,
        a: `نعم، يتم توليد المقالات وتحديثها بشكل دوري وفق البيانات الجديدة المتاحة من مصادر الأخبار.`
      }
    ],
    keywords: ["أخبار رياضية", league, "كرة القدم", "نتائج المباريات"],
    source: item.source,
    originalTitle: item.title,
    link: item.link,
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

function normalizeArticle(parsed, item, index) {
  const league = arabicLeagueName(item.source);

  const shortTitle =
    cleanArabicText(parsed.shortTitle, `آخر أخبار ${league}`) || `آخر أخبار ${league}`;

  const title =
    cleanArabicText(
      parsed.title,
      `🔥 ${shortTitle} - التفاصيل الكاملة والتحديثات الأخيرة`
    ) || `🔥 ${shortTitle} - التفاصيل الكاملة والتحديثات الأخيرة`;

  const description =
    cleanArabicText(
      parsed.description,
      `تعرف على آخر تفاصيل ${shortTitle} مع متابعة عربية سريعة وتحليل محدث على نبض الرياضة.`
    ) || `تعرف على آخر تفاصيل ${shortTitle} مع متابعة عربية سريعة وتحليل محدث على نبض الرياضة.`;

  const content =
    Array.isArray(parsed.content) && parsed.content.length
      ? parsed.content.map((p) =>
          cleanArabicText(
            p,
            `يقدم نبض الرياضة تغطية عربية محدثة حول ${shortTitle} مع أبرز التفاصيل والتحليلات.`
          )
        )
      : [
          `يشهد ${shortTitle} اهتماماً متزايداً بين الجماهير الرياضية خلال الساعات الأخيرة.`,
          `في هذا التقرير نستعرض أهم التفاصيل المرتبطة بالخبر بصياغة عربية واضحة ومباشرة.`,
          `يركز المقال على أبرز النقاط التي يبحث عنها المتابع مثل النتائج والتطورات والتحليل.`,
          `كما يهدف إلى تقديم محتوى منظم ومفيد للقارئ العربي مع بنية مناسبة لمحركات البحث.`,
          `سيتم تحديث هذا المقال تلقائياً عند توفر مستجدات إضافية مرتبطة بالموضوع.`
        ];

  const faq =
    Array.isArray(parsed.faq) && parsed.faq.length
      ? parsed.faq.map((f) => ({
          q: cleanArabicText(f?.q, `ما أبرز تفاصيل ${shortTitle}؟`),
          a: cleanArabicText(
            f?.a,
            `يعرض هذا المقال أهم المعلومات المرتبطة بالموضوع في صياغة عربية واضحة ومباشرة.`
          )
        }))
      : [
          {
            q: `ما أبرز تفاصيل ${shortTitle}؟`,
            a: `يعرض هذا المقال أهم المعلومات المرتبطة بالموضوع في صياغة عربية واضحة ومباشرة.`
          },
          {
            q: `هل هذا المقال محدث؟`,
            a: `نعم، يتم تحديث هذا النوع من المقالات باستمرار وفق المعطيات الجديدة المتوفرة.`
          }
        ];

  const keywords =
    Array.isArray(parsed.keywords) && parsed.keywords.length
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
