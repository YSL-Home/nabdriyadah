import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

// Priorité coût : Anthropic Claude (moins cher) → OpenAI GPT (fallback)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL   = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
const OPENAI_API_KEY    = process.env.OPENAI_API_KEY;

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

// Short hash from string to guarantee unique slug suffixes
function shortHash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) >>> 0; }
  return h.toString(36).slice(0, 6);
}

function buildSlug(item, index) {
  const sport = item.sport || "football";
  const league = item.league || "mixed";
  const titleHash = shortHash(item.originalTitle || item.title || String(index));
  const prefix =
    sport === "basketball" ? "bball" :
    sport === "tennis"     ? "tennis" :
    sport === "padel"      ? "padel" :
    sport === "futsal"     ? "futsal" :
    league === "premier-league"   ? "epl" :
    league === "la-liga"          ? "liga" :
    league === "bundesliga"       ? "bund" :
    league === "serie-a"          ? "seriea" :
    league === "ligue-1"          ? "l1" :
    league === "champions-league" ? "ucl" :
    league === "saudi-pro-league" ? "saudi" :
    league === "mls"              ? "mls" :
    "ft";
  return `${prefix}-${titleHash}`;
}

function isArabic(text = "") {
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  const arabic = (text.match(/[؀-ۿ]/g) || []).length;
  return arabic > 0 && arabic >= latin;
}

// Extract useful keywords from an English title to make fallback more unique
function extractEnglishKeywords(title = "") {
  // Remove common stop words, keep nouns/proper nouns
  const stop = new Set(["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","must","can","to","of","in","on","at","by","for","with","from","and","or","but","not","this","that","these","those","it","its","they","their","what","why","how","who","when","where","which","i","he","she","we","you","why","just","as","also","more","than","then","so","yet","both","after","before","because","if","into","through","during","about","against","between","through","during","before","after","above","below","out","off","over","under","again","further","once","here","there","all","each","every","few","more","other","some","such","no","only","same","too","very","just","because"]);
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stop.has(w))
    .slice(0, 4)
    .join("-");
}

