import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const INPUT_PATH = path.join(process.cwd(), "content/raw-news.json");
const OUTPUT_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function leagueName(slug = "") {
  if (slug === "premier-league") return "الدوري الإنجليزي الممتاز";
  if (slug === "la-liga") return "الدوري الإسباني";
  return "كرة القدم الأوروبية";
}

function sourceArabic(source = "") {
  if (source.includes("BBC")) return "بي بي سي سبورت";
  if (source.includes("Sky")) return "سكاي سبورت";
  return "المصدر الرياضي";
}

function buildSlug(index) {
  if (index === 0) return "real-madrid-win";
  if (index === 1) return "barcelona-match";
  return `article-${index + 1}`;
}

function buildImage(index) {
  const images = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80"
  ];

  return images[index % images.length];
}

function sanitizeArabicText(text = "") {
  let value = String(text);

  value = value.replace(/```json/gi, "");
  value = value.replace(/```/g, "");
  value = value.replace(/\r/g, "");

  const lines = value.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;

    const latinCount = (trimmed.match(/[A-Za-z]/g) || []).length;
    const arabicCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;

    if (latinCount > 0 && arabicCount === 0) return false;
    if (latinCount > arabicCount && latinCount > 8) return false;

    return true;
  });

  value = filteredLines.join("\n");

  value = value.replace(/[A-Za-z]{4,}[^\n]*/g, "");
  value = value.replace(/\s+/g, " ").trim();

  return value;
}

function sanitizeKeywords(keywords) {
  if (!Array.isArray(keywords)) return [];
  return keywords
    .map((k) => sanitizeArabicText(k))
    .map((k) => normalizeText(k))
    .filter(Boolean)
    .slice(0, 8);
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text).match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function buildFallbackArticle(item, index) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);

  const title =
    index % 4 === 0
      ? `آخر أخبار ${league}`
      : index % 4 === 1
      ? `مستجدات ${league}`
      : index % 4 === 2
      ? `تحليل جديد في ${league}`
      : `تطورات مهمة في ${league}`;

  const description = `نقدم في هذا التقرير تغطية عربية لأبرز مستجدات ${league} مع متابعة مستمرة لأهم الملفات الرياضية المتداولة عبر ${source}.`;

  const content = [
    `يشهد ${league} خلال هذه الفترة متابعة جماهيرية كبيرة، مع تصاعد الاهتمام بكل ما يتعلق بالأندية واللاعبين والمباريات الحاسمة.`,
    `وفي هذا الإطار، تواصل منصة نبض الرياضة تقديم تغطية عربية يومية تساعد القارئ على فهم أبرز التطورات الجارية بلغة واضحة ومباشرة.`,
    `وتتابع وسائل الإعلام الرياضية عدة ملفات مرتبطة بالمنافسة، سواء على مستوى الجوانب الفنية أو التحضيرات الخاصة بالمباريات المقبلة أو وضعية بعض اللاعبين داخل فرقهم.`,
    `كما تزداد أهمية هذه الأخبار مع اقتراب المراحل الحاسمة من الموسم، حيث يصبح لكل قرار فني أو إداري أثر واضح على شكل المنافسة ومسار النتائج.`,
    `وتحاول الفرق الكبرى الحفاظ على التوازن الفني والاستقرار داخل المجموعة، خاصة مع ضغط المباريات وارتفاع سقف التوقعات من الجماهير والإعلام.`,
    `ومن المنتظر أن تكشف الأيام المقبلة عن مزيد من التفاصيل التي قد تؤثر في المشهد العام، سواء من حيث الجاهزية أو الخيارات التكتيكية أو حسابات الترتيب.`,
    `في نبض الرياضة، نواصل تقديم محتوى عربي رياضي محدث يركز على أهم الأخبار والتحليلات في ${league} ويمنح القارئ صورة أوضح عن مجريات الأحداث.`
  ].join("\n\n");

  return {
    title,
    description,
    seoTitle: `${title} | نبض الرياضة`,
    seoDescription: description,
    content,
    keywords: [league, "أخبار رياضية", "كرة القدم", "تحليلات رياضية", "نتائج المباريات"]
  };
}

