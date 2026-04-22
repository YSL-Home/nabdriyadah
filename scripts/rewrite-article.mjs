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
    if (latinCount > arabicCount && latinCount > 5) continue;

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
  const baseTitle = normalizeText(item.originalTitle || item.title || `خبر رياضي ${index + 1}`);

  const titleVariants = [
    `تطورات جديدة تخص ${league}`,
    `قراءة في آخر مستجدات ${league}`,
    `ملف رياضي جديد عن ${league}`,
    `تحليل لأبرز أخبار ${league}`,
    `ماذا يحدث داخل ${league}؟`,
    `متابعة خاصة لأبرز ملفات ${league}`
  ];

  const descVariants = [
    `يستعرض هذا التقرير أهم التطورات المرتبطة بـ ${league} من زاوية تحليلية مبسطة تناسب القارئ العربي.`,
    `نقدم في هذا التقرير قراءة عربية لأبرز الجوانب المرتبطة بخبر رياضي متداول داخل ${league}.`,
    `يتناول هذا المقال أبرز المستجدات المرتبطة بـ ${league} مع متابعة لأهم الزوايا الرياضية المؤثرة.`
  ];

  const title = titleVariants[index % titleVariants.length];
  const description = descVariants[index % descVariants.length];

  const paragraphs = [
    `يشهد ${league} خلال هذه الفترة متابعة جماهيرية واسعة، في ظل تزايد النقاشات حول أبرز الملفات المرتبطة بالمنافسة والأندية واللاعبين البارزين.`,
    `وينطلق هذا التقرير من خبر رياضي متداول تناول موضوعًا حاضرًا بقوة في التغطية الإعلامية، حيث ركزت المتابعة على ملف يرتبط بالمشهد الحالي داخل البطولة من خلال عنوان عام يتمحور حول تطورات تخص: ${baseTitle}.`,
    `وتسعى منصة نبض الرياضة إلى إعادة تقديم هذه الأخبار في صياغة عربية واضحة ومباشرة، بعيدًا عن النقل الحرفي، مع التركيز على المعنى العام والخلفية الرياضية التي تساعد القارئ على فهم أوسع للسياق.`,
    `وتشير القراءة العامة لهذا الملف إلى أن التطورات الحالية لا تقف عند حدود الخبر نفسه، بل تمتد لتشمل انعكاساته على الأندية المعنية وحسابات المرحلة المقبلة من الموسم.`,
    `كما تبدو أهمية هذا النوع من الأخبار كبيرة بالنسبة للمتابع العربي، خاصة عندما يتعلق الأمر بقرارات فنية أو تحركات محتملة أو مؤشرات ترتبط بوضع فريق بعينه داخل المنافسة.`,
    `وتحاول الفرق الكبرى خلال هذه المرحلة الحفاظ على قدر من الاستقرار داخل المجموعة، سواء من حيث الخيارات الفنية أو الجاهزية البدنية أو إدارة ضغط المباريات المتتالية.`,
    `ومن المتوقع أن تكشف الأيام المقبلة عن أبعاد إضافية لهذا الملف، وهو ما يجعل متابعة التفاصيل الجديدة أمرًا مهمًا لفهم الصورة كاملة داخل ${league}.`,
    `في نبض الرياضة، نواصل تقديم محتوى عربي رياضي متجدد يشرح الأخبار الجارية بلغة واضحة، ويمنح القارئ ملخصًا تحليليًا يساعده على متابعة أبرز ما يحدث أولًا بأول.`
  ];

  return {
    title,
    description,
    seoTitle: `${title} | نبض الرياضة`,
    seoDescription: description,
    content: paragraphs.join("\n\n"),
    keywords: [league, "أخبار رياضية", "كرة القدم", "تحليلات رياضية", "انتقالات", "نتائج المباريات"]
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
              "أنت محرر رياضي عربي محترف. يجب أن يكون الناتج بالعربية فقط. يمنع إدخال أي جمل إنجليزية في الناتج النهائي."
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

async function pass1ExtractFacts(item) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);
  const originalTitle = normalizeText(item.originalTitle || item.title || "");
  const originalDescription = normalizeText(item.originalDescription || item.description || "");

  const prompt = `
استخرج المعنى الرياضي الأساسي من هذا الخبر وفسره بالعربية فقط.

المعطيات:
- البطولة: ${league}
- المصدر: ${source}
- العنوان الأصلي: ${originalTitle}
- الوصف الأصلي: ${originalDescription}

المطلوب:
- لا تنقل الجمل الإنجليزية كما هي
- لخص الفكرة الأساسية بالعربية
- استخرج الأطراف المعنية بالعربية
- حدد نوع الموضوع (انتقالات / إصابة / مباراة / تصريحات / تحليل / إدارة / غير ذلك)
- أعد JSON فقط

الصيغة:
{
  "mainTopic": "الفكرة الأساسية بالعربية",
  "entities": ["...", "..."],
  "topicType": "نوع الموضوع",
  "angle": "الزاوية التحريرية المقترحة بالعربية",
  "summaryArabic": "ملخص عربي قصير للخبر"
}
`;

  const raw = await callOpenAI(prompt, 0.2);
  if (!raw) return null;

  const parsed = extractJson(raw);
  if (!parsed) return null;

  return {
    mainTopic: sanitizeArabic(parsed.mainTopic || ""),
    entities: Array.isArray(parsed.entities) ? parsed.entities.map((e) => sanitizeArabic(e)).filter(Boolean) : [],
    topicType: sanitizeArabic(parsed.topicType || ""),
    angle: sanitizeArabic(parsed.angle || ""),
    summaryArabic: sanitizeArabic(parsed.summaryArabic || "")
  };
}

