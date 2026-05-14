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

// Clé de déduplication robuste pour titres arabes
// Supprime : tashkeel, articles "ال", mots-outils courants, ponctuation
const AR_STOPWORDS = new Set([
  "ال","في","من","على","إلى","عن","مع","هذا","هذه","الذي","التي","وقد","كان","قال",
  "بعد","قبل","أن","لم","لن","لا","ما","كل","هو","هي","هم","نحن","أنا","أنت",
]);
function fuzzyKey(title = "") {
  return String(title)
    // strip tashkeel (Arabic diacritics)
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g, "")
    // normalize alef variants → ا
    .replace(/[أإآٱ]/g, "ا")
    // normalize teh marbuta → ه
    .replace(/ة/g, "ه")
    // lowercase latin
    .toLowerCase()
    // remove punctuation
    .replace(/[^؀-ۿa-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1 && !AR_STOPWORDS.has(w))
    .slice(0, 10)
    .join(" ");
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
  // ⚠ NE PAS restreindre à l'arabe uniquement — le prompt produit 3 langues (AR + EN + FR)
  // Les champs "title/description/content" sont en arabe, "en_*" en anglais, "fr_*" en français
  const base = [
    "Tu es journaliste multilingue (arabe, anglais, français) pour نبض الرياضة.",
    "Les champs arabes (title, description, content) : arabe standard moderne, noms propres translittérés en arabe.",
    "Les champs en_* : anglais journalistique ESPN/Sky Sports.",
    "Les champs fr_* : français journalistique L'Équipe/RMC — OBLIGATOIRE, jamais vide.",
    "Style : professionnel, factuel, accrocheur. Jamais de remplissage générique.",
    "Output : JSON valide uniquement, sans markdown."
  ].join(" ");
  const specialties = {
    football:   "Spécialiste football mondial et arabe.",
    basketball: "Spécialiste NBA et basketball international.",
    tennis:     "Spécialiste Grand Chelem et circuit ATP/WTA.",
    padel:      "Spécialiste World Padel Tour.",
    futsal:     "Spécialiste futsal FIFA et championnats nationaux.",
    mixed:      ""
  };
  return `${specialties[sport] || ""} ${base}`.trim();
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

/**
 * Extrait les entités clés d'un titre en anglais/français (noms propres capitalisés)
 * pour construire un titre de fallback plus pertinent.
 * Ex: "Liverpool owners face dilemma" → "Liverpool"
 */
function extractEntity(rawTitle = "") {
  // Mots vides à ignorer
  const stopwords = new Set([
    "the","a","an","is","are","was","were","to","of","in","on","at","by","for",
    "with","and","or","but","not","it","its","as","be","been","has","have","had",
    "will","would","could","should","after","before","over","under","between",
    "le","la","les","de","du","des","un","une","en","au","aux","et","ou","pour",
    "sur","dans","avec","par","est","are","pas","qui","que","se","si","ne",
    "why","how","what","when","where","who","will","can","may","might","do","does","did",
    "vs","fc","cf","sc","ac","afc",
  ]);
  // Extraire les mots capitalisés (noms propres) en excluant les stopwords
  const words = rawTitle.split(/[\s\-–—\/|:,\.]+/);
  const entities = words.filter(w =>
    w.length >= 2 &&
    /^[A-ZÁÀÂÉÈÊËÎÏÔÙÛÜÇ]/.test(w) &&
    !stopwords.has(w.toLowerCase())
  );
  // Prendre les 2 premières entités au max
  return entities.slice(0, 2).join(" ").slice(0, 35);
}

function fallbackArticle(item, index) {
  const sport = item.sport || "football";
  const label = leagueLabel(item.league || sport);
  const rawTitle = normalizeText(item.originalTitle || "");

  const typeTemplate = pickArticleType(index);
  const urlHash = shortHash(item.url || item.originalTitle || String(Date.now()));

  let title;

  if (rawTitle && isArabic(rawTitle)) {
    // Source arabe → utiliser directement le titre
    title = rawTitle.slice(0, 90);
  } else if (rawTitle) {
    // Source EN/FR → extraire les entités clés et construire un titre arabe avec elles
    const entity = extractEntity(rawTitle);
    const arabicMonths = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
    const monthLabel = arabicMonths[new Date().getMonth()];
    const entityPart = entity ? `${entity} — ` : `${label} — `;
    // Templates qui mettent l'entité en avant
    const variants = [
      `${entityPart}آخر التطورات والأحداث الرياضية`,
      `${entityPart}مستجدات بارزة في ${label}`,
      `${entityPart}ما تحتاج معرفته اليوم`,
      `${entityPart}تحليل أحدث الأخبار في ${monthLabel}`,
      `${entityPart}الصورة الكاملة من ملاعب ${label}`,
      `${entityPart}جديد ولافت في عالم ${label}`,
    ];
    title = variants[(index + parseInt(urlHash, 16)) % variants.length].slice(0, 90);
  } else {
    // Aucun titre source → fallback générique
    const arabicMonths = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
    const monthLabel = arabicMonths[new Date().getMonth()];
    const variants = [
      `${label} — أبرز الأحداث الرياضية`,
      `مستجدات ${label} هذا الأسبوع`,
      `${label} — تطورات ${monthLabel}`,
    ];
    title = variants[index % variants.length].slice(0, 90);
  }

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
        max_tokens: 8000,
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
        max_tokens: 8000
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

/**
 * Construit le prompt unifié pour TOUTES les sources.
 * La source EN/FR est utilisée comme matière brute (contexte),
 * l'IA produit un article 100% original dans les 3 langues — jamais de copier-coller.
 *
 * Économie tokens vs avant : le prompt EN/FR source est court (titre + description),
 * l'IA développe son propre texte dans chaque langue à partir de ce contexte.
 */
function buildPrompt(item, format, label, source, srcLang) {
  const originalTitle       = normalizeText(item.originalTitle || item.title || "");
  const originalDescription = normalizeText(item.originalDescription || item.description || "");

  // Indication de la langue source pour aider l'IA à comprendre le contexte
  const srcLangLabel = srcLang === "en" ? "Anglais" : srcLang === "fr" ? "Français" : "Arabe";

  return `
Tu es rédacteur sportif senior pour "نبض الرياضة". À partir des informations brutes ci-dessous, tu dois produire un article 100% original dans les 3 langues.

⚡ Type d'article : **${format.ar}** (${format.en}) — ${format.hint}

--- SOURCE BRUTE (langue : ${srcLangLabel}) ---
Sport / Championnat : ${label}
Titre original      : ${originalTitle}
Résumé              : ${originalDescription}
Tags                : ${(item.topicTags || []).join(", ")}

🎯 RÈGLE ABSOLUE SUR LES TITRES :
Les titres (en_title, fr_title, title) DOIVENT être dérivés du sujet ci-dessus.
Identifie le fait principal : équipe, joueur, événement, résultat — et reformule.
JAMAIS de titre générique non lié au sujet (ex: "آخر أخبار كرة القدم", "Latest Football News").
JAMAIS de préfixes : توقعات: / ملخص: / عاجل: / تحليل معمّق: / Breaking: / Résumé:
Chaque titre doit être UNIQUE et reconnaissable même sans le contexte.

--- VERSION ANGLAISE (obligatoire — à écrire EN PREMIER) ---
- Style ESPN / Sky Sports : direct, factuel, dynamique
- en_title : 50-70 chars, headline précis mentionnant équipe/joueur du sujet
- en_description : 145-160 chars, SEO, team/player name included
- en_content : 3 original paragraphs — Lead → Analysis → Outlook

--- VERSION FRANÇAISE (obligatoire — à écrire EN DEUXIÈME) ---
- Style L'Équipe / RMC Sport : incisif, analytique
- fr_title : 50-70 chars, titre précis mentionnant équipe/joueur du sujet
- fr_description : 145-160 chars, SEO, nom équipe/joueur inclus
- fr_content : 3 paragraphes originaux — Fait → Analyse → Perspectives

--- VERSION ARABE (obligatoire — à écrire EN DERNIER) ---
- Rédige en arabe standard moderne, style presse sportive de qualité
- title : 45-70 caractères, fait principal + équipe/joueur en lettres arabes
- seoTitle : "[Equipe/Joueur] — [Fait] | نبض الرياضة"
- seoDescription : exactement 145-160 caractères
- content : 5 paragraphes séparés par \\n\\n, sans markdown
- keywords : 8-10 mots-clés arabes variés
- faq : 2 questions-réponses courtes liées au sujet
- Noms propres translittérés en arabe (ليفربول، ريال مدريد، مبابي...)

⚠️ ORDRE CRITIQUE : écris les champs EN/FR avant les champs arabes dans le JSON.
Retourne UNIQUEMENT un JSON valide (pas de markdown) :
{
  "en_title": "...", "en_description": "...", "en_content": "Para 1\\n\\nPara 2\\n\\nPara 3",
  "fr_title": "...", "fr_description": "...", "fr_content": "Para 1\\n\\nPara 2\\n\\nPara 3",
  "title": "...", "description": "...", "seoTitle": "...", "seoDescription": "...",
  "content": "فقرة 1\\n\\nفقرة 2\\n\\nفقرة 3\\n\\nفقرة 4\\n\\nفقرة 5",
  "keywords": ["..."],
  "faq": [{"q":"...","a":"..."},{"q":"...","a":"..."}]
}`.trim();
}

async function rewriteArticle(item, index) {
  const fallback = fallbackArticle(item, index);
  const originalTitle       = normalizeText(item.originalTitle || item.title || "");
  const originalDescription = normalizeText(item.originalDescription || item.description || "");
  const sport       = item.sport || "football";
  const label       = leagueLabel(item.league || sport);
  const source      = sourceArabic(item.source);
  const systemPrompt = sportSystemPrompt(sport);
  const format      = ARTICLE_FORMATS[index % ARTICLE_FORMATS.length];
  const srcLang     = (item.sourceLang || "ar").toLowerCase(); // "ar" | "en" | "fr"
  const hasArabicSrc = /[؀-ۿ]/.test(originalTitle);

  if (!ANTHROPIC_API_KEY && !OPENAI_API_KEY) return fallback;

  // Prompt unique — toutes les sources passent par le même flux.
  // L'IA réécrit 100% original dans les 3 langues (AR + EN + FR).
  const prompt = buildPrompt(item, format, label, source, srcLang);

  const raw = await callLLM(prompt, systemPrompt);
  if (!raw) return fallback;

  const parsed = extractJson(raw);
  if (!parsed) {
    console.log(`  JSON parse failed for article ${index + 1}, using fallback.`);
    return fallback;
  }

  // Pour le titre : utiliser le fallback si le titre AI est vide ou quasi-entièrement en latin
  const rawAiTitle = String(parsed.title || "").trim();
  const arCharsInTitle = (rawAiTitle.match(/[؀-ۿ]/g) || []).length;
  const title = (rawAiTitle && arCharsInTitle >= 4)
    ? sanitizeArabic(rawAiTitle) || fallback.title
    : fallback.title;
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

// No article cap — keep full history forever

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

  // Construire l'index des titres existants pour éviter les doublons sur les NOUVEAUX articles
  // Ne jamais supprimer d'articles existants — on lit seulement, on n'écrit pas moins
  const seenExistingTitles = new Set();
  for (const a of existingArticles) {
    const key = normalizeText(a.title || "").toLowerCase();
    if (key) seenExistingTitles.add(key);
  }
  console.log(`Existing articles: ${existingArticles.length}`);

  // Build a set of known slugs + fuzzy title keys to avoid duplicates
  // ⚠ La fenêtre de dédup source est limitée à 3 jours — évite de bloquer
  //   éternellement les nouveaux articles sur les mêmes équipes/ligues
  const DEDUP_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
  const dedupCutoff = Date.now() - DEDUP_WINDOW_MS;
  const existingSlugs = new Set(existingArticles.map((a) => a.slug).filter(Boolean));
  const existingSourceKeys = new Set(
    existingArticles
      .filter(a => new Date(a.publishedAt || 0).getTime() > dedupCutoff)
      .map((a) => {
        const raw = normalizeText(a.sourceTitle || a.title || "");
        return fuzzyKey(raw) || raw.toLowerCase().slice(0, 60);
      }).filter(Boolean)
  );
  console.log(`Dedup window: articles < 3 days (${existingSourceKeys.size} source keys indexed)`);

  // ── Dedup raw items — fuzzy Arabic title matching ─────────────────────────
  const unique = [];
  const seenRaw = new Set();
  for (const item of rawItems) {
    const title = normalizeText(item.originalTitle || item.title || "");
    if (!title) continue;
    const key = fuzzyKey(title) || title.toLowerCase().slice(0, 60);
    if (seenRaw.has(key)) continue;
    seenRaw.add(key);
    // Skip if same event already processed in a previous run
    if (existingSourceKeys.has(key)) continue;
    unique.push(item);
  }

  if (unique.length === 0) {
    console.log("No new articles to write — all already exist.");
    process.exit(0);
  }

  // Spread: 60 football + 8 basketball + 6 tennis + 6 padel + 4 futsal = ~84/run
  const footballItems = unique.filter((i) => !i.sport || i.sport === "football").slice(0, 60);
  const basketItems   = unique.filter((i) => i.sport === "basketball").slice(0, 8);
  const tennisItems   = unique.filter((i) => i.sport === "tennis").slice(0, 6);
  const padelItems    = unique.filter((i) => i.sport === "padel").slice(0, 6);
  const futsalItems   = unique.filter((i) => i.sport === "futsal").slice(0, 4);
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

    const srcTitle       = normalizeText(item.originalTitle || "").slice(0, 100);
    const srcDesc        = normalizeText(item.originalDescription || "").slice(0, 200);
    const hasArabicTitle = /[؀-ۿ]/.test(srcTitle);

    newArticles.push({
      slug,
      sport: item.sport || "football",
      league: item.league || "mixed",
      source: item.source || "",
      sourceLang: item.sourceLang || "ar",
      sourceTitle: srcTitle.slice(0, 120),
      topicTags: item.topicTags || ["الرياضة"],
      publishedAt: item.publishedAt || new Date().toISOString(),
      title: rewritten.title,
      description: rewritten.description,
      seoTitle: rewritten.seoTitle,
      seoDescription: rewritten.seoDescription,
      content: rewritten.content,
      keywords: rewritten.keywords,
      faq: rewritten.faq || [],
      // Toujours du contenu 100% original généré par l'IA — jamais de copier-coller source
      en_title:       rewritten.en_title       || null,
      en_description: rewritten.en_description || null,
      en_content:     rewritten.en_content     || null,
      fr_title:       rewritten.fr_title       || null,
      fr_description: rewritten.fr_description || null,
      fr_content:     rewritten.fr_content     || null,
      sourceUrl:  item.link || item.sourceUrl || null,
      imageUrl:   item.imageUrl || null,
      image: `/generated/${slug}.png`
    });
  }

  // ── Merge: new articles first (newest), then existing ────────────────────
  const merged = [...newArticles, ...existingArticles];

  // ── BACKFILL: translate existing articles without en_title/fr_title ───────
  // Pass 1 (free, instant): use non-Arabic sourceTitle as en_title
  // Pass 2 (LLM): translate remaining Arabic titles
  if (process.env.BREAKING_ONLY !== "true") {
    function hasArabicChars(t) { return /[؀-ۿ]/.test(t || ""); }

    // Pass 1: sourceTitle shortcut (zero API cost)
    let freePatched = 0;
    for (const article of merged) {
      if (!article.en_title && article.sourceTitle && !hasArabicChars(article.sourceTitle)) {
        article.en_title = article.sourceTitle.trim().slice(0, 100);
        freePatched++;
      }
    }
    if (freePatched > 0) console.log(`\n⚡ Free backfill: ${freePatched} en_title from sourceTitle`);

    // Pass 2: LLM translation for remaining (max 60/run to stay within CI timeout)
    const needsTranslation = merged.filter(a => !a.en_title || !a.fr_title);
    const toTranslate = needsTranslation.slice(0, 60);
    if (toTranslate.length > 0) {
      console.log(`\n🌍 LLM backfill: ${toTranslate.length} articles need EN/FR translation...`);
      for (const article of toTranslate) {
        try {
          const prompt = `You are a professional sports translator. Translate this Arabic sports article into English and French.

Arabic title: ${article.title}
Arabic description: ${article.description || ""}

Return ONLY valid JSON:
{
  "en_title": "English title (concise, professional, 50-80 chars)",
  "en_description": "English description (1-2 sentences, sports journalism style)",
  "fr_title": "Titre en français (concis, professionnel, 50-80 caractères)",
  "fr_description": "Description en français (1-2 phrases, style journalisme sportif)"
}`;
          const raw = await callLLM(prompt);
          if (!raw) continue;
          let parsed;
          try {
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(jsonMatch?.[0] || raw);
          } catch { continue; }
          if (!article.en_title) {
            article.en_title       = (parsed.en_title       || "").trim().slice(0, 100) || null;
            article.en_description = (parsed.en_description || "").trim().slice(0, 200) || null;
          }
          if (!article.fr_title) {
            article.fr_title       = (parsed.fr_title       || "").trim().slice(0, 100) || null;
            article.fr_description = (parsed.fr_description || "").trim().slice(0, 200) || null;
          }
          if (article.en_title) {
            process.stdout.write(`  ✓ ${article.slug} → "${article.en_title.slice(0, 50)}"\n`);
          }
        } catch (e) {
          console.log(`  ⚠ Translation failed for ${article.slug}: ${e.message?.slice(0, 60)}`);
        }
      }
    }
  }

  // Sort by publishedAt descending (most recent first)
  merged.sort((a, b) => {
    const da = new Date(a.publishedAt || 0).getTime();
    const db = new Date(b.publishedAt || 0).getTime();
    return db - da;
  });

  ensureDir(OUTPUT_PATH);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`✅ Articles: ${existingArticles.length} existing + ${newArticles.length} new = ${merged.length} total`);

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
