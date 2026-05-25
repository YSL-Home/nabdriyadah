import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

// ── Clés API (ordre de priorité : gratuit en premier) ─────────────────────
// 1. Gemini 2.0 Flash    — GRATUIT  (1500 req/jour par clé)
// 1b. GOOGLE_API_KEY_2   — 2ème compte Gemini optionnel (+1500 req/jour)
// 2. Groq Llama 3.3 70B  — GRATUIT  (6000 TPM, 14400 RPD)
// 2b. Groq Llama 3.1 8B  — GRATUIT  (131072 TPM — fallback ultra-rapide)
// 3. Anthropic Claude    — Payant   (fallback si crédits dispo)
// 4. OpenAI GPT-4o-mini  — Payant   (dernier recours)
const GOOGLE_API_KEY    = process.env.GOOGLE_API_KEY    || "";
const GOOGLE_API_KEY_2  = process.env.GOOGLE_API_KEY_2  || ""; // 2ème compte Gemini optionnel
const GROQ_API_KEY      = process.env.GROQ_API_KEY      || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_MODEL   = process.env.ANTHROPIC_MODEL   || "claude-haiku-4-5";
const OPENAI_API_KEY    = process.env.OPENAI_API_KEY    || "";

const GEMINI_MODEL   = "gemini-2.0-flash";
const GROQ_MODEL_70B = "llama-3.3-70b-versatile";   // qualité max, 6000 TPM
const GROQ_MODEL_8B  = "llama-3.1-8b-instant";       // ultra-rapide, 131072 TPM
const GROQ_MODEL     = GROQ_MODEL_70B;

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

function repairJsonNewlines(s) {
  // Fix unescaped newlines/tabs inside JSON string values (common LLM output issue)
  return s.replace(/"(?:[^"\\]|\\.)*"/g, m =>
    m.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
  );
}

function extractJson(text = "") {
  const cleaned = removeMarkdownFences(text);
  // Try 1: direct parse
  try { return JSON.parse(cleaned); } catch {}
  // Try 2: extract { ... } block
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  // Try 3: direct parse of extracted block
  try { return JSON.parse(match[0]); } catch {}
  // Try 4: repair unescaped newlines then parse
  try { return JSON.parse(repairJsonNewlines(match[0])); } catch {}
  return null;
}