async function pass2WriteSeoArticle(item, index, facts) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);

  const prompt = `
اعتمادًا على هذه الحقائق المستخرجة من خبر رياضي، اكتب مقالاً عربياً صحفياً مختلفاً ومحسناً للسيو.

المعطيات:
- البطولة: ${league}
- المصدر: ${source}
- الفكرة الأساسية: ${facts.mainTopic}
- الأطراف المعنية: ${(facts.entities || []).join("، ")}
- نوع الموضوع: ${facts.topicType}
- الزاوية التحريرية: ${facts.angle}
- الملخص العربي: ${facts.summaryArabic}

التعليمات:
- اكتب بالعربية فقط
- امنع تمامًا أي سطر إنجليزي
- اكتب عنوانًا عربيًا قويًا ومختلفًا
- اكتب وصفًا عربيًا قصيرًا مختلفًا
- اكتب seoTitle مختلفًا
- اكتب seoDescription مختلفًا
- اكتب مقالاً من 700 إلى 900 كلمة تقريبًا
- اجعل المقال محددًا لهذا الموضوع، وليس عامًا
- ابدأ بمقدمة مرتبطة مباشرة بالموضوع
- قسّم المقال إلى فقرات واضحة
- لا تستخدم العبارات المكررة نفسها في كل مقال
- أعد JSON فقط

الصيغة:
{
  "title": "عنوان عربي مميز",
  "description": "وصف عربي مختلف",
  "seoTitle": "عنوان سيو عربي",
  "seoDescription": "وصف سيو عربي",
  "content": "مقال عربي كامل",
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

async function pass3ArabizeIfNeeded(text, label = "النص") {
  const cleaned = sanitizeArabic(text);
  if (!containsLatin(cleaned)) return cleaned;

  const prompt = `
حوّل هذا ${label} إلى العربية فقط.
- امنع أي سطر إنجليزي
- اكتب أسماء الأندية واللاعبين بالعربية
- أعد النص فقط دون أي مقدمة

النص:
${cleaned}
`;

  const result = await callOpenAI(prompt, 0.1);
  if (!result) {
    return sanitizeArabic(cleaned.replace(/[A-Za-z0-9][^.\n]*[.\n]?/g, ""));
  }

  return sanitizeArabic(result);
}

async function rewriteArticle(item, index) {
  const fallback = fallbackArticle(item, index);

  const facts = await pass1ExtractFacts(item);
  if (!facts || !facts.mainTopic) {
    console.log("Pass 1 failed, using fallback.");
    return fallback;
  }

  const draft = await pass2WriteSeoArticle(item, index, facts);
  if (!draft) {
    console.log("Pass 2 failed, using fallback.");
    return fallback;
  }

  let title = draft.title || fallback.title;
  let description = draft.description || fallback.description;
  let seoTitle = draft.seoTitle || `${title} | نبض الرياضة`;
  let seoDescription = draft.seoDescription || description;
  let content = draft.content || fallback.content;
  let keywords = draft.keywords.length ? draft.keywords : fallback.keywords;

  title = await pass3ArabizeIfNeeded(title, "العنوان");
  description = await pass3ArabizeIfNeeded(description, "الوصف");
  seoTitle = await pass3ArabizeIfNeeded(seoTitle, "عنوان السيو");
  seoDescription = await pass3ArabizeIfNeeded(seoDescription, "وصف السيو");
  content = await pass3ArabizeIfNeeded(content, "المقال");

  if (!title || !description || !content) {
    console.log("Pass 3 quality failed, using fallback.");
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