// Article type templates — adds variety to fallback articles
const ARTICLE_TYPES = [
  {
    type: "analysis",
    titlePrefix: (label) => `تحليل معمّق`,
    intro: (label, hint) => `يتواصل الجدل الرياضي حول آخر مستجدات ${label}، في تحليل يكشف أبعاداً دقيقة لم تتناولها معظم التغطيات السابقة.`,
    body: (label) => [
      `تُجسّد ${label} نموذجاً فريداً في عالم الرياضة الاحترافية، حيث تتشابك عوامل التكتيك والاستراتيجية مع المتغيرات الميدانية اليومية.`,
      `يرى المراقبون أن ما يجري في ${label} يعكس تحولات عميقة في طريقة التفكير الرياضي الحديث، إذ تتجاوز المسألة حدود النتائج لتطال بنية اللعبة ذاتها.`,
      `وقد كشفت الأرقام والإحصائيات المتراكمة خلال الموسم الحالي عن مفارقات لافتة، يصعب تفسيرها بمعادلات تقليدية دون الغوص في تفاصيل المباريات الفردية.`,
      `تبقى ${label} محوراً أساسياً في نقاشات الجمهور العربي، الذي يتابع بشغف كبير كل مستجد على الصعيدين الميداني والإداري.`,
      `في نبض الرياضة، نواصل تقديم التغطية المتخصصة لكل تطور في هذا الملف، بعيون تحليلية تضع المتابع العربي في صلب الحدث.`
    ]
  },
  {
    type: "news",
    titlePrefix: (label) => `عاجل`,
    intro: (label, hint) => `تشهد ${label} حركية لافتة، وسط معطيات جديدة تُعيد رسم خريطة التوقعات لما تبقى من الموسم.`,
    body: (label) => [
      `كشفت المصادر المتابعة لشأن ${label} عن تطورات مفاجئة، يرى فيها المتابعون نقطة تحول فارقة في مسار المنافسة.`,
      `وتجمع التقديرات على أن هذه المعطيات ستُلقي بظلالها على قرارات المدربين والأندية خلال الأسابيع القادمة، مع اشتداد المنافسة في المراحل الفاصلة.`,
      `وتتسع دائرة التأثير لتشمل مختلف أطراف المشهد الرياضي، من اللاعبين إلى الجهاز الإداري، في ظل ضغوط متزايدة من الجماهير المتحمسة.`,
      `${label} تُعدّ من أكثر البيئات الرياضية ثراءً بالمعطيات التنافسية، وهو ما يجعل كل خبر أو تطور فيها حدثاً رياضياً بكل المقاييس.`,
      `نبض الرياضة يرصد هذه التطورات لحظة بلحظة، ليمنحك الصورة الكاملة قبل أن تنتشر في أي مكان آخر.`
    ]
  },
  {
    type: "preview",
    titlePrefix: (label) => `توقعات`,
    intro: (label, hint) => `مع اشتداد المنافسة في ${label}، تُطرح تساؤلات جوهرية حول مآلات الموسم وأبرز المرشحين للمفاجآت.`,
    body: (label) => [
      `تسير ${label} نحو مرحلة حاسمة يتوقع فيها الخبراء انقلابات جذرية في ترتيب القوى، إذ لا يزال عدد كبير من الأندية قادراً على قلب موازين الترتيب.`,
      `وتبرز عدة عوامل مؤثرة ينبغي أخذها بعين الاعتبار عند قراءة المشهد، أبرزها حالات الإصابة وعوامل التعب البدني في الجداول المكتظة.`,
      `ويُجمع المحللون على أن الفريق الأكثر انضباطاً تكتيكياً سيحوز الأفضلية في نهاية المطاف، حتى وإن لم يكن الأوفر حظاً في بداية الموسم.`,
      `المواجهات المباشرة القادمة ستكون المحطة الفيصل، وستضع الأرقام والتوقعات أمام اختبار الحقيقة الميدانية.`,
      `ابقَ مع نبض الرياضة لمتابعة كل جديد بتحليل عميق ومعطيات حصرية ترسم الصورة كاملة.`
    ]
  },
  {
    type: "recap",
    titlePrefix: (label) => `ملخص`,
    intro: (label, hint) => `رصدنا في نبض الرياضة أبرز ما جرى في ${label} خلال الفترة الأخيرة، مع تسليط الضوء على اللقطات والأرقام الأكثر تأثيراً.`,
    body: (label) => [
      `اتسمت المرحلة الأخيرة في ${label} بمستوى رفيع من التنافسية، أفضت إلى تغييرات ملموسة في مراكز عدة أندية.`,
      `سجّل عدد من اللاعبين حضوراً استثنائياً، مما أضفى على المشهد الرياضي مزيداً من الجاذبية ورفع من سقف توقعات الجماهير.`,
      `في المقابل، عانت بعض الأندية من تفاوت في الأداء أثار موجة من الانتقادات، وكشف عن ثغرات في الاستعداد أو التوافق بين عناصر الفريق.`,
      `وتكشف قراءة الأرقام التفصيلية عن تباين واضح في المردودية، يعكس عمق الهوّة بين أصحاب الأداء المتميز وأولئك الذين يبحثون عن استعادة مستواهم.`,
      `في نبض الرياضة، نختصر لك أهم ما لم تره في أي مكان آخر، مع تحليل منصف يتجاوز السطح إلى جوهر الأحداث.`
    ]
  }
];

function pickArticleType(index) {
  return ARTICLE_TYPES[index % ARTICLE_TYPES.length];
}

function fallbackArticle(item, index) {
  const sport = item.sport || "football";
  const label = leagueLabel(item.league || sport);
  const rawTitle = normalizeText(item.originalTitle || "");

  // If the original title is in Arabic, use it — NEVER include English words in the Arabic title
  let titleHint = "";
  if (rawTitle && isArabic(rawTitle)) {
    titleHint = rawTitle.slice(0, 60);
  }
  // English titles → no hint (generate fully Arabic title using date variant)

  const typeTemplate = pickArticleType(index);
  const prefix = typeTemplate.titlePrefix(label);

  // Arabic months for varied titles
  const arabicMonths = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const now = new Date();
  const monthLabel = arabicMonths[now.getMonth()];
  const yearLabel  = now.getFullYear();

  const title = titleHint
    ? `${prefix}: ${label} — ${titleHint}`.slice(0, 90)
    : `${prefix}: آخر أخبار ${label} — ${monthLabel} ${yearLabel}`.slice(0, 90);

  const description = `${typeTemplate.intro(label, titleHint)} متابعة حصرية من نبض الرياضة.`.slice(0, 200);
  const content = [typeTemplate.intro(label, titleHint), ...typeTemplate.body(label)].join("\n\n");

  return {
    title,
    description,
    seoTitle: `${title} | نبض الرياضة`,
    seoDescription: description.slice(0, 160),
    content,
    keywords: [label, sportLabel(sport), "أخبار رياضية", "تحليل", "نتائج", "نبض الرياضة"],
    faq: []
  };
}

