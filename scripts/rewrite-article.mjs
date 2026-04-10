import fs from "fs/promises";

const INPUT = "content/articles/raw-news.json";
const OUTPUT = "content/articles/seo-articles.json";

const MAX_ARTICLES = 12;
const MIN_PARAGRAPHS = 4;

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function buildSlug(title) {
  return normalizeText(title)
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
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

function buildPrompt(item) {
  const league = arabicLeagueName(item.source);

  return `
أنت صحفي رياضي عربي محترف يكتب لموقع "نبض الرياضة".

أعد كتابة الخبر التالي بأسلوب عربي طبيعي واحترافي يشبه مواقع الأخبار الرياضية الكبرى.

القواعد:
- اكتب بالعربية فقط.
- لا تنسخ النص الأصلي حرفياً.
- لا تستخدم أسلوباً آلياً أو متكرراً.
- اجعل العنوان جذاباً لكن مهنياً.
- اكتب وصفاً تمهيدياً قصيراً مناسباً لمحركات البحث.
- اكتب من 4 إلى 6 فقرات مفيدة.
- أضف زاوية تحليلية خفيفة: الأهمية، التأثير، السياق، ما الذي يعنيه الخبر.
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
  const originalTitle = normalizeText(item.title || "خبر رياضي عاجل");
  const league = arabicLeagueName(item.source);

  const titleVariants = [
    `تفاصيل جديدة حول ${league} بعد تطورات لافتة`,
    `${league}: قراءة سريعة في آخر المستجدات`,
    `ماذا يحدث في ${league}؟ آخر التطورات والتحليل`,
    `آخر أخبار ${league} وتداعيات الخبر الأحدث`
  ];

  const title = titleVariants[index % titleVariants.length];

  return {
    title,
    description: `نستعرض في هذا التقرير آخر تطورات ${league} مع قراءة سريعة لأهم ما يحمله الخبر من دلالات ومتابعات.`,
    content: [
      `يشهد ${league} خلال الفترة الحالية تطورات متسارعة مع استمرار تداول خبر ${originalTitle} بين المتابعين والمحللين الرياضيين.`,
      `ويحمل هذا المستجد أهمية واضحة بالنظر إلى توقيته وتأثيره المحتمل على المشهد العام داخل البطولة أو على الأطراف المرتبطة بالخبر.`,
      `كما أن التفاعل الكبير مع هذا الملف يعكس حجم الاهتمام الجماهيري، خاصة عندما يتعلق الأمر بالنتائج أو الصفقات أو مستقبل المنافسة.`,
      `ومن زاوية تحليلية، فإن مثل هذه الأخبار غالباً ما تفتح الباب أمام سيناريوهات جديدة قد تؤثر على الترتيب أو الأداء أو القرارات الفنية القادمة.`,
      `ويبقى الأهم بالنسبة للجمهور هو متابعة التحديثات الرسمية والقراءة الهادئة للسياق الكامل قبل الحكم النهائي على أبعاد الخبر.`
    ],
    keywords: [league, "أخبار رياضية", "كرة القدم", "تحليل رياضي"],
    faq: [
      {
        q: `ما أهمية هذا الخبر في ${league}؟`,
        a: `تكمن أهميته في توقيته وتأثيره المحتمل على المنافسة أو على مستقبل الأطراف المرتبطة به.`
      },
      {
        q: "هل يمكن أن تتغير المعطيات لاحقاً؟",
        a: "نعم، الأخبار الرياضية تتطور سريعاً وغالباً ما تظهر تفاصيل إضافية خلال وقت قصير."
      }
    ]
  };
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

function normalizeArticle(article, item, index) {
  const fallback = buildLocalArticle(item, index);

  const title = normalizeText(article?.title || fallback.title);
  const description = normalizeText(article?.description || fallback.description);

  const content = Array.isArray(article?.content)
    ? article.content.map((p) => normalizeText(p)).filter(Boolean)
    : fallback.content;

  const keywords = Array.isArray(article?.keywords)
    ? article.keywords.map((k) => normalizeText(k)).filter(Boolean).slice(0, 6)
    : fallback.keywords;

  const faq = Array.isArray(article?.faq)
    ? article.faq
        .map((f) => ({
          q: normalizeText(f?.q),
          a: normalizeText(f?.a),
        }))
        .filter((f) => f.q && f.a)
        .slice(0, 4)
    : fallback.faq;

  return {
    title: title || fallback.title,
    description: description || fallback.description,
    content: content.length >= MIN_PARAGRAPHS ? content : fallback.content,
    keywords: keywords.length ? keywords : fallback.keywords,
    faq: faq.length ? faq : fallback.faq,
  };
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
