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
  return kept.join("\n\n").replace(/\n{3,}/g, "\n\n").replace(/[ ]{2,}/g, " ").trim();
}

function sanitizeKeywords(keywords) {
  if (!Array.isArray(keywords)) return [];
  return keywords.map((k) => sanitizeArabic(k)).map((k) => normalizeText(k)).filter(Boolean).slice(0, 10);
}

function sportLabel(sport = "football") {
  const labels = {
    football: "كرة القدم",
    basketball: "كرة السلة",
    tennis: "التنس",
    padel: "البادل",
    futsal: "كرة قدم الصالات",
    "premier-league": "الدوري الإنجليزي الممتاز",
    "la-liga": "الدوري الإسباني",
    "bundesliga": "البوندسليغا",
    "serie-a": "الدوري الإيطالي",
    "ligue-1": "الدوري الفرنسي",
    "champions-league": "دوري أبطال أوروبا",
    "saudi-pro-league": "الدوري السعودي",
    "eredivisie": "الدوري الهولندي",
    mixed: "كرة القدم"
  };
  return labels[sport] || "الرياضة";
}

function leagueLabel(league = "") {
  return sportLabel(league) || sportLabel("football");
}

function sportSystemPrompt(sport = "football") {
  const base = [
    "تكتب بالعربية الفصحى البسيطة فقط — لا كلمة إنجليزية واحدة في المخرجات.",
    "أسماء الأندية واللاعبين والمدن تُكتب بالحروف العربية دائماً (مثال: مانشستر سيتي، كريستيانو رونالدو).",
    "أسلوبك صحفي احترافي، محايد، واضح ومشوق.",
    "لا تذكر أبداً أسماء مواقع إخبارية أو مصادر خارجية في المتن.",
    "اكتب المقال كما لو أنه تحقيق صحفي مستقل ومبتكر لموقع نبض الرياضة — بدون أي إشارة للمصدر الأصلي.",
    "لا تبدأ أي فقرة بـ 'وفي سياق' أو 'وفي إطار' وحدها — ابدأ دائماً بالمعلومة مباشرة."
  ].join(" ");
  const prompts = {
    football: `أنت محرر رياضي كبير في موقع نبض الرياضة، متخصص في كرة القدم العالمية والعربية. ${base}`,
    basketball: `أنت محرر رياضي كبير في موقع نبض الرياضة، متخصص في كرة السلة والدوري الأمريكي. ${base}`,
    tennis: `أنت محرر رياضي كبير في موقع نبض الرياضة، متخصص في بطولات التنس الكبرى. ${base}`,
    padel: `أنت محرر رياضي كبير في موقع نبض الرياضة، متخصص في رياضة البادل الحديثة. ${base}`,
    futsal: `أنت محرر رياضي كبير في موقع نبض الرياضة، متخصص في كرة قدم الصالات والفوتسال. ${base}`,
    mixed: `أنت محرر رياضي كبير في موقع نبض الرياضة. ${base}`
  };
  return prompts[sport] || prompts.mixed;
}

function sourceArabic(source = "") {
  if (source.includes("BBC")) return "بي بي سي سبورت";
  if (source.includes("Btolat")) return "بطولات";
  if (source.includes("Kooora")) return "كووورة";
  if (source.includes("Hesport")) return "هسبورت";
  if (source.includes("Al Jazeera")) return "الجزيرة رياضة";
  if (source.includes("Al Araby")) return "العربي الجديد";
  if (source.includes("Elsport")) return "إلسبورت";
  if (source.includes("Google News Basketball")) return "جوجل نيوز كرة السلة";
  if (source.includes("Google News Tennis")) return "جوجل نيوز التنس";
  if (source.includes("Google News Padel")) return "جوجل نيوز البادل";
  if (source.includes("Google News Futsal")) return "جوجل نيوز الصالات";
  if (source.includes("Google News")) return "جوجل نيوز";
  return "المصدر الرياضي";
}

function buildSlug(item, index) {
  const sport = item.sport || "football";
  const league = item.league || "mixed";
  if (sport === "basketball") return `basketball-${index + 1}`;
  if (sport === "tennis") return `tennis-${index + 1}`;
  if (sport === "padel") return `padel-${index + 1}`;
  if (sport === "futsal") return `futsal-${index + 1}`;
  if (league === "premier-league") return `premier-league-${index + 1}`;
  if (league === "la-liga") return `la-liga-${index + 1}`;
  if (league === "bundesliga") return `bundesliga-${index + 1}`;
  if (league === "serie-a") return `serie-a-${index + 1}`;
  if (league === "ligue-1") return `ligue-1-${index + 1}`;
  if (league === "champions-league") return `ucl-${index + 1}`;
  if (league === "saudi-pro-league") return `saudi-${index + 1}`;
  return `football-${index + 1}`;
}

function isArabic(text = "") {
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  const arabic = (text.match(/[؀-ۿ]/g) || []).length;
  return arabic > 0 && arabic >= latin;
}