// ── Anthropic Claude (priorité — moins cher) ─────────────────────────────
async function callAnthropic(prompt, systemPrompt = null) {
  if (!ANTHROPIC_API_KEY) return null;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 6000,
        system: systemPrompt || "أنت محرر رياضي عربي متخصص. اكتب بالعربية الفصحى البسيطة فقط.",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.log("Anthropic error:", data?.error?.message || JSON.stringify(data).slice(0, 120));
      return null;
    }
    return data?.content?.[0]?.text || null;
  } catch (error) {
    console.log("Anthropic request failed:", error.message);
    return null;
  }
}

// ── OpenAI GPT (fallback si Anthropic indisponible) ───────────────────────
async function callOpenAI(prompt, systemPrompt = null) {
  if (!OPENAI_API_KEY) return null;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // mini = 15× moins cher que gpt-4o
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt || "أنت محرر رياضي عربي متخصص. اكتب بالعربية الفصحى البسيطة فقط." },
          { role: "user", content: prompt }
        ],
        max_tokens: 6000
      })
    });
    const data = await response.json();
    if (!response.ok) { console.log("OpenAI error:", JSON.stringify(data?.error || data).slice(0, 120)); return null; }
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.log("OpenAI request failed:", error.message);
    return null;
  }
}

// ── Sélecteur : Anthropic d'abord, sinon OpenAI ───────────────────────────
async function callLLM(prompt, systemPrompt = null) {
  const result = await callAnthropic(prompt, systemPrompt);
  if (result) return result;
  return await callOpenAI(prompt, systemPrompt);
}

// Article format types — rotates per article to ensure variety
const ARTICLE_FORMATS = [
  { ar: "ملخص مباراة", en: "match recap", hint: "ركّز على أبرز أحداث اللقاء وأهدافه ونقطة التحول الفارقة" },
  { ar: "تحليل تكتيكي", en: "tactical analysis", hint: "ادرس نظام اللعب والثغرات والتفوق التكتيكي بعيون خبير" },
  { ar: "ملف لاعب", en: "player profile", hint: "أبرز اللاعب الأكثر حضوراً في الخبر وحلّل أداءه وإحصاءاته" },
  { ar: "أخبار انتقالات", en: "transfer news", hint: "غطّ المفاوضات والأرقام المتداولة وأثرها على الفريق" },
  { ar: "توقعات المباراة", en: "match preview", hint: "قدّم توقعاتك المبنية على البيانات لنتيجة اللقاء القادم" },
  { ar: "مراجعة موسمية", en: "season review", hint: "قيّم مسار الفريق خلال الموسم بالأرقام والتحولات" },
  { ar: "تقرير استقصائي", en: "investigative report", hint: "اكشف ما وراء الأخبار من سياق وأسباب وعوامل خفية" },
  { ar: "خبر عاجل", en: "breaking news", hint: "قدّم الخبر بأسلوب خبر مقتضب ومكثف يركز على المعلومة" },
];

