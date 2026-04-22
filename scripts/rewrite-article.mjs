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
  let value = String(text || "");
  value = removeMarkdownFences(value).replace(/\r/g, "");

  const lines = value.split("\n");
  const kept = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const latinCount = (trimmed.match(/[A-Za-z]/g) || []).length;
    const arabicCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;

    if (latinCount > 0 && arabicCount === 0) continue;
    if (latinCount > arabicCount && latinCount > 4) continue;

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
  return "كرة القدم";
}

function sourceArabic(source = "") {
  if (source.includes("BBC")) return "بي بي سي سبورت";
  if (source.includes("Sky")) return "سكاي سبورت";
  if (source.includes("Btolat")) return "بطولات";
  if (source.includes("Kooora")) return "كووورة";
  if (source.includes("Hesport")) return "هسبورت";
  if (source.includes("Al Jazeera")) return "الجزيرة رياضة";
  if (source.includes("Al Araby")) return "العربي الجديد رياضة";
  if (source.includes("Elsport")) return "إلسبورت";
  return "المصدر الرياضي";
}

function buildSlug(item, index) {
  const prefix =
    item.league === "premier-league"
      ? "premier-league"
      : item.league === "la-liga"
      ? "la-liga"
      : "football";

  return `${prefix}-${index + 1}`;
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

function fallbackArticle(item, index) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);
  const originalTitle = normalizeText(item.originalTitle || `خبر رياضي ${index + 1}`);

  const titleVariants = [
    `تفاصيل جديدة حول ${league}`,
    `تطورات مهمة في ${league}`,
    `قراءة في ملف جديد يخص ${league}`,
    `ماذا يحدث في ${league}؟`,
    `متابعة خاصة لآخر أخبار ${league}`,
    `تحليل لأبرز أحداث ${league}`
  ];

  const descVariants = [
    `يستعرض هذا التقرير أبرز الخلفيات المرتبطة بموضوع رياضي متداول داخل ${league} اعتمادًا على متابعة عربية للمشهد الحالي.`,
    `نقدم في هذا المقال قراءة عربية لأحد الملفات الرياضية التي تثير اهتمام المتابعين في ${league}.`,
    `يتناول هذا التقرير زاوية مختلفة لخبر متداول في ${league} مع إبراز أهم أبعاده الرياضية المحتملة.`
  ];

  const title = titleVariants[index % titleVariants.length];
  const description = descVariants[index % descVariants.length];

  const content = [
    `يحظى ${league} خلال هذه المرحلة باهتمام جماهيري واسع، في ظل تزايد الأخبار التي ترتبط بالأندية واللاعبين والقرارات الفنية المختلفة.`,
    `وينطلق هذا التقرير من موضوع رياضي متداول في وسائل الإعلام، حيث برزت المتابعة حول ملف يرتبط بعنوان عام يتمحور حول: ${originalTitle}.`,
    `وتسعى منصة نبض الرياضة إلى إعادة تقديم هذه الملفات في صياغة عربية واضحة تساعد القارئ على فهم خلفية الحدث وأبعاده العامة بعيدًا عن التكرار أو النقل المباشر.`,
    `وتشير القراءة العامة إلى أن أهمية هذا الموضوع لا ترتبط بالتفصيل الآني فقط، بل تمتد إلى ما يمكن أن ينعكس على الأندية المعنية وعلى مسار المنافسة في الفترة المقبلة.`,
    `كما تبدو هذه النوعية من الأخبار ذات قيمة كبيرة بالنسبة للمتابع العربي، لأنها تكشف الكثير من التفاصيل المرتبطة بحركة الفرق أو اختياراتها أو موقعها في المنافسة.`,
    `وتحاول الأندية الكبرى خلال هذه المرحلة الحفاظ على أكبر قدر ممكن من التوازن، سواء على مستوى الأداء أو الجاهزية أو إدارة ضغط المباريات المتتالية.`,
    `ومن المنتظر أن تكشف الأيام المقبلة عن معطيات إضافية قد تجعل هذا الملف أكثر وضوحًا، وهو ما يمنح المتابعين فرصة أفضل لفهم الصورة الكاملة.`,
    `في نبض الرياضة، نواصل تقديم محتوى عربي رياضي متجدد يشرح أهم الأحداث بلغة صحفية واضحة، ويمنح القارئ ملخصًا عمليًا ومفيدًا لمتابعة آخر التطورات.`
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

async function callOpenAI(prompt, temperature = 0.4) {
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
              "أنت محرر رياضي عربي محترف. يجب أن تكون جميع المخرجات بالعربية فقط. لا تترك أي سطر أو عبارة باللغة الإنجليزية."
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

async function translateSourceToArabic(item) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);
  const originalTitle = normalizeText(item.originalTitle || "");
  const originalDescription = normalizeText(item.originalDescription || "");

  const prompt = `
حوّل بيانات هذا الخبر الرياضي إلى العربية فقط.

المعطيات:
- البطولة: ${league}
- المصدر: ${source}
- العنوان: ${originalTitle}
- الوصف: ${originalDescription}

المطلوب:
- ترجم المعنى إلى العربية فقط
- اكتب الأسماء الأجنبية بالعربية
- لا تترك أي كلمة إنجليزية
- لا تضف شرحًا
- أعد JSON فقط

الصيغة:
{
  "arabicTitle": "...",
  "arabicDescription": "...",
  "mainTopic": "...",
  "entities": ["...", "..."],
  "topicType": "..."
}
`;

  const raw = await callOpenAI(prompt, 0.2);
  if (!raw) return null;

  const parsed = extractJson(raw);
  if (!parsed) return null;

  return {
    arabicTitle: sanitizeArabic(parsed.arabicTitle || ""),
    arabicDescription: sanitizeArabic(parsed.arabicDescription || ""),
    mainTopic: sanitizeArabic(parsed.mainTopic || ""),
    entities: Array.isArray(parsed.entities) ? parsed.entities.map((e) => sanitizeArabic(e)).filter(Boolean) : [],
    topicType: sanitizeArabic(parsed.topicType || "")
  };
}