function fallbackArticle(item, index) {
  const sport = item.sport || "football";
  const label = leagueLabel(item.league || sport);
  // Si le titre original est en anglais, on génère un titre arabe générique
  const rawTitle = normalizeText(item.originalTitle || "");
  const arabicGeneric = `أبرز أحداث ${label} — الجولة ${index + 1}`;
  const originalTitle = (rawTitle && isArabic(rawTitle)) ? rawTitle : arabicGeneric;
  const title = originalTitle.length > 90 ? originalTitle.slice(0, 90) : originalTitle;
  const description = `تفاصيل وتحليل حول: ${title} — متابعة من نبض الرياضة.`;
  const content = [
    `تواصل ${label} تقديم أحداث مثيرة يترقبها الجمهور الرياضي العربي بشغف كبير.`,
    `وتشير المعطيات المتوفرة إلى أن هذا الحدث يمثل محطة مهمة في مسار الموسم الرياضي الحالي، ويستقطب اهتمام واسع من المتابعين العرب.`,
    `يأتي هذا الخبر في سياق منافسة حامية الوطيس تشهدها ${label}، حيث يترقب الجمهور نتائج مفاجئة وأداء لافتاً من الأندية والأفراد.`,
    `وقد أثارت هذه المستجدات موجة من التحليلات والتعليقات على منصات التواصل الاجتماعي بين مختلف شرائح الجمهور الرياضي.`,
    `تبقى ${label} وجهة أولى للمتابع العربي الباحث عن أعلى مستويات التنافسية في العالم، وموقع نبض الرياضة يواصل تغطية كل التطورات لحظة بلحظة.`
  ].join("\n\n");
  return {
    title,
    description,
    seoTitle: `${title} | نبض الرياضة`,
    seoDescription: description.slice(0, 160),
    content,
    keywords: [label, "أخبار رياضية", sportLabel(sport), "نتائج", "متابعة", "نبض الرياضة"],
    faq: []
  };
}

async function callOpenAI(prompt, temperature = 0.3, systemPrompt = null) {
  if (!OPENAI_API_KEY) return null;
  try {
    const messages = [
      { role: "system", content: systemPrompt || "أنت محرر رياضي عربي متخصص. اكتب بالعربية الفصحى البسيطة فقط." },
      { role: "user", content: prompt }
    ];
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: "gpt-4o", temperature, messages, max_tokens: 3000 })
    });
    const data = await response.json();
    if (!response.ok) {
      console.log("OpenAI error:", JSON.stringify(data?.error || data));
      return null;
    }
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.log("OpenAI request failed:", error.message);
    return null;
  }
}

