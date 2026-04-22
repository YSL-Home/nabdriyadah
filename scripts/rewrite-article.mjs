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

function removeMarkdownFences(text = "") {
  return String(text).replace(/```json/gi, "").replace(/```/g, "").trim();
}

function extractJson(text = "") {
  const cleaned = removeMarkdownFences(text);

  try {
    return JSON.parse(cleaned);
  } catch {}

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function containsLatin(text = "") {
  return /[A-Za-z]/.test(String(text));
}

function sanitizeArabic(text = "") {
  let value = String(text);

  value = removeMarkdownFences(value);
  value = value.replace(/\r/g, "");

  const lines = value.split("\n");
  const kept = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const latinCount = (trimmed.match(/[A-Za-z]/g) || []).length;
    const arabicCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;

    if (latinCount > 0 && arabicCount === 0) continue;
    if (latinCount > arabicCount && latinCount > 6) continue;

    kept.push(trimmed);
  }

  value = kept.join("\n\n");
  value = value.replace(/\n{3,}/g, "\n\n");
  value = value.replace(/[ ]{2,}/g, " ").trim();

  return value;
}

function sanitizeKeywords(keywords) {
  if (!Array.isArray(keywords)) return [];
  return keywords
    .map((k) => sanitizeArabic(k))
    .map((k) => normalizeText(k))
    .filter(Boolean)
    .slice(0, 8);
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

function buildImage(index) {
  const images = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80"
  ];

  return images[index % images.length];
}

function buildSlug(item, index) {
  const prefix =
    item.league === "premier-league"
      ? "premier-league"
      : item.league === "la-liga"
      ? "la-liga"
      : "football-news";

  return `${prefix}-${index + 1}`;
}

function fallbackArticle(item, index) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);
  const originalTitle = normalizeText(item.originalTitle || item.title || `خبر رياضي ${index + 1}`);

  const variants = [
    `تطورات مهمة تخص ${league}`,
    `قراءة في آخر مستجدات ${league}`,
    `ملف جديد عن أبرز أخبار ${league}`,
    `متابعة تفصيلية لأهم أحداث ${league}`
  ];

  const title = `${variants[index % variants.length]}`;
  const description = `يستعرض هذا التقرير أبرز الجوانب المرتبطة بخبر رياضي متداول في ${league} مع متابعة لأهم الزوايا التي تناولها ${source}.`;

  const content = [
    `يشهد ${league} في هذه المرحلة اهتمامًا جماهيريًا واسعًا، في ظل تزايد النقاشات حول أبرز الملفات المرتبطة بالمنافسة والأندية واللاعبين البارزين.`,
    `وينطلق هذا التقرير من خبر رياضي متداول ركّز على موضوع أساسي يرتبط بالمشهد الحالي داخل البطولة، حيث جاءت المتابعة الإعلامية حول ملف عنوانه العام يدور حول تطورات مرتبطة بخبر: ${originalTitle}.`,
    `وتسعى منصة نبض الرياضة إلى إعادة تقديم هذه الأخبار في صياغة عربية واضحة ومباشرة، بعيدًا عن النقل الحرفي، مع التركيز على المعنى العام والخلفية الرياضية التي تساعد القارئ على فهم أوسع للسياق.`,
    `وتشير القراءة العامة لهذا الملف إلى أن التطورات الحالية لا تقف عند حدود الخبر نفسه، بل تمتد لتشمل انعكاساته على الأندية المعنية وحسابات المرحلة المقبلة من الموسم.`,
    `كما تبدو أهمية هذا النوع من الأخبار كبيرة بالنسبة للمتابع العربي، خاصة عندما يتعلق الأمر بقرارات فنية أو تحركات محتملة أو مؤشرات ترتبط بوضع فريق بعينه داخل المنافسة.`,
    `وتحاول الفرق الكبرى خلال هذه المرحلة الحفاظ على قدر من الاستقرار داخل المجموعة، سواء من حيث الخيارات الفنية أو الجاهزية البدنية أو إدارة ضغط المباريات المتتالية.`,
    `ومن المتوقع أن تكشف الأيام المقبلة عن أبعاد إضافية لهذا الملف، وهو ما يجعل متابعة التفاصيل الجديدة أمرًا مهمًا لفهم الصورة كاملة داخل ${league}.`,
    `في نبض الرياضة، نواصل تقديم محتوى عربي رياضي متجدد يشرح الأخبار الجارية بلغة واضحة، ويمنح القارئ ملخصًا تحليليًا يساعده على متابعة أبرز ما يحدث أولًا بأول.`
  ].join("\n\n");

  return {
    title,
    description,
    seoTitle: `${title} | نبض الرياضة`,
    seoDescription: description,
    content,
    keywords: [league, "أخبار رياضية", "كرة القدم", "تحليلات رياضية", "انتقالات", "نتائج المباريات"]
  };
}