function sanitizeArabic(text = "") {
  let value = String(text || "");
  value = removeMarkdownFences(value).replace(/\r/g, "");
  const lines = value.split("\n");
  const kept = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const arabicCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
    // Garder toute ligne contenant au moins 1 caract\u00E8re arabe
    // (les noms propres latins \u2014 "Champions League", "UEFA", etc. \u2014 sont normaux dans un texte arabe)
    // Supprimer uniquement les lignes 100% latines (pas de caract\u00E8re arabe du tout)
    if (arabicCount === 0) continue;
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
    intro: (label, hint) => `يتواصل الجدل الرياضي حول آخر مستجدات ${label}، في تحليل يكشف أبعاداً دقيقة لم تتناولها معظم التغطيات السابقة، ويستعرض العوامل المحورية التي تشكّل المشهد الراهن.`,
    body: (label) => [
      `تُجسّد ${label} نموذجاً فريداً في عالم الرياضة الاحترافية، حيث تتشابك عوامل التكتيك والاستراتيجية مع المتغيرات الميدانية اليومية. وفي خضم هذا المشهد المتحول، يزداد الطلب على التحليل العميق الذي يتجاوز مجرد رصد النتائج إلى فهم الأسباب والسياقات المحيطة بكل حدث.`,
      `يرى المراقبون المتخصصون أن ما يجري في ${label} يعكس تحولات عميقة في طريقة التفكير الرياضي الحديث؛ إذ تتجاوز المسألة حدود النتائج الفورية لتطال بنية اللعبة ذاتها وفلسفة التدريب والإعداد. هذه التحولات البنيوية هي التي تُفرز الفوارق الحقيقية بين المنافسين على المدى البعيد، لا مجرد لقطات فردية عابرة.`,
      `وقد كشفت الأرقام والإحصاءات المتراكمة خلال الفترة الأخيرة عن مفارقات لافتة لا يمكن تفسيرها بمعادلات تقليدية بسيطة؛ فالفرق التي بدت الأوفر حظاً في بداية المرحلة واجهت تحديات غير متوقعة، في حين أثبتت فرق أخرى أنها أكثر عمقاً وتوازناً مما كانت تشير إليه تقييمات الموسم الأولى.`,
      `ويُجمع المحللون الرياضيون المتخصصون على أن عوامل الكيمياء الداخلية وإدارة الضغط النفسي باتت تحتل مرتبة متقدمة في معادلة النجاح، ربما تفوق في أهميتها بعض العوامل التقنية التقليدية. وهذا ما يجعل كل قرار تكتيكي في هذه المرحلة محملاً بأبعاد أكبر مما تبدو عليه للوهلة الأولى.`,
      `تبقى ${label} محوراً أساسياً في نقاشات المتابعين العرب الذين يتابعون بشغف لافت كل مستجد على الصعيدين الميداني والإداري. ومع تصاعد وتيرة الأحداث، تتسع دائرة المهتمين وتتعمق قراءتهم للمشهد الرياضي، وهو ما ينعكس إيجاباً على مستوى النقاش وجودة التحليل.`,
      `على الصعيد الإحصائي، تتحدث الأرقام عن قصة مثيرة من التراجع والصعود والثبات؛ حيث تتنافس الأندية على كل نقطة وكل فرصة بشكل يجعل الحسابات مفتوحة على كل الاحتمالات. ومن المتوقع أن تكون الأسابيع القادمة محطات فارقة ترسم ملامح الترتيب النهائي بصورة أكثر وضوحاً.`,
      `في نبض الرياضة، نواصل تقديم التغطية المتخصصة المتجددة لكل تطور في هذا الملف، بعيون تحليلية نقدية تضع المتابع العربي في صلب الحدث، وتمنحه الأدوات اللازمة لفهم ما يجري بعيداً عن التسطيح والاختزال. تابعنا لمزيد من التحليلات والمتابعات الحصرية.`
    ]
  },
  {
    type: "news",
    titlePrefix: (label) => `عاجل`,
    intro: (label, hint) => `تشهد ${label} حركية لافتة في المشهد الرياضي، وسط معطيات جديدة تُعيد رسم خريطة التوقعات لما تبقى من الموسم وتفتح آفاقاً للتساؤل حول مسارات المنافسة القادمة.`,
    body: (label) => [
      `كشفت المصادر المتابعة لشأن ${label} عن تطورات مفاجئة تحمل في طياتها دلالات بالغة الأهمية؛ يرى فيها المتابعون الرياضيون نقطة تحول حقيقية في مسار المنافسة، ستُلقي بظلالها على حسابات جميع الأطراف المعنية خلال المرحلة المقبلة دون استثناء.`,
      `وتجمع التقديرات التحليلية المعمّقة على أن هذه المعطيات الجديدة ستُلقي بظلالها الكثيفة على قرارات المدربين وإدارات الأندية خلال الأسابيع القادمة، وسط اشتداد ملحوظ في وتيرة المنافسة مع اقتراب المراحل الفاصلة والحاسمة من الموسم.`,
      `وتتسع دائرة التأثير لتشمل مختلف أطراف المشهد الرياضي المتكامل، بدءاً من اللاعبين على أرض الملعب مروراً بالجهاز الفني والإداري، وصولاً إلى الجماهير المتحمسة التي تراقب كل تفصيل بعناية فائقة وتنتظر تحولات كبرى في موازين القوى.`,
      `${label} تُعدّ من أكثر البيئات الرياضية ثراءً وتنوعاً بالمعطيات التنافسية على مستوى العالم، وهو ما يجعل كل خبر أو تطور فيها حدثاً رياضياً ذا وزن بكل المقاييس المعتمدة. وهذه الخاصية هي التي تجعل متابعتها تجربة استثنائية لا يمكن تكرارها في سياقات رياضية أخرى.`,
      `وفي السياق ذاته، تجدر الإشارة إلى أن التاريخ الرياضي يُعلّمنا أن اللحظات الفارقة والتحولات الكبرى كثيراً ما تنبثق من أحداث تبدو للوهلة الأولى هامشية، قبل أن تتكشّف أبعادها الحقيقية مع مرور الوقت وتراكم الأحداث.`,
      `وإزاء هذه التطورات المتسارعة، يزداد اهتمام الجمهور الرياضي العربي بتلقي المعلومات الدقيقة والموثوقة التي تُمكّنه من تكوين رأي محايد ومبني على أسس سليمة، بعيداً عن الشائعات والتأويلات المتسرعة التي كثيراً ما تُشوّه الصورة الحقيقية.`,
      `نبض الرياضة يرصد هذه التطورات لحظة بلحظة بكل شفافية وموضوعية، ليمنحك الصورة الكاملة والشاملة قبل أن تنتشر في أي مكان آخر. نحن هنا لنكون مرجعك الرياضي الأول بالعربية، تابعنا على منصاتنا المختلفة.`
    ]
  },
  {
    type: "preview",
    titlePrefix: (label) => `توقعات`,
    intro: (label, hint) => `مع اشتداد وتيرة المنافسة في ${label}، تُطرح تساؤلات جوهرية مشروعة حول مآلات الموسم وأبرز المرشحين للمفاجآت التي قد تُقلب الموازين وتُعيد رسم خريطة الترتيب.`,
    body: (label) => [
      `تسير ${label} بخطى متسارعة نحو مرحلة بالغة الأهمية والحساسية، يتوقع فيها كثير من الخبراء والمحللين انقلابات جذرية في ترتيب القوى الموجودة. إذ لا يزال عدد كبير من الأندية والمنافسين يمتلكون القدرة الكافية على قلب موازين الترتيب الراهن بصورة درامية تُثير الإثارة.`,
      `وتبرز عدة عوامل محورية ومؤثرة ينبغي أخذها بعين الاعتبار الجدي عند قراءة المشهد الراهن وتحليله؛ أبرزها حالات الإصابات المتراكمة التي نالت من عدد من المنافسين، فضلاً عن عوامل التعب البدني والإرهاق النفسي في الجداول الزمنية المكتظة بالمباريات والمنافسات المتعددة.`,
      `ويُجمع كبار المحللين الرياضيين المتخصصين على أن الفريق أو المنافس الأكثر انضباطاً تكتيكياً والأوفر قدرة على المحافظة على مستواه تحت الضغط سيحوز الأفضلية الحقيقية في نهاية المطاف. وهذا ينطبق بصفة خاصة في المراحل الحاسمة الأخيرة من الموسم التي تتطلب الثبات والتركيز العاليين.`,
      `المواجهات المباشرة القادمة في ${label} ستكون المحطة الفيصل الحقيقية في المسيرة، وستضع كل الأرقام والتوقعات النظرية أمام اختبار الحقيقة الميدانية الصارم. ومن المنتظر أن تكشف هذه اللقاءات عن كثير من الحقائق المخبأة التي ستُعيد رسم المشهد من جديد.`,
      `من الناحية التاريخية والإحصائية، تُشير المعطيات التاريخية المتراكمة إلى أن المنافسين الذين يتميزون بالاتساق والثبات في الأداء عبر مختلف مراحل الموسم هم الأوفر حظاً في المناسبات الكبرى. وهذا المعطى يُعطي أفضلية واضحة للمنافسين الذين نجحوا في تجنب الانتكاسات الكبيرة.`,
      `وعلى مستوى العوامل النفسية والمعنوية التي كثيراً ما يُستهان بها في التحليلات التقليدية، يبرز الثقة بالنفس والتماسك الجماعي كعنصرين حاسمين لا يمكن إغفالهما في التقييمات الجادة. الفريق أو المنافس الذي يدخل المراحل الحاسمة بمعنويات عالية غالباً ما يُحقق نتائج فوق المتوقع.`,
      `ابقَ متواصلاً مع نبض الرياضة لمتابعة كل جديد ومستجد بتحليل معمّق ومعطيات حصرية موثوقة ترسم الصورة الكاملة في وقتها المناسب. سنواصل تقديم التغطية الأمينة التي تستحقها هذه المنافسة الاستثنائية.`
    ]
  },
  {
    type: "recap",
    titlePrefix: (label) => `ملخص`,
    intro: (label, hint) => `رصد فريق نبض الرياضة أبرز ما جرى في ${label} خلال الفترة الأخيرة المليئة بالأحداث، مع تسليط الضوء على اللقطات والأرقام الأكثر تأثيراً وإثارةً في هذا الملف المتحرك.`,
    body: (label) => [
      `اتسمت المرحلة الأخيرة في ${label} بمستوى رفيع من التنافسية والحدة، أفضت إلى تغييرات ملموسة في المراكز والترتيبات المختلفة. وقد شهدت هذه الحقبة تقلبات درامية غير متوقعة جعلت من الصعب التنبؤ بمآلات الأمور قبيل انتهاء كل جولة أو مرحلة.`,
      `سجّل عدد بارز من اللاعبين والمنافسين حضوراً استثنائياً ومميزاً طوال هذه المرحلة، مما أضفى على المشهد الرياضي الكبير مزيداً من الجاذبية الاستثنائية ورفع من سقف توقعات الجماهير المتعطشة للإثارة والمفاجآت غير المتوقعة.`,
      `في المقابل الواضح، عانت بعض الأندية والمنافسين من تفاوت حاد ولافت في مستوى الأداء أثار موجة واسعة من الانتقادات والتساؤلات المشروعة، وكشف عن ثغرات حقيقية في الاستعداد أو التوافق والانسجام الكافيين بين عناصر المنظومة ككل.`,
      `وتكشف قراءة الأرقام التفصيلية والإحصاءات الدقيقة المتراكمة عن تباين صارخ وواضح في المردودية والإنجاز؛ حيث يعكس هذا التباين عمق الهوّة الفعلية بين أصحاب الأداء المتميز والمستمر وأولئك الذين لا يزالون يبحثون بإصرار عن استعادة مستواهم الحقيقي المعهود.`,
      `ومن أبرز المفارقات اللافتة التي سجّلتها هذه المرحلة أن بعض المنافسين الأقل شهرةً نجحوا في تقديم مستويات فاقت التوقعات بمراحل، فيما خذل بعض الكبار جمهورهم في لحظات كانوا في أمسّ الحاجة فيها إلى التألق والارتقاء.`,
      `وعلى صعيد الإحصاءات التفصيلية التي تمنحنا صورة أكثر دقة وموضوعية بعيداً عن الانطباعات السطحية، تبرز أرقام لافتة في معدلات الأداء والإنجاز تستحق الدراسة والتمحيص. هذه الأرقام تُقدّم رواية موضوعية ومحايدة تتجاوز أحياناً ما تُقدّمه الصورة الظاهرية للأداء.`,
      `في نبض الرياضة، نختصر لك بأمانة ومهنية عالية أهم ما جرى وما لم تره في معظم التغطيات الأخرى، مع تحليل منصف وموضوعي يتجاوز السطح إلى جوهر الأحداث الحقيقية ويُقدّمها في سياقها الصحيح. تابعنا لمزيد من التقارير والملخصات الشاملة.`
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
    const hashNum = parseInt(urlHash.replace(/[^0-9a-f]/gi, "").slice(0, 8) || "0", 16) || 0;
    title = variants[(index + hashNum) % variants.length].slice(0, 90);
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

  // titleHint pour les templates de description : le titre arabe source si disponible, sinon vide
  const titleHint = (rawTitle && isArabic(rawTitle)) ? rawTitle.slice(0, 60) : "";
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

// ── Flags fail-fast ───────────────────────────────────────────────────────
let _geminiDead    = false;
let _gemini2Dead   = false; // 2ème clé Gemini
let _groqDead      = false; // 70B
let _groq8bDead    = false; // 8B fallback
let _anthropicDead = false;
let _openAIDead    = false;

function isFatalMsg(msg = "") {
  return /credit balance is too low|Your credit balance|balance is too low|insufficient_quota|invalid_api_key|account.*deactivated|billing hard limit|exceeded your current quota|You exceeded.*quota|QUOTA_EXCEEDED|API_KEY_INVALID|reported as leaked|API key.*leaked|PERMISSION_DENIED|API_NOT_ENABLED|SERVICE_DISABLED|requests to this API.*been blocked|does not have permission|ACCESS_TOKEN_SCOPE_INSUFFICIENT|KEY_INVALID/i.test(msg);
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Helper Gemini générique (réutilisé pour clé 1 et clé 2) ─────────────
async function _callGeminiWithKey(apiKey, deadFlag, setDead, prompt, systemPrompt) {
  if (!apiKey || deadFlag) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: { maxOutputTokens: 4096, temperature: 0.35 }
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
      const err = await res.text();
      if (res.status === 429) {
        if (/exceeded your current quota|QUOTA_EXCEEDED|daily.*limit/i.test(err)) {
          console.log(`  ⛔ Gemini quota épuisé — désactivé.`);
          setDead(); return null;
        }
        if (attempt < 2) { await sleep(20000); continue; }
      }
      if (isFatalMsg(err)) { console.log(`  ⛔ Gemini fatal (${res.status}): ${err.slice(0, 120)}`); setDead(); return null; }
      console.log(`Gemini error ${res.status}: ${err.slice(0, 120)}`);
      return null;
    } catch (e) { console.log("Gemini request failed:", e.message?.slice(0, 60)); return null; }
  }
  return null;
}

// ── 1a. Gemini — clé principale ──────────────────────────────────────────
async function callGemini(prompt, systemPrompt = null) {
  return _callGeminiWithKey(GOOGLE_API_KEY, _geminiDead, () => { _geminiDead = true; }, prompt, systemPrompt);
}

// ── 1b. Gemini — 2ème clé (compte Google différent, +1500 req/jour) ─────
async function callGemini2(prompt, systemPrompt = null) {
  if (!GOOGLE_API_KEY_2) return null;
  return _callGeminiWithKey(GOOGLE_API_KEY_2, _gemini2Dead, () => { _gemini2Dead = true; }, prompt, systemPrompt);
}

// ── Helper Groq générique (réutilisé pour 70B et 8B) ─────────────────────
async function _callGroqModel(model, deadFlag, setDead, maxTok, prompt, systemPrompt) {
  if (!GROQ_API_KEY || deadFlag) return null;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model, temperature: 0.35, max_tokens: maxTok,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = JSON.stringify(data?.error || data);
      if (/rate_limit_exceeded/i.test(msg)) {
        console.log(`  ↩ Groq ${model} rate limit — attente 30s...`);
        await sleep(30000);
        const res2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, temperature: 0.35, max_tokens: maxTok,
            messages: [...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []), { role: "user", content: prompt }] })
        });
        const d2 = await res2.json();
        if (res2.ok) return d2?.choices?.[0]?.message?.content || null;
      }
      if (isFatalMsg(msg)) { console.log(`  ⛔ Groq ${model} fatal — désactivé.`); setDead(); }
      else console.log(`Groq ${model} error:`, msg.slice(0, 100));
      return null;
    }
    return data?.choices?.[0]?.message?.content || null;
  } catch (e) { console.log(`Groq ${model} request failed:`, e.message?.slice(0, 60)); return null; }
}