async function rewriteArticle(item, index) {
  const sourceTitle = normalizeText(item.originalTitle || item.title || "");
  const sourceDescription = normalizeText(item.originalDescription || item.description || "");
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);

  if (!OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY missing, using Arabic fallback.");
    return buildFallbackArticle(item, index);
  }

  const prompt = `
أنت محرر رياضي عربي محترف ومتخصص في إعادة صياغة الأخبار الرياضية لمحركات البحث.

المهمة:
اكتب مقالاً عربياً صحفياً جديداً بالكامل اعتماداً على بيانات خبر رياضي مصدره RSS.

بيانات المصدر:
- البطولة: ${league}
- المصدر: ${source}
- عنوان الخبر الأصلي: ${sourceTitle}
- وصف الخبر الأصلي: ${sourceDescription}

المطلوب:
- إنتاج مقال عربي طبيعي ومقروء ومفيد
- يمنع منعاً باتاً إدخال أي جملة إنجليزية في الناتج
- إذا ظهرت أسماء أجنبية، اكتبها بالعربية فقط
- لا تنقل الخبر حرفياً
- لا تضع عنوان الخبر الأصلي الإنجليزي داخل المقال
- لا تضع الوصف الأصلي الإنجليزي داخل المقال
- أنشئ عنواناً عربياً جديداً ومحسناً للسيو
- أنشئ وصفاً عربياً قصيراً مناسباً للسيو
- أنشئ عنوان SEO منفصلاً
- أنشئ وصف SEO منفصلاً
- أنشئ مقالاً من 700 إلى 900 كلمة تقريباً
- قسّم المقال إلى فقرات واضحة
- اجعل الأسلوب صحفياً احترافياً مناسباً لموقع رياضي عربي
- أضف كلمات مفتاحية عربية مرتبطة بالخبر بشكل طبيعي
- أعد فقط JSON صالحاً دون أي شرح خارجي

صيغة JSON المطلوبة:
{
  "title": "عنوان عربي",
  "description": "وصف عربي مختصر",
  "seoTitle": "عنوان سيو عربي",
  "seoDescription": "وصف سيو عربي",
  "content": "مقال عربي كامل",
  "keywords": ["كلمة مفتاحية 1", "كلمة مفتاحية 2", "كلمة مفتاحية 3", "كلمة مفتاحية 4"]
}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "أنت محرر رياضي عربي محترف. يجب أن يكون الناتج عربياً فقط. لا تستخدم أي سطر إنجليزي في الإجابة النهائية."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("OpenAI API error:", JSON.stringify(data));
      return buildFallbackArticle(item, index);
    }

    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.log("No content returned from OpenAI.");
      return buildFallbackArticle(item, index);
    }

    const parsed = extractJson(rawContent);

    if (!parsed) {
      console.log("Could not parse JSON from OpenAI output.");
      return buildFallbackArticle(item, index);
    }

    const fallback = buildFallbackArticle(item, index);

    const title = sanitizeArabicText(parsed.title || fallback.title);
    const description = sanitizeArabicText(parsed.description || fallback.description);
    const seoTitle = sanitizeArabicText(parsed.seoTitle || `${title} | نبض الرياضة`);
    const seoDescription = sanitizeArabicText(parsed.seoDescription || description);
    const content = sanitizeArabicText(parsed.content || fallback.content);
    const keywords = sanitizeKeywords(parsed.keywords);

    return {
      title: title || fallback.title,
      description: description || fallback.description,
      seoTitle: seoTitle || `${fallback.title} | نبض الرياضة`,
      seoDescription: seoDescription || fallback.description,
      content: content || fallback.content,
      keywords: keywords.length ? keywords : fallback.keywords
    };
  } catch (error) {
    console.log("Rewrite failed:", error.message);
    return buildFallbackArticle(item, index);
  }
}

async function main() {
  let rawItems = [];

  try {
    rawItems = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  } catch (error) {
    console.error("Unable to read raw-news.json:", error.message);
    process.exit(1);
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    console.log("No raw news found, nothing to rewrite.");
    process.exit(0);
  }

  const articles = [];

  for (let i = 0; i < rawItems.length; i++) {
    const label = rawItems[i].originalTitle || rawItems[i].title || `خبر ${i + 1}`;
    console.log("Rewriting:", label);

    const rewritten = await rewriteArticle(rawItems[i], i);

    articles.push({
      slug: buildSlug(i),
      title: rewritten.title,
      description: rewritten.description,
      seoTitle: rewritten.seoTitle,
      seoDescription: rewritten.seoDescription,
      content: rewritten.content,
      keywords: rewritten.keywords,
      image: buildImage(i)
    });
  }

  ensureDir(OUTPUT_PATH);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(articles, null, 2), "utf-8");
  console.log("SEO articles saved:", articles.length);
}

main();