async function rewriteArticle(item, index) {
  const fallback = fallbackArticle(item, index);
  const originalTitle = normalizeText(item.originalTitle || item.title || "");
  const originalDescription = normalizeText(item.originalDescription || item.description || "");
  const sport = item.sport || "football";
  const label = leagueLabel(item.league || sport);
  const source = sourceArabic(item.source);
  const systemPrompt = sportSystemPrompt(sport);

  if (!OPENAI_API_KEY) return fallback;

  const prompt = `
أنت محرر رياضي في موقع "نبض الرياضة". مهمتك: تحويل هذا الخبر إلى مقال صحفي عربي طويل ومحسَّن للبحث (SEO) بشكل احترافي.

--- المعلومات المتاحة ---
الرياضة/البطولة: ${label}
المصدر: ${source}
العنوان الأصلي: ${originalTitle}
الوصف: ${originalDescription}
الوسوم: ${(item.topicTags || []).join("، ")}

--- قواعد SEO إلزامية ---
العنوان (title):
- يجب أن يذكر اسم الفريق أو اللاعب أو الحدث المحدد بشكل صريح
- بين 45 و 70 حرفاً
- يبدأ بالمعلومة الأبرز مباشرة (لا يبدأ بـ"أخبار" أو "تقرير")
- يثير الفضول ويحفز على النقر

عنوان السيو (seoTitle):
- يتضمن الكلمة المفتاحية الرئيسية في أول 60 حرف
- صيغة: "[الكيان الرياضي] — [الخبر] | نبض الرياضة"

وصف السيو (seoDescription):
- بين 145 و 160 حرفاً بالضبط
- يلخص الخبر ويتضمن الكيان الرياضي والفعل والنتيجة
- يحتوي على دعوة للقراءة ضمنية

المحتوى (content):
- مقال طويل: 8 إلى 10 فقرات صحفية متدرجة
- الفقرة 1: الخبر الأبرز والأرقام (الـ lede) — 2-3 جمل مكثفة
- الفقرة 2: السياق والخلفية التاريخية للحدث
- الفقرة 3: التفاصيل والمعطيات التقنية أو الإحصائية
- الفقرة 4-5: تحليل تأثير الخبر على الموسم والمنافسة
- الفقرة 6: آراء ومواقف (صياغة صحفية حتى بدون اقتباس حرفي)
- الفقرة 7-8: التوقعات والسيناريوهات المحتملة
- الفقرة 9: ربط بالمشهد الرياضي العربي والاهتمام الإقليمي
- الفقرة 10: خاتمة تحريرية مع دعوة للمتابعة
- افصل الفقرات بـ \\n\\n فقط — بدون عناوين فرعية أو markdown

الكلمات المفتاحية (keywords):
- 8 إلى 10 كلمات/عبارات عربية
- تشمل: اسم الكيان + البطولة + الفعل الرياضي + كلمات LSI (مثل: نتائج، انتقالات، تحليل، موسم، ملعب...)
- لا تكرار بين الكلمات

الأسئلة الشائعة (faq):
- 3 أسئلة وأجوبة قصيرة مرتبطة بالخبر (لـ schema FAQ)
- كل سؤال: سؤال عربي + جواب 1-2 جملة

--- تحذيرات ---
- لا كلمة إنجليزية واحدة في المخرجات
- الأسماء الأجنبية بالحروف العربية فقط (مثال: ريال مدريد، ليونيل ميسي)
- لا مقدمات عامة ("في إطار" ، "في سياق" لوحدها)
- لا تكرار بين العنوان والوصف والفقرة الأولى
- لا تستخدم عبارات الحشو الشائعة مثل "في هذا الإطار" و"تجدر الإشارة" و"وفي هذا الصدد"
- كل فقرة يجب أن تضيف معلومة جديدة — لا تكرار أفكار بصياغة مختلفة
- أسلوب جريدة رياضية راقية: مباشر، موجز، غني بالمعطيات الدقيقة

أعد JSON فقط بهذا الشكل الدقيق:
{
  "title": "...",
  "description": "...",
  "seoTitle": "...",
  "seoDescription": "...",
  "content": "فقرة 1\\n\\nفقرة 2\\n\\n...",
  "keywords": ["...", "...", "..."],
  "faq": [
    { "q": "سؤال؟", "a": "جواب." },
    { "q": "سؤال؟", "a": "جواب." },
    { "q": "سؤال؟", "a": "جواب." }
  ]
}
`.trim();

  const raw = await callOpenAI(prompt, 0.45, systemPrompt);
  if (!raw) return fallback;

  const parsed = extractJson(raw);
  if (!parsed) {
    console.log(`  JSON parse failed for article ${index + 1}, using fallback.`);
    return fallback;
  }

  const title = sanitizeArabic(parsed.title || fallback.title);
  const description = sanitizeArabic(parsed.description || fallback.description);
  const seoTitle = sanitizeArabic(parsed.seoTitle || `${title} | نبض الرياضة`);
  const seoDescription = sanitizeArabic(parsed.seoDescription || description).slice(0, 160);
  const content = sanitizeArabic(parsed.content || fallback.content);
  const keywords = sanitizeKeywords(parsed.keywords);
  const faq = Array.isArray(parsed.faq)
    ? parsed.faq.slice(0, 3).map((f) => ({ q: sanitizeArabic(f.q || ""), a: sanitizeArabic(f.a || "") })).filter((f) => f.q && f.a)
    : [];

  if (!title || !description || !content) return fallback;

  return { title, description, seoTitle, seoDescription, content, keywords, faq };
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

  // Dedup by title
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

  // Spread: 8 football + 4 basketball + 4 tennis + 3 padel + 2 futsal = 21 max
  const footballItems = unique.filter((i) => !i.sport || i.sport === "football").slice(0, 8);
  const basketItems = unique.filter((i) => i.sport === "basketball").slice(0, 4);
  const tennisItems = unique.filter((i) => i.sport === "tennis").slice(0, 4);
  const padelItems = unique.filter((i) => i.sport === "padel").slice(0, 3);
  const futsalItems = unique.filter((i) => i.sport === "futsal").slice(0, 2);
  const selected = [...footballItems, ...basketItems, ...tennisItems, ...padelItems, ...futsalItems];

  const articles = [];

  for (let i = 0; i < selected.length; i++) {
    const item = selected[i];
    const label = item.originalTitle || `خبر ${i + 1}`;
    console.log(`[${i + 1}/${selected.length}] ${item.sport || "football"}: ${label.slice(0, 65)}`);

    const rewritten = await rewriteArticle(item, i);

    const slug = buildSlug(item, i);
    articles.push({
      slug,
      sport: item.sport || "football",
      league: item.league || "mixed",
      source: item.source || "",
      topicTags: item.topicTags || ["الرياضة"],
      publishedAt: item.publishedAt || new Date().toISOString(),
      title: rewritten.title,
      description: rewritten.description,
      seoTitle: rewritten.seoTitle,
      seoDescription: rewritten.seoDescription,
      content: rewritten.content,
      keywords: rewritten.keywords,
      faq: rewritten.faq || [],
      imageUrl: item.imageUrl || null,
      image: `/generated/${slug}.png`
    });
  }

  ensureDir(OUTPUT_PATH);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(articles, null, 2), "utf-8");
  console.log(`SEO articles saved: ${articles.length}`);
}

main();
