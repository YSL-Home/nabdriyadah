import fs from "fs/promises";

const INPUT = "content/articles/raw-news.json";
const OUTPUT = "content/articles/seo-articles.json";

const MAX_ARTICLES = 12;
const MIN_PARAGRAPHS = 4;

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function stripEnglish(text = "") {
  return String(text)
    .replace(/[A-Za-z]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function onlyArabicText(text = "") {
  const cleaned = stripEnglish(text)
    .replace(/["'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

function buildSlug(title) {
  return normalizeText(title)
    .toLowerCase()
    .replace(/[^\u0600-\u06FF0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function arabicLeagueName(source = "") {
  const s = String(source).toLowerCase();

  if (s.includes("premier")) return "الدوري الإنجليزي الممتاز";
  if (s.includes("la liga") || s.includes("la-liga")) return "الدوري الإسباني";
  if (s.includes("serie a") || s.includes("serie-a")) return "الدوري الإيطالي";
  if (s.includes("bundesliga")) return "الدوري الألماني";
  if (s.includes("ligue 1") || s.includes("ligue-1")) return "الدوري الفرنسي";
  if (s.includes("champions")) return "دوري أبطال أوروبا";
  if (s.includes("saudi")) return "الدوري السعودي";
  if (s.includes("padel")) return "البادل";
  return "كرة القدم";
}

function similarityKey(title = "") {
  return normalizeText(title).toLowerCase().slice(0, 80);
}

function isDuplicate(title, seen) {
  const key = similarityKey(title);
  if (!key) return true;
  if (seen.has(key)) return true;
  seen.add(key);
  return false;
}

function safeJsonParse(text) {
  const raw = normalizeText(text);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_) {}

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch (_) {}
  }

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch (_) {}
  }

  return null;
}

function buildPrompt(item) {
  const league = arabicLeagueName(item.source);

  return `
أنت صحفي رياضي عربي محترف يكتب لموقع "نبض الرياضة".

تعليمات صارمة جداً:
- اكتب بالعربية فقط 100%.
- ممنوع كتابة أي كلمة إنجليزية داخل العنوان أو الوصف أو الفقرات أو الكلمات المفتاحية أو الأسئلة.
- إذا كان الخبر الأصلي بالإنجليزية، ترجم المعنى إلى العربية ولا تنقل الكلمات الإنجليزية.
- لا تذكر أسماء البطولات أو الأندية أو اللاعبين بالإنجليزية، بل صغها بالعربية أو بصياغة عامة عربية.
- لا تنسخ النص الأصلي حرفياً.
- اكتب بأسلوب صحفي طبيعي ومهني.
- اجعل العنوان جذاباً لكن مهنياً.
- اكتب وصفاً قصيراً مناسباً لمحركات البحث.
- اكتب من 4 إلى 6 فقرات.
- أضف 4 كلمات مفتاحية عربية.
- أضف سؤالين شائعين مع إجابات قصيرة.
- أعد النتيجة بصيغة JSON فقط.

الشكل المطلوب:
{
  "title": "",
  "description": "",
  "content": ["", "", "", ""],
  "keywords": ["", "", "", ""],
  "faq": [
    {"q": "", "a": ""},
    {"q": "", "a": ""}
  ]
}

اسم البطولة بالعربية: ${league}
العنوان الأصلي: ${item.title || ""}
المحتوى الأصلي: ${item.content || item.description || item.summary || ""}
`;
}

function buildLocalArticle(item, index) {
  const league = arabicLeagueName(item.source);

  const titleVariants = [
    `تفاصيل جديدة في ${league}`,
    `مستجدات مهمة في ${league}`,
    `قراءة سريعة في آخر أخبار ${league}`,
    `آخر تطورات ${league} وتحليل أولي`
  ];

  const descVariants = [
    `نستعرض آخر التطورات المرتبطة بـ ${league} مع قراءة سريعة لأهمية الخبر وانعكاساته.`,
    `متابعة عربية لأبرز مستجدات ${league} مع عرض أهم التفاصيل في صياغة صحفية واضحة.`,
    `هذا التقرير يقدم خلاصة سريعة لأحدث ما يدور في ${league} مع توضيح أبرز النقاط المهمة.`,
    `تغطية موجزة لآخر أخبار ${league} مع إبراز السياق العام وما يحمله الخبر من دلالات.`
  ];

  return {
    title: titleVariants[index % titleVariants.length],
    description: descVariants[index % descVariants.length],
    content: [
      `يشهد ${league} خلال الفترة الحالية تطورات متسارعة تستحوذ على اهتمام المتابعين في الساحة الرياضية العربية.`,
      `ويحمل هذا المستجد أهمية واضحة بسبب توقيته وتأثيره المحتمل على المشهد العام داخل البطولة أو على الأطراف المرتبطة بالخبر.`,
      `كما يعكس حجم التفاعل مع هذا الملف مدى اهتمام الجمهور بالتفاصيل الجديدة وما يمكن أن تتركه من أثر خلال المرحلة المقبلة.`,
      `ومن زاوية تحليلية، فإن مثل هذه الأخبار تفتح الباب أمام احتمالات متعددة تتعلق بالأداء أو النتائج أو شكل المنافسة القادمة.`,
      `ويبقى العنصر الأهم هو متابعة التحديثات الرسمية وقراءة السياق الكامل للخبر قبل الوصول إلى أي استنتاج نهائي.`
    ],
    keywords: [league, "أخبار رياضية", "كرة القدم", "تحليل رياضي"],
    faq: [
      {
        q: `ما أهمية هذا الخبر في ${league}؟`,
        a: `تظهر أهمية الخبر من تأثيره المحتمل على المنافسة وعلى قراءة المرحلة المقبلة داخل البطولة.`
      },
      {
        q: "هل يمكن أن تظهر تفاصيل جديدة لاحقاً؟",
        a: "نعم، من المعتاد أن تتطور الأخبار الرياضية سريعاً مع ظهور معلومات إضافية خلال وقت قصير."
      }
    ]
  };
}

function hasEnglish(text = "") {
  return /[A-Za-z]/.test(String(text));
}

function sanitizeParagraph(text, fallback) {
  const cleaned = onlyArabicText(text);
  return cleaned || fallback;
}

function sanitizeKeyword(text, fallback) {
  const cleaned = onlyArabicText(text);
  return cleaned || fallback;
}

function sanitizeFaqItem(item, fallbackQ, fallbackA) {
  const q = onlyArabicText(item?.q || "");
  const a = onlyArabicText(item?.a || "");

  return {
    q: q || fallbackQ,
    a: a || fallbackA,
  };
}

function normalizeArticle(article, item, index) {
  const fallback = buildLocalArticle(item, index);

  const title = onlyArabicText(article?.title || "") || fallback.title;
  const description =
    onlyArabicText(article?.description || "") || fallback.description;

  const rawContent = Array.isArray(article?.content) ? article.content : [];
  const content = rawContent.length
    ? rawContent.map((p, i) =>
        sanitizeParagraph(
          p,
          fallback.content[i] || fallback.content[fallback.content.length - 1]
        )
      )
    : fallback.content;

  const rawKeywords = Array.isArray(article?.keywords) ? article.keywords : [];
  const keywords = rawKeywords.length
    ? rawKeywords
        .map((k, i) =>
          sanitizeKeyword(
            k,
            fallback.keywords[i] || fallback.keywords[fallback.keywords.length - 1]
          )
        )
        .filter(Boolean)
        .slice(0, 6)
    : fallback.keywords;

  const rawFaq = Array.isArray(article?.faq) ? article.faq : [];
  const faq = rawFaq.length
    ? rawFaq
        .map((f, i) =>
          sanitizeFaqItem(
            f,
            fallback.faq[i]?.q || "ما أبرز تفاصيل هذا الخبر؟",
            fallback.faq[i]?.a || "يعرض هذا المقال أهم المعلومات المرتبطة بالخبر في صياغة عربية واضحة."
          )
        )
        .slice(0, 4)
    : fallback.faq;

  const finalArticle = {
    title,
    description,
    content: content.length >= MIN_PARAGRAPHS ? content : fallback.content,
    keywords: keywords.length ? keywords : fallback.keywords,
    faq: faq.length ? faq : fallback.faq,
  };

  if (
    hasEnglish(finalArticle.title) ||
    hasEnglish(finalArticle.description) ||
    finalArticle.content.some((p) => hasEnglish(p)) ||
    finalArticle.keywords.some((k) => hasEnglish(k)) ||
    finalArticle.faq.some((f) => hasEnglish(f.q) || hasEnglish(f.a))
  ) {
    return fallback;
  }

  return finalArticle;
}

async function rewriteWithOpenAI(item, index) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: buildPrompt(item) }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const parsed = safeJsonParse(text);
    if (!parsed) throw new Error("Invalid OpenAI JSON");

    return normalizeArticle(parsed, item, index);
  } catch (error) {
    console.log("⚠️ OpenAI failed:", item.title);
    console.log(String(error.message || error));
    return null;
  }
}

async function rewriteWithAnthropic(item, index) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content: buildPrompt(item),
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text || "";
    const parsed = safeJsonParse(text);
    if (!parsed) throw new Error("Invalid Anthropic JSON");

    return normalizeArticle(parsed, item, index);
  } catch (error) {
    console.log("⚠️ Anthropic failed:", item.title);
    console.log(String(error.message || error));
    return null;
  }
}

