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

function buildTitleVariant(baseTopic, league, index) {
  const patterns = [
    `تفاصيل جديدة حول ${baseTopic}`,
    `ماذا يحدث في ملف ${baseTopic}؟`,
    `تطورات لافتة تخص ${baseTopic}`,
    `قراءة في خلفيات ${baseTopic}`,
    `آخر المستجدات بشأن ${baseTopic}`,
    `ملف ${baseTopic} يفرض نفسه في ${league}`,
    `كيف تتطور قصة ${baseTopic}؟`,
    `متابعة خاصة لتفاصيل ${baseTopic}`
  ];

  return patterns[index % patterns.length];
}

function buildDescriptionVariant(baseTopic, league, source, index) {
  const patterns = [
    `نستعرض في هذا التقرير أبرز التفاصيل المرتبطة بملف ${baseTopic} في ${league} وفق المعطيات المتداولة في ${source}.`,
    `يتناول هذا المقال آخر التطورات الخاصة بموضوع ${baseTopic} مع قراءة عربية لأبعاده داخل ${league}.`,
    `في هذا التقرير نتابع الخلفيات الأساسية لخبر ${baseTopic} وتأثيره المحتمل على المشهد الحالي في ${league}.`,
    `نقدم قراءة صحفية مختصرة لملف ${baseTopic} كما يظهر في التغطية الرياضية المرتبطة بـ ${league}.`
  ];

  return patterns[index % patterns.length];
}

function fallbackArticle(item, index) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);
  const originalTitle = normalizeText(item.originalTitle || `خبر رياضي ${index + 1}`);
  const topic = originalTitle.length > 70 ? originalTitle.slice(0, 70) : originalTitle;

  const title = buildTitleVariant(topic, league, index);
  const description = buildDescriptionVariant(topic, league, source, index);

  const intros = [
    `يحظى هذا الملف بمتابعة كبيرة داخل ${league} في ظل تزايد الحديث عن أبعاده الفنية والرياضية.`,
    `يتصدر هذا الموضوع مساحة مهمة من النقاشات المرتبطة بـ ${league} خلال المرحلة الحالية.`,
    `يعيد هذا الخبر تسليط الضوء على واحد من الملفات البارزة في ${league}.`,
    `تواصل التطورات المرتبطة بهذا الملف جذب اهتمام المتابعين في ${league}.`
  ];

  const p2 = [
    `وتشير المعطيات المتاحة إلى أن جوهر الخبر يرتبط بعنوان متداول يدور حول: ${topic}.`,
    `وبحسب ما يتم تداوله في التغطيات الحالية، فإن القضية الأساسية في هذا الخبر تتمحور حول: ${topic}.`,
    `ويبدو من متابعة الخبر أن النقاش الرئيسي يدور حول ملف عنوانه العام: ${topic}.`
  ];

  const content = [
    intros[index % intros.length],
    p2[index % p2.length],
    `ويأتي هذا الاهتمام في وقت تزداد فيه أهمية التفاصيل المرتبطة بالأندية واللاعبين والخيارات الفنية داخل ${league}.`,
    `وتحاول وسائل الإعلام الرياضية تقديم صورة أوضح عن خلفية هذا الملف، خاصة مع ارتباطه باحتمالات قد يكون لها أثر على المرحلة المقبلة.`,
    `كما ينظر المتابعون إلى هذه التطورات باعتبارها جزءًا من المشهد الأوسع داخل المنافسة، سواء من حيث القرارات أو التحركات أو الانعكاسات المحتملة.`,
    `ومن المتوقع أن تكشف الأيام المقبلة عن معلومات إضافية تساعد على فهم هذا الموضوع بصورة أدق، وهو ما يمنح الخبر أهمية أكبر لدى الجمهور.`,
    `في نبض الرياضة، نتابع مثل هذه الملفات بصياغة عربية واضحة تركز على الفكرة الأساسية وتقدمها للقارئ بشكل مباشر ومفيد.`
  ].join("\n\n");

  return {
    title,
    description,
    seoTitle: `${title} | نبض الرياضة`,
    seoDescription: description,
    content,
    keywords: [league, "أخبار رياضية", "كرة القدم", "نتائج المباريات", "انتقالات"]
  };
}