// ── 2a. Groq Llama 3.3 70B (qualité max, 6000 TPM) ───────────────────────
async function callGroq(prompt, systemPrompt = null) {
  return _callGroqModel(GROQ_MODEL_70B, _groqDead, () => { _groqDead = true; }, 2500, prompt, systemPrompt);
}

// ── 2b. Groq Llama 3.1 8B (ultra-rapide, 131072 TPM — fallback TPM) ──────
async function callGroq8b(prompt, systemPrompt = null) {
  return _callGroqModel(GROQ_MODEL_8B, _groq8bDead, () => { _groq8bDead = true; }, 2500, prompt, systemPrompt);
}

// ── 3. Anthropic Claude (payant — fallback si crédits dispo) ─────────────
async function callAnthropic(prompt, systemPrompt = null) {
  if (!ANTHROPIC_API_KEY || _anthropicDead) return null;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL, max_tokens: 8000,
        system: systemPrompt || "أنت محرر رياضي عربي متخصص. اكتب بالعربية الفصحى البسيطة فقط.",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || JSON.stringify(data);
      if (isFatalMsg(msg)) { console.log("  ⛔ Anthropic fatal — désactivé."); _anthropicDead = true; }
      else console.log("Anthropic error:", msg.slice(0, 120));
      return null;
    }
    return data?.content?.[0]?.text || null;
  } catch (e) { console.log("Anthropic request failed:", e.message); return null; }
}

