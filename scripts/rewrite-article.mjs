import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const inputPath = path.join(process.cwd(), "content/raw-news.json");
const outputPath = path.join(process.cwd(), "content/articles/seo-articles.json");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function buildFallbackSlug(index) {
  if (index === 0) return "real-madrid-win";
  if (index === 1) return "barcelona-match";
  return `article-${index + 1}`;
}

function buildFallbackImage(rawArticle, index) {
  const premierLeagueImages = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80"
  ];

  const laLigaImages = [
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80"
  ];

  const genericImages = [
    "https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=1200&q=80"
  ];

  if (rawArticle.image) return rawArticle.image;

  if (rawArticle.league === "premier-league") {
    return premierLeagueImages[index % premierLeagueImages.length];
  }

  if (rawArticle.league === "la-liga") {
    return laLigaImages[index % laLigaImages.length];
  }

  return genericImages[index % genericImages.length];
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJsonBlock(text) {
  const direct = safeJsonParse(text);
  if (direct) return direct;

  const match = String(text).match(/\{[\s\S]*\}/);
  if (!match) return null;

  return safeJsonParse(match[0]);
}

function buildFallbackRewrite(rawArticle, index) {
  const sourceTitle = normalizeText(rawArticle.originalTitle || rawArticle.title || `خبر رياضي ${index + 1}`);
  const sourceDescription = normalizeText(
    rawArticle.originalDescription || rawArticle.description || "مستجدات جديدة في عالم كرة القدم."
  );

  const title = index === 0
    ? "آخر أخبار الدوري الإنجليزي الممتاز 1"
    : index === 1
    ? "مستجدات الدوري الإنجليزي الممتاز 2"
    : `تحليل أخبار كرة القدم ${index + 1}`;

  const description =
    "تغطية عربية رياضية محدثة ترصد أبرز التطورات والمستجدات في كرة القدم مع عرض مبسط لأهم النقاط التي تهم المتابع العربي.";

  const content = [
    `يشهد عالم كرة القدم في الفترة الحالية اهتمامًا جماهيريًا كبيرًا، خصوصًا مع تزايد وتيرة الأخبار اليومية المرتبطة بالأندية والنجوم والمنافسات الكبرى.`,
    `وفي هذا الإطار، تتابع منصة نبض الرياضة أبرز المستجدات وتقدّمها في صياغة عربية واضحة تساعد القارئ على متابعة الصورة العامة بسرعة ووضوح.`,
    `ويأتي هذا التقرير انطلاقًا من خبر رياضي يتناول موضوعًا مهمًا يتمحور حول: ${sourceTitle}.`,
    `كما تشير المعطيات المتاحة إلى تفاصيل إضافية ترتبط بالموضوع، من أبرزها: ${sourceDescription}.`,
    `وتحاول الفرق الكبرى خلال هذه المرحلة الحفاظ على الاستقرار الفني وتحقيق أفضل النتائج الممكنة، خاصة في ظل ضغط المباريات وارتفاع سقف التوقعات من الجماهير ووسائل الإعلام.`,
    `وتزداد أهمية هذه التطورات مع اقتراب المراحل الحاسمة من الموسم، حيث يصبح لكل قرار فني أو إداري تأثير مباشر على شكل المنافسة ومسار النتائج.`,
    `في نبض الرياضة، نواصل تقديم محتوى عربي رياضي محدث يساعد القارئ على البقاء قريبًا من أهم الأحداث والملفات الكروية أولًا بأول.`
  ].join("\n\n");

  return {
    title,
    description,
    seoTitle: `${title} | نبض الرياضة`,
    seoDescription: description,
    content,
    keywords: ["أخبار رياضية", "كرة القدم", "تحليلات رياضية", "نتائج المباريات"]
  };
}

async function rewriteArticle(rawArticle, index) {
  const sourceTitle = normalizeText(rawArticle.originalTitle || rawArticle.title || "");
  const sourceDescription = normalizeText(rawArticle.originalDescription || rawArticle.description || "");

  if (!sourceTitle) {
    console.log(`Skipping empty source item at index ${index}`);
    return buildFallbackRewrite(rawArticle, index);
  }

  if (!OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY missing, using fallback rewrite.");
    return buildFallbackRewrite(rawArticle, index);
  }

  const prompt = `
أعد كتابة هذا الخبر الرياضي بالكامل باللغة العربية بأسلوب صحفي احترافي ومناسب لمحركات البحث.

بيانات الخبر الأصلي:
العنوان: ${sourceTitle}
الوصف: ${sourceDescription}

التعليمات:
- اكتب باللغة العربية فقط
- امنع استخدام أي جمل إنجليزية داخل الناتج
- اكتب عنوانًا عربيًا محسّنًا لمحركات البحث
- اكتب وصفًا مختصرًا مناسبًا للسيو
- اكتب مقالًا من 600 إلى 900 كلمة
- قسم المقال إلى فقرات واضحة
- استخدم أسلوبًا صحفيًا طبيعيًا وجذابًا
- أدخل الكلمات المفتاحية بشكل طبيعي
- لا تذكر أنك نموذج ذكاء اصطناعي
- أرجع النتيجة بصيغة JSON فقط دون أي شرح إضافي

صيغة JSON المطلوبة:
{
  "title": "...",
  "description": "...",
  "seoTitle": "...",
  "seoDescription": "...",
  "content": "...",
  "keywords": ["...", "...", "..."]
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
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("OpenAI API error:", JSON.stringify(data));
      return buildFallbackRewrite(rawArticle, index);
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.log("OpenAI returned no choices content:", JSON.stringify(data));
      return buildFallbackRewrite(rawArticle, index);
    }

    const parsed = extractJsonBlock(content);

    if (!parsed) {
      console.log("Could not parse OpenAI JSON, using fallback.");
      return buildFallbackRewrite(rawArticle, index);
    }

    return {
      title: normalizeText(parsed.title || buildFallbackRewrite(rawArticle, index).title),
      description: normalizeText(parsed.description || buildFallbackRewrite(rawArticle, index).description),
      seoTitle: normalizeText(parsed.seoTitle || `${parsed.title || buildFallbackRewrite(rawArticle, index).title} | نبض الرياضة`),
      seoDescription: normalizeText(parsed.seoDescription || parsed.description || buildFallbackRewrite(rawArticle, index).description),
      content: normalizeText(parsed.content || buildFallbackRewrite(rawArticle, index).content),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map((k) => normalizeText(k)).filter(Boolean) : buildFallbackRewrite(rawArticle, index).keywords
    };
  } catch (error) {
    console.log("Rewrite request failed:", error.message);
    return buildFallbackRewrite(rawArticle, index);
  }
}

async function main() {
  let raw = [];

  try {
    raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  } catch (error) {
    console.error("Cannot read raw-news.json:", error.message);
    process.exit(1);
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    console.log("No raw news found, nothing to rewrite.");
    process.exit(0);
  }

  const results = [];

  for (let i = 0; i < raw.length; i++) {
    const sourceTitle = raw[i].originalTitle || raw[i].title || `خبر رقم ${i + 1}`;
    console.log("Rewriting:", sourceTitle);

    const rewritten = await rewriteArticle(raw[i], i);

    results.push({
      slug: buildFallbackSlug(i),
      title: rewritten.title,
      description: rewritten.description,
      seoTitle: rewritten.seoTitle,
      seoDescription: rewritten.seoDescription,
      content: rewritten.content,
      keywords: rewritten.keywords,
      image: buildFallbackImage(raw[i], i)
    });
  }

  ensureDir(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log("SEO articles saved:", results.length);
}

main();
