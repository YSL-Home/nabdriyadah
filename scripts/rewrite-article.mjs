import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

function arabicLeagueName(source = "") {
  const s = String(source).toLowerCase();

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

function cleanText(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function normalizeForCompare(text = "") {
  return cleanText(text)
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wordSet(text = "") {
  return new Set(normalizeForCompare(text).split(" ").filter(Boolean));
}

function similarityScore(a = "", b = "") {
  const setA = wordSet(a);
  const setB = wordSet(b);

  if (setA.size === 0 || setB.size === 0) return 0;

  let common = 0;
  for (const word of setA) {
    if (setB.has(word)) common++;
  }

  return common / Math.max(setA.size, setB.size);
}

function extractJson(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Empty model text");

  try {
    return JSON.parse(raw);
  } catch (_) {}

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    return JSON.parse(fenced[1].trim());
  }

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }

  throw new Error("No valid JSON found in model response");
}

function buildPrompt(item) {
  return `
أنت محرر رياضي عربي وخبير SEO لموقع "نبض الرياضة".

القواعد:
- اكتب بالعربية فقط 100%.
- لا تكتب أي جملة إنجليزية.
- لا تخترع أي معلومة غير موجودة.
- اجعل العنوان جذاباً ومفيداً لمحركات البحث.
- اجعل الوصف قصيراً وواضحاً.
- اكتب 5 فقرات عربية جيدة.
- أضف سؤالين شائعين.
- أضف 4 كلمات مفتاحية عربية.
- أعد النتيجة في JSON فقط.

شكل JSON المطلوب:
{
  "title": "",
  "shortTitle": "",
  "description": "",
  "content": ["", "", "", "", ""],
  "faq": [{"q": "", "a": ""}, {"q": "", "a": ""}],
  "keywords": ["", "", "", ""]
}

العنوان الأصلي: ${item.title || ""}
الملخص الأصلي: ${item.summary || ""}
المصدر: ${item.source || ""}
اسم البطولة بالعربية: ${arabicLeagueName(item.source)}
`;
}

function normalizeArticle(parsed, item, index) {
  const league = arabicLeagueName(item.source);

  const shortTitle = cleanText(
    parsed?.shortTitle || `آخر أخبار ${league}`
  );

  const title = cleanText(
    parsed?.title || `🔥 آخر أخبار ${league} - التفاصيل الكاملة والتحديثات`
  );

  const description = cleanText(
    parsed?.description ||
      `تعرف على آخر أخبار ${league} وتحليل المباريات والنتائج عبر نبض الرياضة.`
  );

  const content =
    Array.isArray(parsed?.content) && parsed.content.length
      ? parsed.content.map((p) => cleanText(p)).filter(Boolean)
      : [
          `تشهد أخبار ${league} اهتماماً متزايداً من الجماهير الرياضية في الساعات الأخيرة.`,
          `في هذا التقرير نستعرض أبرز المستجدات المرتبطة بالخبر أو البطولة بصياغة عربية واضحة.`,
          `نركز على أهم التفاصيل التي يبحث عنها المتابع مثل النتائج والتأثير على المشهد الرياضي.`,
          `كما يقدم المقال ملخصاً سريعاً يساعد القارئ على فهم التطورات الأساسية بسهولة.`,
          `ويواصل نبض الرياضة متابعة كل جديد لتقديم محتوى محدث ومفيد بشكل مستمر.`
        ];

  const faq =
    Array.isArray(parsed?.faq) && parsed.faq.length
      ? parsed.faq.map((f) => ({
          q: cleanText(f?.q || `ما أبرز تفاصيل ${shortTitle}؟`),
          a: cleanText(
            f?.a || `يعرض هذا المقال أهم المعلومات المرتبطة بالموضوع بشكل واضح ومباشر.`
          )
        }))
      : [
          {
            q: `ما أبرز تفاصيل ${shortTitle}؟`,
            a: `يعرض هذا المقال أهم المعلومات المرتبطة بالموضوع بشكل واضح ومباشر.`
          },
          {
            q: `هل يتم تحديث المقال لاحقاً؟`,
            a: `نعم، يتم تحديث المقالات الرياضية بشكل دوري حسب المعطيات الجديدة.`
          }
        ];

  const keywords =
    Array.isArray(parsed?.keywords) && parsed.keywords.length
      ? parsed.keywords.map((k) => cleanText(k)).filter(Boolean).slice(0, 6)
      : ["أخبار رياضية", league, "كرة القدم", "نتائج المباريات"];

  return {
    slug: slugify(shortTitle) || `article-${index + 1}`,
    title,
    shortTitle,
    description,
    content,
    faq,
    keywords,
    source: item.source || "",
    originalTitle: item.title || "",
    link: item.link || "",
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

function fallbackArticle(item, index) {
  const league = arabicLeagueName(item.source);

  const templates = [
    {
      shortTitle: `آخر أخبار ${league}`,
      title: `🔥 آخر أخبار ${league} - التفاصيل الكاملة والتحديثات`,
      description: `تعرف على آخر أخبار ${league} وتحليل المباريات والنتائج بشكل يومي عبر نبض الرياضة.`
    },
    {
      shortTitle: `مستجدات ${league}`,
      title: `مستجدات ${league} هذا الأسبوع وأبرز التطورات`,
      description: `متابعة شاملة لأبرز مستجدات ${league} مع قراءة سريعة لأهم الأحداث والنتائج.`
    },
    {
      shortTitle: `أهم ما يحدث في ${league}`,
      title: `أهم ما يحدث في ${league} الآن - قراءة سريعة ومباشرة`,
      description: `ملخص عربي سريع لأبرز الأخبار والتحركات والنتائج المرتبطة بـ ${league}.`
    },
    {
      shortTitle: `تحليل أخبار ${league}`,
      title: `تحليل أخبار ${league} - ماذا يحدث في البطولة حالياً؟`,
      description: `نستعرض آخر أخبار ${league} وتأثير النتائج والتطورات على المشهد الرياضي.`
    }
  ];

  const chosen = templates[index % templates.length];

  return {
    slug: slugify(`${chosen.shortTitle}-${index + 1}`),
    title: chosen.title,
    shortTitle: chosen.shortTitle,
    description: chosen.description,
    content: [
      `تشهد أخبار ${league} متابعة واسعة من الجماهير الرياضية في العالم العربي مع تصاعد الاهتمام بأبرز المباريات والتطورات الأخيرة.`,
      `في هذا المقال يقدم نبض الرياضة قراءة عربية سريعة تساعد المتابع على فهم الصورة العامة للخبر أو البطولة دون تعقيد.`,
      `نركز على أبرز العناصر التي يهتم بها الجمهور مثل النتائج والتطورات المؤثرة والأسماء الحاضرة بقوة في المشهد.`,
      `كما نحرص على تقديم صياغة واضحة ومباشرة تجعل المقال مناسباً للقراءة السريعة ولمتابعة الأخبار اليومية.`,
      `ومع استمرار التحديثات، يظل هذا النوع من المقالات وسيلة فعالة لمتابعة جديد ${league} بشكل منتظم.`
    ],
    faq: [
      {
        q: `ما أهم أخبار ${league} حالياً؟`,
        a: `يعرض هذا المقال أبرز المستجدات المرتبطة بالبطولة أو الخبر محل المتابعة في صياغة مبسطة وواضحة.`
      },
      {
        q: `هل يتم تحديث المقالات الرياضية باستمرار؟`,
        a: `نعم، يتم تحديث المقالات وفق أحدث المعلومات المتوفرة من المصادر المعتمدة.`
      }
    ],
    keywords: ["أخبار رياضية", league, "كرة القدم", "تحليل رياضي"],
    source: item.source || "",
    originalTitle: item.title || "",
    link: item.link || "",
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

async function rewriteWithOpenAI(item, index) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: buildPrompt(item)
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text =
    data?.output_text ||
    data?.output?.[0]?.content?.[0]?.text ||
    "";

  return normalizeArticle(extractJson(text), item, index);
}

async function rewriteWithAnthropic(item, index) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1400,
      messages: [
        {
          role: "user",
          content: buildPrompt(item)
        }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text =
    data?.content?.filter((c) => c.type === "text").map((c) => c.text).join("\n") || "";

  return normalizeArticle(extractJson(text), item, index);
}

function dedupeArticles(items) {
  const kept = [];

  for (const item of items) {
    const isDuplicate = kept.some((existing) => {
      const titleScore = similarityScore(existing.title, item.title);
      const descScore = similarityScore(existing.description, item.description);
      return titleScore >= 0.7 || descScore >= 0.75;
    });

    if (!isDuplicate) {
      kept.push(item);
    }
  }

  return kept;
}

function diversifyByLeague(items, limit = 10) {
  const buckets = new Map();

  for (const item of items) {
    const key = item.source || "unknown";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  }

  const result = [];
  let added = true;

  while (result.length < limit && added) {
    added = false;

    for (const [, bucket] of buckets) {
      if (bucket.length > 0 && result.length < limit) {
        result.push(bucket.shift());
        added = true;
      }
    }
  }

  return result.slice(0, limit);
}

async function main() {
  const rawPath = path.join(process.cwd(), "content/articles/raw-news.json");
  const outPath = path.join(process.cwd(), "content/articles/seo-articles.json");

  const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

  const selected = raw.slice(0, 20);
  const articles = [];

  for (let i = 0; i < selected.length; i++) {
    const item = selected[i];
    let result = null;

    if (OPENAI_API_KEY) {
      try {
        result = await rewriteWithOpenAI(item, i);
        console.log("✅ OpenAI OK:", item.title);
      } catch (err) {
        console.log("⚠️ OpenAI failed → Anthropic fallback");
        console.log(err.message);
      }
    }

    if (!result && ANTHROPIC_API_KEY) {
      try {
        result = await rewriteWithAnthropic(item, i);
        console.log("✅ Anthropic OK:", item.title);
      } catch (err) {
        console.log("⚠️ Anthropic failed → local fallback");
        console.log(err.message);
      }
    }

    if (!result) {
      result = fallbackArticle(item, i);
      console.log("✅ Local fallback OK:", item.title);
    }

    articles.push(result);
  }

  const withoutDuplicates = dedupeArticles(articles);
  const finalArticles = diversifyByLeague(withoutDuplicates, 10);

  fs.writeFileSync(outPath, JSON.stringify(finalArticles, null, 2), "utf-8");

  console.log("articles before dedupe:", articles.length);
  console.log("articles after dedupe:", withoutDuplicates.length);
  console.log("seo articles saved:", finalArticles.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