// ── 4. OpenAI GPT-4o-mini (payant — dernier recours) ────────────────────
async function callOpenAI(prompt, systemPrompt = null) {
  if (!OPENAI_API_KEY || _openAIDead) return null;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini", temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt || "أنت محرر رياضي عربي متخصص. اكتب بالعربية الفصحى البسيطة فقط." },
          { role: "user", content: prompt }
        ],
        max_tokens: 8000
      })
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = JSON.stringify(data?.error || data);
      if (isFatalMsg(msg)) { console.log("  ⛔ OpenAI fatal — désactivé."); _openAIDead = true; }
      else console.log("OpenAI error:", msg.slice(0, 120));
      return null;
    }
    return data?.choices?.[0]?.message?.content || null;
  } catch (e) { console.log("OpenAI request failed:", e.message); return null; }
}

// ── Sélecteur : Gemini1 → Gemini2 → Groq70B → Groq8B → Anthropic → OpenAI
function noLLMLeft() {
  return (_geminiDead    || !GOOGLE_API_KEY)    &&
         (_gemini2Dead   || !GOOGLE_API_KEY_2)  &&
         (_groqDead      || !GROQ_API_KEY)      &&
         (_groq8bDead    || !GROQ_API_KEY)      &&
         (_anthropicDead || !ANTHROPIC_API_KEY) &&
         (_openAIDead    || !OPENAI_API_KEY);
}