async function callOpenAI(prompt, temperature = 0.7) {
  if (!OPENAI_API_KEY) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature,
        messages: [
          {
            role: "system",
            content:
              "أنت محرر رياضي عربي محترف. يجب أن تكون كل المخرجات باللغة العربية فقط، ويمنع إدخال أي جمل إنجليزية."
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
      return null;
    }

    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.log("OpenAI request failed:", error.message);
    return null;
  }
}

async function arabizeIfNeeded(text, label = "النص") {
  const cleaned = sanitizeArabic(text);

  if (!containsLatin(cleaned)) return cleaned;

  const prompt = `
حوّل هذا ${label} إلى العربية فقط.
- ممنوع ترك أي عبارة إنجليزية
- اكتب أسماء الفرق واللاعبين والأندية بالعربية
- أعد النص فقط دون شرح إضافي

النص:
${cleaned}
`;

  const result = await callOpenAI(prompt, 0.2);

  if (!result) {
    return sanitizeArabic(cleaned.replace(/[A-Za-z0-9][^.\n]*[.\n]?/g, ""));
  }

  return sanitizeArabic(result);
}

async function rewriteArticle(item, index) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);

  const originalTitle = normalizeText(item.originalTitle || item.title || "");
  const originalDescription = normalizeText(item.originalDescription || item.description || "");

  if (!OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY missing, using fallback article.");
    return fallbackArticle(item, index);
  }

  const prompt = `
أعد صياغة هذا الخبر الرياضي في صورة مقال عربي صحفي احترافي ومحسن لمحركات البحث.

المعطيات:
- البطولة: ${league}
- المصدر: ${source}
- عنوان الخبر الأصلي: ${originalTitle}
- وصف الخبر الأصلي: ${originalDescription}

التعليمات الدقيقة:
- أنشئ مقالاً مختلفاً فعلاً عن باقي المقالات
- يجب أن يستند المقال إلى الفكرة الخاصة بهذا الخبر تحديداً
- لا تستخدم أي جملة إنجليزية في الناتج النهائي
- لا تضع عنوان الخبر الأصلي الإنجليزي داخل المقال
- لا تضع الوصف الأصلي الإنجليزي داخل المقال
- اكتب الأسماء الأجنبية بالعربية عند الحاجة
- اكتب عنوانًا عربيًا مختلفًا ومميزًا
- اكتب وصفًا عربيًا قصيرًا مختلفًا
- اكتب seoTitle مختلفًا
- اكتب seoDescription مختلفًا
- اكتب مقالاً من 700 إلى 900 كلمة تقريباً
- اجعل المقدمة مختلفة عن المقالات الأخرى
- اجعل زاوية التناول مناسبة للخبر نفسه
- أضف كلمات مفتاحية عربية مرتبطة فعلًا بالموضوع
- أعد فقط JSON صالحاً دون أي شرح إضافي

صيغة JSON:
{
  "title": "عنوان عربي مميز",
  "description": "وصف عربي مختلف",
  "seoTitle": "عنوان سيو عربي",
  "seoDescription": "وصف سيو عربي",
  "content": "مقال عربي كامل وفريد",
  "keywords": ["...", "...", "...", "..."]
}
`;

  const rawResult = await callOpenAI(prompt, 0.75);

  if (!rawResult) {
    return fallbackArticle(item, index);
  }

  const parsed = extractJson(rawResult);

  if (!parsed) {
    console.log("JSON parse failed, using fallback.");
    return fallbackArticle(item, index);
  }

  const fallback = fallbackArticle(item, index);

  let title = sanitizeArabic(parsed.title || fallback.title);
  let description = sanitizeArabic(parsed.description || fallback.description);
  let seoTitle = sanitizeArabic(parsed.seoTitle || `${title} | نبض الرياضة`);
  let seoDescription = sanitizeArabic(parsed.seoDescription || description);
  let content = sanitizeArabic(parsed.content || fallback.content);
  let keywords = sanitizeKeywords(parsed.keywords);

  title = await arabizeIfNeeded(title, "العنوان");
  description = await arabizeIfNeeded(description, "الوصف");
  seoTitle = await arabizeIfNeeded(seoTitle, "عنوان السيو");
  seoDescription = await arabizeIfNeeded(seoDescription, "وصف السيو");
  content = await arabizeIfNeeded(content, "المقال");

  if (!title || !description || !content) {
    return fallback;
  }

  if (!keywords.length) {
    keywords = fallback.keywords;
  }

  return {
    title,
    description,
    seoTitle,
    seoDescription,
    content,
    keywords
  };
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

  const uniqueItems = [];
  const seen = new Set();

  for (const item of rawItems) {
    const key = normalizeText(item.originalTitle || item.title || "");
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueItems.push(item);
  }

  const limitedItems = uniqueItems.slice(0, 12);
  const articles = [];

  for (let i = 0; i < limitedItems.length; i++) {
    const label = limitedItems[i].originalTitle || limitedItems[i].title || `خبر ${i + 1}`;
    console.log("Rewriting:", label);

    const rewritten = await rewriteArticle(limitedItems[i], i);

    articles.push({
      slug: buildSlug(limitedItems[i], i),
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
