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

function containsLatin(text = "") {
  return /[A-Za-z]/.test(String(text));
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

function sanitizeArabic(text = "") {
  let value = String(text);

  value = removeMarkdownFences(value);
  value = value.replace(/\r/g, "");

  const lines = value.split("\n").map((line) => line.trim());
  const kept = [];

  for (const line of lines) {
    if (!line) continue;

    const latinCount = (line.match(/[A-Za-z]/g) || []).length;
    const arabicCount = (line.match(/[\u0600-\u06FF]/g) || []).length;

    if (latinCount > 0 && arabicCount === 0) continue;
    if (latinCount > arabicCount && latinCount > 6) continue;

    kept.push(line);
  }

  value = kept.join("\n\n");
  value = value.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  value = value.replace(/[ ]{2,}/g, " ").trim();

  return value;
}

async function callOpenAI(prompt, temperature = 0.5) {
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
              "أنت محرر رياضي عربي محترف. يجب أن يكون الناتج بالعربية فقط، دون أي جمل إنجليزية."
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

async function arabizeIfNeeded(text, fieldLabel = "النص") {
  const cleaned = sanitizeArabic(text);

  if (!containsLatin(cleaned)) {
    return cleaned;
  }

  const prompt = `
حوّل هذا ${fieldLabel} إلى العربية فقط.
التزم بما يلي:
- لا تترك أي عبارة إنجليزية
- إن وجدت أسماء أندية أو لاعبين فاكتبها بالعربية
- لا تضف أي شرح خارجي
- أعد النص فقط

النص:
${cleaned}
`;

  const result = await callOpenAI(prompt, 0.2);

  if (!result) {
    return sanitizeArabic(cleaned.replace(/[A-Za-z0-9][^.\n]*[.\n]?/g, ""));
  }

  return sanitizeArabic(result);
}

function fallbackArticle(item, index) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);

  const variants = [
    `تطورات مهمة في ${league}`,
    `مستجدات جديدة في ${league}`,
    `قراءة في آخر أخبار ${league}`,
    `ملف رياضي جديد عن ${league}`
  ];

  const title = variants[index % variants.length];
  const description = `نقدم في هذا التقرير قراءة عربية لأبرز الأخبار المرتبطة بـ ${league} مع متابعة لأهم الملفات الرياضية المتداولة عبر ${source}.`;

  const content = [
    `يشهد ${league} خلال هذه المرحلة اهتمامًا جماهيريًا كبيرًا، في ظل تسارع الأخبار المرتبطة بالأندية واللاعبين والمواجهات المؤثرة في مسار الموسم.`,
    `وتحرص منصة نبض الرياضة على تقديم متابعة عربية متجددة تساعد القارئ على فهم أهم التطورات بصورة أوضح، مع صياغة صحفية مباشرة ومناسبة للمتابعة اليومية.`,
    `وتشير المعطيات المتداولة إلى أن الملف الحالي يرتبط بتحركات رياضية تهم جماهير البطولة، سواء على مستوى الجوانب الفنية أو الخيارات المرتبطة بالمرحلة المقبلة من المنافسة.`,
    `كما تبدو الأندية الكبرى معنية بالحفاظ على الاستقرار الفني وتحقيق أفضل النتائج الممكنة، خاصة مع ضغط المباريات واشتداد المنافسة على المراكز المتقدمة.`,
    `وتزداد قيمة هذه الأخبار مع اقتراب الفترات الحاسمة، إذ يمكن لأي تغيير فني أو إداري أو تكتيكي أن ينعكس على أداء الفرق وترتيبها العام.`,
    `ومن المنتظر أن تكشف الأيام المقبلة عن مزيد من التفاصيل التي ستحدد ملامح المشهد بشكل أوضح، وهو ما يجعل المتابعة اليومية ضرورية لعشاق كرة القدم.`,
    `في نبض الرياضة، نواصل تقديم محتوى عربي رياضي متجدد يركز على أهم أخبار ${league} ويمنح القارئ ملخصًا واضحًا ومفيدًا حول أبرز ما يجري داخل البطولة.`
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
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);

  const originalTitle = normalizeText(item.originalTitle || item.title || "");
  const originalDescription = normalizeText(item.originalDescription || item.description || "");

  if (!OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY missing, using fallback.");
    return fallbackArticle(item, index);
  }

  const prompt = `
أعد صياغة هذا الخبر الرياضي في صورة مقال عربي صحفي احترافي ومحسن لمحركات البحث.

المعطيات:
- البطولة: ${league}
- المصدر: ${source}
- عنوان الخبر الأصلي: ${originalTitle}
- الوصف الأصلي: ${originalDescription}

المطلوب:
- اكتب مقالاً عربياً مختلفاً وليس نصًا عامًا مكررًا
- اجعل المقال مرتبطًا فعلًا بعنوان الخبر الأصلي ووصفه
- استخرج الفكرة الأساسية من الخبر ثم قدّمها بأسلوب عربي احترافي
- امنع تمامًا ظهور أي سطر إنجليزي في المخرجات
- لا تنقل العنوان الأصلي الإنجليزي كما هو داخل المقال
- اكتب الأسماء الأجنبية بالعربية إن لزم
- أنشئ عنوانًا عربيًا جديدًا قويًا
- أنشئ وصفًا عربيًا مختصرًا
- أنشئ seoTitle
- أنشئ seoDescription
- أنشئ مقالاً من 700 إلى 900 كلمة تقريبًا
- قسّم المقال إلى فقرات واضحة
- أضف كلمات مفتاحية عربية مرتبطة فعلًا بالموضوع
- يجب أن يكون الناتج JSON فقط

الصيغة المطلوبة:
{
  "title": "عنوان عربي مميز",
  "description": "وصف عربي قصير",
  "seoTitle": "عنوان سيو عربي",
  "seoDescription": "وصف سيو عربي",
  "content": "مقال عربي كامل",
  "keywords": ["...", "...", "...", "..."]
}
`;

  const rawResult = await callOpenAI(prompt, 0.7);

  if (!rawResult) {
    return fallbackArticle(item, index);
  }

  const parsed = extractJson(rawResult);

  if (!parsed) {
    console.log("JSON parse failed, using fallback.");
    return fallbackArticle(item, index);
  }

  let title = sanitizeArabic(parsed.title || "");
  let description = sanitizeArabic(parsed.description || "");
  let seoTitle = sanitizeArabic(parsed.seoTitle || "");
  let seoDescription = sanitizeArabic(parsed.seoDescription || "");
  let content = sanitizeArabic(parsed.content || "");
  let keywords = Array.isArray(parsed.keywords) ? parsed.keywords.map((k) => sanitizeArabic(k)).filter(Boolean) : [];

  title = await arabizeIfNeeded(title, "العنوان");
  description = await arabizeIfNeeded(description, "الوصف");
  seoTitle = await arabizeIfNeeded(seoTitle || `${title} | نبض الرياضة`, "عنوان السيو");
  seoDescription = await arabizeIfNeeded(seoDescription || description, "وصف السيو");
  content = await arabizeIfNeeded(content, "المقال");

  if (!title || !description || !content) {
    return fallbackArticle(item, index);
  }

  if (!keywords.length) {
    keywords = [league, "أخبار رياضية", "كرة القدم", "تحليلات رياضية"];
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