async function writeSeoArticle(item, translated, index) {
  const league = leagueName(item.league);

  const prompt = `
اكتب مقالاً عربياً رياضياً فريداً ومحسناً لمحركات البحث انطلاقًا من هذه المعطيات المعربة.

المعطيات:
- البطولة: ${league}
- العنوان المعرب: ${translated.arabicTitle}
- الوصف المعرب: ${translated.arabicDescription}
- الموضوع الأساسي: ${translated.mainTopic}
- الأطراف الرئيسية: ${(translated.entities || []).join("، ")}
- نوع الموضوع: ${translated.topicType}

المطلوب:
- عنوان عربي مختلف وواضح
- وصف عربي مختلف
- seoTitle
- seoDescription
- مقال عربي من 700 إلى 900 كلمة تقريبًا
- اجعل المقال متعلقًا مباشرة بهذا الموضوع
- لا تستخدم أي جمل إنجليزية
- لا تكرر نفس المقدمة أو نفس الوصف الموجود في بقية المقالات
- اجعل المقال يبدو كمادة صحفية أصلية وليس كتلخيص آلي
- أعد JSON فقط

الصيغة:
{
  "title": "...",
  "description": "...",
  "seoTitle": "...",
  "seoDescription": "...",
  "content": "...",
  "keywords": ["...", "...", "...", "..."]
}
`;

  const raw = await callOpenAI(prompt, 0.75);
  if (!raw) return null;

  const parsed = extractJson(raw);
  if (!parsed) return null;

  return {
    title: sanitizeArabic(parsed.title || ""),
    description: sanitizeArabic(parsed.description || ""),
    seoTitle: sanitizeArabic(parsed.seoTitle || ""),
    seoDescription: sanitizeArabic(parsed.seoDescription || ""),
    content: sanitizeArabic(parsed.content || ""),
    keywords: sanitizeKeywords(parsed.keywords)
  };
}

async function arabizeIfNeeded(text, label = "النص") {
  const cleaned = sanitizeArabic(text);
  if (!containsLatin(cleaned)) return cleaned;

  const prompt = `
حوّل هذا ${label} إلى العربية فقط.
- لا تترك أي كلمات أو جمل إنجليزية
- اكتب أسماء اللاعبين والأندية بالعربية
- أعد النص فقط

النص:
${cleaned}
`;

  const raw = await callOpenAI(prompt, 0.1);

  if (!raw) {
    return sanitizeArabic(cleaned.replace(/[A-Za-z0-9][^.\n]*[.\n]?/g, ""));
  }

  return sanitizeArabic(raw);
}

async function rewriteArticle(item, index) {
  const fallback = fallbackArticle(item, index);

  const translated = await translateSourceToArabic(item);
  if (!translated || !translated.mainTopic) {
    console.log("Translation pass failed, using fallback.");
    return fallback;
  }

  const draft = await writeSeoArticle(item, translated, index);
  if (!draft) {
    console.log("Writing pass failed, using fallback.");
    return fallback;
  }

  let title = draft.title || fallback.title;
  let description = draft.description || fallback.description;
  let seoTitle = draft.seoTitle || `${title} | نبض الرياضة`;
  let seoDescription = draft.seoDescription || description;
  let content = draft.content || fallback.content;
  let keywords = draft.keywords.length ? draft.keywords : fallback.keywords;

  title = await arabizeIfNeeded(title, "العنوان");
  description = await arabizeIfNeeded(description, "الوصف");
  seoTitle = await arabizeIfNeeded(seoTitle, "عنوان السيو");
  seoDescription = await arabizeIfNeeded(seoDescription, "وصف السيو");
  content = await arabizeIfNeeded(content, "المقال");

  if (!title || !description || !content) {
    return fallback;
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
    console.log("No raw news found.");
    process.exit(0);
  }

  const unique = [];
  const seen = new Set();

  for (const item of rawItems) {
    const key = normalizeText(item.originalTitle || "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  const selected = unique.slice(0, 12);
  const articles = [];

  for (let i = 0; i < selected.length; i++) {
    const label = selected[i].originalTitle || `خبر ${i + 1}`;
    console.log("Rewriting:", label);

    const rewritten = await rewriteArticle(selected[i], i);

    articles.push({
      slug: buildSlug(selected[i], i),
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