async function rewriteArticle(item, index) {
  const fallback = fallbackArticle(item, index);
  const originalTitle = normalizeText(item.originalTitle || item.title || "");
  const originalDescription = normalizeText(item.originalDescription || item.description || "");
  const sport = item.sport || "football";
  const label = leagueLabel(item.league || sport);
  const source = sourceArabic(item.source);
  const systemPrompt = sportSystemPrompt(sport);
  const format = ARTICLE_FORMATS[index % ARTICLE_FORMATS.length];

  if (!ANTHROPIC_API_KEY && !OPENAI_API_KEY) return fallback;

  const prompt = `
أنت محرر رياضي في موقع "نبض الرياضة". مهمتك: تحويل هذا الخبر إلى مقال صحفي عربي طويل ومحسَّن للبحث (SEO).

⚡ نوع المقال المطلوب: **${format.ar}** (${format.en})
تعليمات الأسلوب: ${format.hint}

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
  "title": "العنوان بالعربية...",
  "description": "الوصف بالعربية...",
  "seoTitle": "عنوان السيو بالعربية...",
  "seoDescription": "وصف السيو بالعربية...",
  "content": "فقرة 1\\n\\nفقرة 2\\n\\n...",
  "keywords": ["...", "...", "..."],
  "faq": [
    { "q": "سؤال؟", "a": "جواب." },
    { "q": "سؤال؟", "a": "جواب." },
    { "q": "سؤال؟", "a": "جواب." }
  ],
  "en_title": "English title (50-70 chars, professional sports journalism style, specific not generic)",
  "en_description": "English meta description (145-160 chars, SEO-optimized, mention team/player name)",
  "en_content": "Full English article body: 5 paragraphs of professional sports journalism. Paragraph 1: lead with the key fact. Paragraph 2: context and background. Paragraph 3: analysis and impact. Paragraph 4: reactions and implications. Paragraph 5: outlook. NO Arabic text, NO generic phrases. Write like ESPN or Sky Sports.",
  "fr_title": "Titre en français (50-70 caractères, style journalistique sportif, précis et accrocheur)",
  "fr_description": "Description méta en français (145-160 caractères, optimisée SEO, mention équipe/joueur)",
  "fr_content": "Corps complet de l'article en français: 5 paragraphes de journalisme sportif professionnel. Paragraphe 1: l'essentiel du fait. Paragraphe 2: contexte et historique. Paragraphe 3: analyse et impact. Paragraphe 4: réactions et enjeux. Paragraphe 5: perspectives. PAS de texte arabe, PAS de phrases génériques. Style L'Équipe ou RMC Sport."
}
`.trim();

  const raw = await callLLM(prompt, systemPrompt);
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

  const en_title       = (parsed.en_title       || "").trim().slice(0, 100) || null;
  const en_description = (parsed.en_description || "").trim().slice(0, 200) || null;
  const fr_title       = (parsed.fr_title       || "").trim().slice(0, 100) || null;
  const fr_description = (parsed.fr_description || "").trim().slice(0, 200) || null;
  const en_content     = (parsed.en_content     || "").trim() || null;
  const fr_content     = (parsed.fr_content     || "").trim() || null;

  return { title, description, seoTitle, seoDescription, content, keywords, faq,
           en_title, en_description, en_content,
           fr_title, fr_description, fr_content };
}