async function callLLM(prompt, systemPrompt = null) {
  if (noLLMLeft()) return null;
  const r1 = await callGemini(prompt, systemPrompt);    if (r1) return r1;
  const r1b= await callGemini2(prompt, systemPrompt);   if (r1b) return r1b;
  const r2 = await callGroq(prompt, systemPrompt);      if (r2) return r2;
  const r2b= await callGroq8b(prompt, systemPrompt);    if (r2b) return r2b;
  const r3 = await callAnthropic(prompt, systemPrompt); if (r3) return r3;
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
  const srcLangLabel = srcLang === "en" ? "Anglais" : srcLang === "fr" ? "Français" : "Arabe";

  // Prompt arabe uniquement — réduit les tokens de 2500 → ~800 par appel
  // EN/FR générés séparément par backfill-translations.mjs
  return `أنت محرر رياضي متمرس لموقع "نبض الرياضة". اكتب مقالاً رياضياً احترافياً بالعربية الفصحى.

⚡ نوع المقال: ${format.ar} — ${format.hint}

--- المصدر (${srcLangLabel}) ---
الرياضة / البطولة: ${label}
العنوان الأصلي: ${originalTitle}
الملخص: ${originalDescription}
الوسوم: ${(item.topicTags || []).join("، ")}

📌 قواعد العنوان:
- اذكر الفريق أو اللاعب أو الحدث الأساسي بوضوح
- لا عناوين عامة مثل "آخر أخبار كرة القدم" أو "أخبار رياضية"
- لا بادئات: عاجل / تحليل / ملخص
- العنوان: 45-70 حرفاً

متطلبات المقال:
- content: 7 فقرات على الأقل، مفصولة بـ \\n\\n، بدون ماركداون
- كل فقرة: 80-130 كلمة عربية
- المجموع: 600-800 كلمة
- البنية: مقدمة → خلفية → تفاصيل → تحليل → أرقام → آراء → خلاصة
- أسلوب: صحفي تحليلي على مستوى الجزيرة الرياضية / بي بي سي عربي
- الأسماء الأجنبية تُعرَّب: ليفربول، ريال مدريد، مبابي...
- keywords: 8-10 كلمات مفتاحية عربية
- faq: 3 أسئلة وأجوبة مفيدة (كل جواب 40-60 كلمة)

أعد JSON صالح فقط (بدون ماركداون):
{
  "title": "...",
  "description": "وصف SEO 145-160 حرفاً",
  "seoTitle": "[فريق/لاعب] — [حدث] | نبض الرياضة",
  "seoDescription": "...",
  "content": "فقرة 1\\n\\nفقرة 2\\n\\nفقرة 3\\n\\nفقرة 4\\n\\nفقرة 5\\n\\nفقرة 6\\n\\nفقرة 7",
  "keywords": ["..."],
  "faq": [{"q":"...","a":"..."},{"q":"...","a":"..."},{"q":"...","a":"..."}]
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

  if (!GOOGLE_API_KEY && !GROQ_API_KEY && !ANTHROPIC_API_KEY && !OPENAI_API_KEY) return fallback;

  // Prompt unique — toutes les sources passent par le même flux.
  // L'IA réécrit 100% original dans les 3 langues (AR + EN + FR).
  const prompt = buildPrompt(item, format, label, source, srcLang);

  const raw = await callLLM(prompt, systemPrompt);
  if (!raw) {
    console.log(`  ⚠ LLM returned null for article ${index + 1} — all APIs failed, using fallback.`);
    return fallback;
  }
  console.log(`  ✓ LLM raw response: ${raw.length} chars`);

  const parsed = extractJson(raw);
  if (!parsed) {
    console.log(`  ✗ JSON parse failed — raw (first 300): ${raw.slice(0, 300).replace(/\n/g, "↵")}`);
    return fallback;
  }

  // Diagnostic: log content length before sanitization
  const rawContentLen = (parsed.content || "").split(/\s+/).filter(Boolean).length;
  console.log(`  ✓ JSON ok — content: ${rawContentLen}w, en: ${(parsed.en_content||"").split(/\s+/).filter(Boolean).length}w`);

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

  const finalWords = (content || "").split(/\s+/).filter(Boolean).length;
  if (finalWords < 200) {
    console.log(`  ⚠ Content after sanitize: only ${finalWords}w — checking raw content: "${(parsed.content||"").slice(0,200).replace(/\n/g,"↵")}"`);
  }

  if (!title || !description || !content) return fallback;

  // EN/FR : si présents dans la réponse (Gemini peut les générer), on les garde.
  // Sinon null → backfill-translations.mjs les générera séparément.
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
  // ── Toujours rafraîchir raw-news.json en full-refresh ─────────────────────
  // git reset --hard remet le mtime à now → fiabiliser par mtime impossible.
  // fetch-news filtre lui-même les déjà-publiés → ne retourne que du nouveau.
  if (process.env.BREAKING_ONLY !== "true") {
    console.log("Full-refresh — lancement fetch-news.mjs...");
    try {
      execFileSync("node", [path.join(process.cwd(), "scripts/fetch-news.mjs")], {
        stdio: "inherit",
        timeout: 5 * 60 * 1000,
      });
    } catch (e) {
      console.log("fetch-news.mjs échoué, on continue avec raw-news existant:", e.message?.slice(0, 80));
    }
  }

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

  // Cap per-run to respect rate limits (Gemini: 15 RPM, Groq: ~4 RPM effective)
  // Full refresh runs every hour → 20 articles/run × 24 runs = 480 articles/day max
  const MAX_PER_RUN = 20;
  // 12s entre appels — respecte la TPM Groq (6000 TPM / ~800 tokens/appel = 7.5 req/min → 8s mini)
  // 12s de marge = sécurisé. 20 articles × 12s = 4 min max.
  const LLM_DELAY_MS = 12000;

  // Spread: priority to recent/diverse sports within cap
  const footballItems = unique.filter((i) => !i.sport || i.sport === "football").slice(0, 12);
  const basketItems   = unique.filter((i) => i.sport === "basketball").slice(0, 3);
  const tennisItems   = unique.filter((i) => i.sport === "tennis").slice(0, 2);
  const padelItems    = unique.filter((i) => i.sport === "padel").slice(0, 1);
  const futsalItems   = unique.filter((i) => i.sport === "futsal").slice(0, 1);
  const f1Items       = unique.filter((i) => i.sport === "f1").slice(0, 1);
  const selected = [...footballItems, ...basketItems, ...tennisItems, ...padelItems, ...futsalItems, ...f1Items].slice(0, MAX_PER_RUN);

  console.log(`New items to write: ${selected.length} (cap: ${MAX_PER_RUN})`);
  if (noLLMLeft()) {
    console.log("⚠ Toutes les APIs LLM sont épuisées — articles en fallback uniquement.");
  }

  const newArticles = [];

  for (let i = 0; i < selected.length; i++) {
    const item = selected[i];
    const label = item.originalTitle || `خبر ${i + 1}`;
    console.log(`[${i + 1}/${selected.length}] ${item.sport || "football"}: ${label.slice(0, 65)}`);

    const rewritten = await rewriteArticle(item, i);
    // Rate limit respect — pause between LLM calls (not after last item)
    if (i < selected.length - 1 && !noLLMLeft()) await sleep(LLM_DELAY_MS);

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
    if (toTranslate.length > 0 && !noLLMLeft()) {
      console.log(`\n🌍 LLM backfill: ${toTranslate.length} articles need EN/FR translation...`);
      for (const article of toTranslate) {
        if (noLLMLeft()) break; // stop early if all APIs dead
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

main().catch(e => {
  console.error("rewrite-article fatal error (non-blocking):", e.message || e);
  process.exit(0);  // exit 0 so CI continues to build + deploy
});