async function rewrite(item, index) {
  const openaiVersion = await rewriteWithOpenAI(item, index);
  if (openaiVersion) return openaiVersion;

  const anthropicVersion = await rewriteWithAnthropic(item, index);
  if (anthropicVersion) return anthropicVersion;

  console.log("✅ Local fallback OK:", item.title);
  return buildLocalArticle(item, index);
}

function enrichInternalLinks(articles) {
  return articles.map((article) => {
    const related = articles
      .filter((a) => a.slug !== article.slug)
      .filter(
        (a) =>
          a.source === article.source ||
          a.keywords?.some((keyword) => article.keywords?.includes(keyword))
      )
      .slice(0, 3)
      .map((a) => ({
        title: a.title,
        slug: a.slug,
      }));

    return {
      ...article,
      related,
    };
  });
}

async function main() {
  const raw = JSON.parse(await fs.readFile(INPUT, "utf-8"));
  const seen = new Set();
  const finalArticles = [];

  for (let i = 0; i < raw.length; i++) {
    if (finalArticles.length >= MAX_ARTICLES) break;

    const item = raw[i];
    if (!item?.title) continue;
    if (isDuplicate(item.title, seen)) continue;

    const rewritten = await rewrite(item, i);
    if (!rewritten?.content || rewritten.content.length < MIN_PARAGRAPHS) continue;

    finalArticles.push({
      ...rewritten,
      slug: buildSlug(rewritten.title),
      source: item.source || "news",
      originalTitle: item.title || "",
      publishedAt: new Date().toISOString(),
    });
  }

  const withLinks = enrichInternalLinks(finalArticles);

  if (!withLinks.length) {
    throw new Error("No SEO articles were generated");
  }

  await fs.writeFile(OUTPUT, JSON.stringify(withLinks, null, 2), "utf-8");

  console.log("✅ SEO articles saved:", withLinks.length);
}
main();