// Maximum articles to keep in seo-articles.json (oldest pruned beyond this)
const MAX_ARTICLES = 600;

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

  // ── Load existing articles (accumulate, never overwrite) ──────────────────
  let existingArticles = [];
  try {
    existingArticles = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
    if (!Array.isArray(existingArticles)) existingArticles = [];
  } catch {}

  // Deduplicate existing articles on load (defence against race-condition duplicates)
  const seenExistingTitles = new Set();
  existingArticles = existingArticles.filter(a => {
    const key = normalizeText(a.title || "").toLowerCase();
    if (!key || seenExistingTitles.has(key)) return false;
    seenExistingTitles.add(key);
    return true;
  });
  console.log(`Existing articles: ${existingArticles.length}`);

  // Build a set of known slugs + normalised titles to avoid duplicates
  const existingSlugs = new Set(existingArticles.map((a) => a.slug).filter(Boolean));
  // Also index by raw news title (to skip already-processed source articles)
  const existingSourceKeys = new Set(
    existingArticles.map((a) => normalizeText(a.sourceTitle || a.title || "").toLowerCase().slice(0, 80)).filter(Boolean)
  );

  // ── Dedup raw items by title ──────────────────────────────────────────────
  const unique = [];
  const seenRaw = new Set();
  for (const item of rawItems) {
    const title = normalizeText(item.originalTitle || item.title || "");
    if (!title) continue;
    const key = title.toLowerCase().slice(0, 80);
    if (seenRaw.has(key)) continue;
    seenRaw.add(key);
    // Skip if we already processed this source article
    if (existingSourceKeys.has(key)) continue;
    unique.push(item);
  }

  if (unique.length === 0) {
    console.log("No new articles to write — all already exist.");
    process.exit(0);
  }

  // Spread: 8 football + 4 basketball + 4 tennis + 3 padel + 2 futsal per run
  const footballItems = unique.filter((i) => !i.sport || i.sport === "football").slice(0, 8);
  const basketItems   = unique.filter((i) => i.sport === "basketball").slice(0, 4);
  const tennisItems   = unique.filter((i) => i.sport === "tennis").slice(0, 4);
  const padelItems    = unique.filter((i) => i.sport === "padel").slice(0, 3);
  const futsalItems   = unique.filter((i) => i.sport === "futsal").slice(0, 2);
  const selected = [...footballItems, ...basketItems, ...tennisItems, ...padelItems, ...futsalItems];

  console.log(`New items to write: ${selected.length}`);

  const newArticles = [];

  for (let i = 0; i < selected.length; i++) {
    const item = selected[i];
    const label = item.originalTitle || `خبر ${i + 1}`;
    console.log(`[${i + 1}/${selected.length}] ${item.sport || "football"}: ${label.slice(0, 65)}`);

    const rewritten = await rewriteArticle(item, i);

    // Build slug — ensure uniqueness vs existing
    let slug = buildSlug(item, i);
    if (existingSlugs.has(slug)) slug = `${slug}-${Date.now()}`;
    existingSlugs.add(slug);

    // Skip if the rewritten title matches an existing one (fallback collision guard)
    const rewrittenTitleKey = normalizeText(rewritten.title || "").toLowerCase().slice(0, 80);
    if (seenExistingTitles.has(rewrittenTitleKey)) {
      console.log(`  ↩ Skipped (title already exists): ${rewritten.title?.slice(0, 60)}`);
      continue;
    }
    seenExistingTitles.add(rewrittenTitleKey);

    newArticles.push({
      slug,
      sport: item.sport || "football",
      league: item.league || "mixed",
      source: item.source || "",
      sourceTitle: normalizeText(item.originalTitle || item.title || "").slice(0, 120),
      topicTags: item.topicTags || ["الرياضة"],
      publishedAt: item.publishedAt || new Date().toISOString(),
      title: rewritten.title,
      description: rewritten.description,
      seoTitle: rewritten.seoTitle,
      seoDescription: rewritten.seoDescription,
      content: rewritten.content,
      keywords: rewritten.keywords,
      faq: rewritten.faq || [],
      // Translations (generated in same API call — no extra cost)
      en_title:       rewritten.en_title       || null,
      en_description: rewritten.en_description || null,
      fr_title:       rewritten.fr_title       || null,
      fr_description: rewritten.fr_description || null,
      imageUrl: item.imageUrl || null,
      image: `/generated/${slug}.png`
    });
  }

  // ── Merge: new articles first (newest), then existing ────────────────────
  const merged = [...newArticles, ...existingArticles];

  // Sort by publishedAt descending (most recent first)
  merged.sort((a, b) => {
    const da = new Date(a.publishedAt || 0).getTime();
    const db = new Date(b.publishedAt || 0).getTime();
    return db - da;
  });

  // Cap at MAX_ARTICLES to prevent unbounded growth
  const final = merged.slice(0, MAX_ARTICLES);

  ensureDir(OUTPUT_PATH);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(final, null, 2), "utf-8");
  console.log(`✅ Articles: ${existingArticles.length} existing + ${newArticles.length} new = ${final.length} total (cap: ${MAX_ARTICLES})`);

  // Auto-lance la génération d'images après chaque réécriture
  if (OPENAI_API_KEY || process.env.GOOGLE_API_KEY) {
    console.log("Lancement génération images...");
    try {
      execFileSync("node", [path.join(process.cwd(), "scripts/generate-article-images.mjs")], {
        stdio: "inherit",
        env: process.env
      });
    } catch (e) {
      console.log("Image generation error:", e.message?.slice(0, 120));
    }
  }
}

main();