async function callOpenAI(prompt, temperature = 0.3) {
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
              "أنت محرر في موقع رياضي عربي. أعد صياغة الأخبار بالعربية فقط، بأسلوب صحفي مباشر ومقروء، دون مقدمات عامة مكررة."
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
- لا تترك أي عبارة إنجليزية
- اكتب الأسماء الأجنبية بالعربية
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

async function extractTopic(item) {
  const originalTitle = normalizeText(item.originalTitle || "");
  const originalDescription = normalizeText(item.originalDescription || "");
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);

  const prompt = `
استخرج من هذا الخبر الرياضي موضوعه الرئيسي بصياغة عربية قصيرة ودقيقة.

المعطيات:
- البطولة: ${league}
- المصدر: ${source}
- العنوان: ${originalTitle}
- الوصف: ${originalDescription}

أعد JSON فقط:
{
  "topic": "الموضوع الرئيسي بالعربية",
  "headlineStyle": "نمط عنوان مناسب بالعربية",
  "summary": "ملخص قصير بالعربية"
}
`;

  const raw = await callOpenAI(prompt, 0.2);
  if (!raw) return null;

  const parsed = extractJson(raw);
  if (!parsed) return null;

  return {
    topic: sanitizeArabic(parsed.topic || ""),
    headlineStyle: sanitizeArabic(parsed.headlineStyle || ""),
    summary: sanitizeArabic(parsed.summary || "")
  };
}

async function rewriteArticle(item, index) {
  const fallback = fallbackArticle(item, index);

  const originalTitle = normalizeText(item.originalTitle || item.title || "");
  const originalDescription = normalizeText(item.originalDescription || item.description || "");
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);

  if (!OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY missing, using fallback.");
    return fallback;
  }

  const topicData = await extractTopic(item);
  const baseTopic = topicData?.topic || sanitizeArabic(originalTitle) || `خبر في ${league}`;

  const titleSeed = buildTitleVariant(baseTopic, league, index);
  const descriptionSeed = buildDescriptionVariant(baseTopic, league, source, index);

  const prompt = `
أعد صياغة هذا الخبر الرياضي إلى مادة صحفية عربية وفية للمعنى والسياق.

المعطيات:
- البطولة: ${league}
- المصدر: ${source}
- عنوان الخبر الأصلي: ${originalTitle}
- وصف الخبر الأصلي: ${originalDescription}
- الموضوع المستخرج بالعربية: ${baseTopic}
- عنوان مقترح مبدئي: ${titleSeed}
- وصف مقترح مبدئي: ${descriptionSeed}
- الكلمات المفتاحية الموضوعية الحالية: ${(item.topicTags || []).join("، ")}

التعليمات:
- حافظ على الفكرة الأصلية والسياق
- لا تكتب مقالًا عامًا
- اجعل الصياغة قريبة من أسلوب المواقع الرياضية العربية
- لا تستخدم أي جملة إنجليزية
- اكتب الأسماء بالعربية
- حافظ على نبرة خبرية مشوقة ولكن غير مبالغ فيها
- اجعل العنوان والوصف مختلفين عن المقالات الأخرى
- اكتب 4 إلى 6 فقرات صحفية واضحة
- أعد JSON فقط

الصيغة:
{
  "title": "عنوان عربي خبري مختلف",
  "description": "وصف عربي مختصر مختلف",
  "seoTitle": "عنوان سيو عربي",
  "seoDescription": "وصف سيو عربي",
  "content": "محتوى عربي صحفي",
  "keywords": ["...", "...", "...", "..."]
}
`;

  const raw = await callOpenAI(prompt, 0.35);

  if (!raw) {
    return fallback;
  }

  const parsed = extractJson(raw);

  if (!parsed) {
    console.log("JSON parse failed, using fallback.");
    return fallback;
  }

  let title = sanitizeArabic(parsed.title || titleSeed);
  let description = sanitizeArabic(parsed.description || descriptionSeed);
  let seoTitle = sanitizeArabic(parsed.seoTitle || `${title} | نبض الرياضة`);
  let seoDescription = sanitizeArabic(parsed.seoDescription || description);
  let content = sanitizeArabic(parsed.content || fallback.content);
  let keywords = sanitizeKeywords(parsed.keywords);

  title = await arabizeIfNeeded(title, "العنوان");
  description = await arabizeIfNeeded(description, "الوصف");
  seoTitle = await arabizeIfNeeded(seoTitle, "عنوان السيو");
  seoDescription = await arabizeIfNeeded(seoDescription, "وصف السيو");
  content = await arabizeIfNeeded(content, "المحتوى");

  if (!title || !description || !content) {
    return fallback;
  }

  if (!keywords.length) {
    keywords = item.topicTags?.length
      ? [...item.topicTags.slice(0, 4), league]
      : fallback.keywords;
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
    const title = normalizeText(item.originalTitle || item.title || "");
    if (!title) continue;

    const key = title.toLowerCase();
    if (seen.has(key)) continue;

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
      league: selected[i].league || "mixed",
      source: selected[i].source || "",
      topicTags: selected[i].topicTags || ["كرة القدم"],
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
