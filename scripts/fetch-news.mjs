import fs from "fs";
import path from "path";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["media:content", "mediaContent"],
      ["enclosure", "enclosure"]
    ]
  }
});
const OUTPUT_PATH = path.join(process.cwd(), "content/raw-news.json");

const SOURCES = [
  // ── Football Arabic ───────────────────────────────────────────
  { name: "Btolat RSS",         type: "rss",  priority: "arabic",   sport: "football", sourceLang: "ar", url: "https://www.btolat.com/rss/" },
  { name: "Kooora",             type: "html", priority: "arabic",   sport: "football", sourceLang: "ar", url: "https://www.kooora.com/" },
  { name: "Hesport",            type: "html", priority: "arabic",   sport: "football", sourceLang: "ar", url: "https://www.hesport.com/all" },
  { name: "Al Jazeera Sport",   type: "html", priority: "arabic",   sport: "football", sourceLang: "ar", url: "https://www.aljazeera.net/sport/" },
  { name: "Al Araby Sport",     type: "html", priority: "arabic",   sport: "football", sourceLang: "ar", url: "https://www.alaraby.co.uk/sport" },
  { name: "Elsport",            type: "html", priority: "arabic",   sport: "football", sourceLang: "ar", url: "https://www.elsport.com/" },
  { name: "Filgoal",            type: "rss",  priority: "arabic",   sport: "football", sourceLang: "ar", url: "https://www.filgoal.com/rss/" },
  { name: "Kass",               type: "rss",  priority: "arabic",   sport: "football", sourceLang: "ar", url: "https://www.kass.com.qa/rss" },
  // ── Champions League (Arabic + English) ──────────────────────
  { name: "UCL AR",             type: "rss",  priority: "arabic",   sport: "football", sourceLang: "ar", league: "champions-league", url: "https://news.google.com/rss/search?q=دوري+أبطال+أوروبا+2025&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "UCL Semi AR",        type: "rss",  priority: "arabic",   sport: "football", sourceLang: "ar", league: "champions-league", url: "https://news.google.com/rss/search?q=نصف+نهائي+أبطال+أوروبا&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "UCL EN",             type: "rss",  priority: "english",  sport: "football", sourceLang: "en", league: "champions-league", url: "https://news.google.com/rss/search?q=Champions+League+semi-final+2025&hl=en&gl=GB&ceid=GB:en" },
  { name: "UCL Final EN",       type: "rss",  priority: "english",  sport: "football", sourceLang: "en", league: "champions-league", url: "https://news.google.com/rss/search?q=UEFA+Champions+League+2025+final&hl=en&gl=GB&ceid=GB:en" },
  // ── Real Madrid ───────────────────────────────────────────────
  { name: "Real Madrid AR",     type: "rss",  priority: "arabic",   sport: "football", sourceLang: "ar", league: "la-liga", url: "https://news.google.com/rss/search?q=ريال+مدريد+2025&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "Real Madrid EN",     type: "rss",  priority: "english",  sport: "football", sourceLang: "en", league: "la-liga", url: "https://news.google.com/rss/search?q=Real+Madrid+2025+news&hl=en&gl=GB&ceid=GB:en" },
  // ── Premier League ────────────────────────────────────────────
  { name: "PL AR",              type: "rss",  priority: "arabic",   sport: "football", sourceLang: "ar", league: "premier-league", url: "https://news.google.com/rss/search?q=الدوري+الإنجليزي+الممتاز+2025&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "PL EN",              type: "rss",  priority: "english",  sport: "football", sourceLang: "en", league: "premier-league", url: "https://news.google.com/rss/search?q=Premier+League+2025+news&hl=en&gl=GB&ceid=GB:en" },
  { name: "BBC Football",       type: "rss",  priority: "english",  sport: "football", sourceLang: "en", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
  { name: "Sky Sports Football",type: "rss",  priority: "english",  sport: "football", sourceLang: "en", url: "https://news.google.com/rss/search?q=site:skysports.com+football&hl=en&gl=GB&ceid=GB:en" },
  // ── La Liga ───────────────────────────────────────────────────
  { name: "La Liga AR",         type: "rss",  priority: "arabic",   sport: "football", sourceLang: "ar", league: "la-liga", url: "https://news.google.com/rss/search?q=الدوري+الإسباني+برشلونة+2025&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "La Liga EN",         type: "rss",  priority: "english",  sport: "football", sourceLang: "en", league: "la-liga", url: "https://news.google.com/rss/search?q=La+Liga+Barcelona+2025&hl=en&gl=GB&ceid=GB:en" },
  // ── Bundesliga / Serie A / Ligue 1 ───────────────────────────
  { name: "Bundesliga EN",      type: "rss",  priority: "english",  sport: "football", sourceLang: "en", league: "bundesliga", url: "https://news.google.com/rss/search?q=Bundesliga+Bayern+Munich+2025&hl=en&gl=GB&ceid=GB:en" },
  { name: "Serie A EN",         type: "rss",  priority: "english",  sport: "football", sourceLang: "en", league: "serie-a", url: "https://news.google.com/rss/search?q=Serie+A+Juventus+Milan+2025&hl=en&gl=GB&ceid=GB:en" },
  { name: "Ligue 1 FR",         type: "rss",  priority: "french",   sport: "football", sourceLang: "fr", league: "ligue-1", url: "https://news.google.com/rss/search?q=Ligue+1+PSG+2025&hl=fr&gl=FR&ceid=FR:fr" },
  { name: "L'Equipe FR",        type: "rss",  priority: "french",   sport: "football", sourceLang: "fr", url: "https://news.google.com/rss/search?q=football+actualité+2025&hl=fr&gl=FR&ceid=FR:fr" },
  // ── Google News Football Arabic ───────────────────────────────
  { name: "Google News Football AR", type: "rss", priority: "arabic", sport: "football", sourceLang: "ar", url: "https://news.google.com/rss/search?q=كرة+القدم+أخبار&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "Google News Football AR2",type: "rss", priority: "arabic", sport: "football", sourceLang: "ar", url: "https://news.google.com/rss/search?q=كرة+القدم+مباراة+نتائج+2025&hl=ar&gl=MA&ceid=MA:ar" },
  // ── Basketball ────────────────────────────────────────────────
  { name: "Google News Basketball AR", type: "rss", priority: "arabic",  sport: "basketball", sourceLang: "ar", url: "https://news.google.com/rss/search?q=كرة+السلة+NBA&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "ESPN NBA RSS",              type: "rss", priority: "english", sport: "basketball", sourceLang: "en", url: "https://www.espn.com/espn/rss/nba/news" },
  { name: "Google News NBA EN",        type: "rss", priority: "english", sport: "basketball", sourceLang: "en", url: "https://news.google.com/rss/search?q=NBA+playoffs+2025+results&hl=en&gl=US&ceid=US:en" },
  { name: "BBC Basketball",            type: "rss", priority: "english", sport: "basketball", sourceLang: "en", url: "https://feeds.bbci.co.uk/sport/basketball/rss.xml" },
  // ── Tennis ────────────────────────────────────────────────────
  { name: "Google News Tennis AR",  type: "rss", priority: "arabic",  sport: "tennis", sourceLang: "ar", url: "https://news.google.com/rss/search?q=تنس+ATP+WTA+بطولة&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "BBC Sport Tennis",       type: "rss", priority: "english", sport: "tennis", sourceLang: "en", url: "https://feeds.bbci.co.uk/sport/tennis/rss.xml" },
  { name: "Roland Garros EN",       type: "rss", priority: "english", sport: "tennis", sourceLang: "en", url: "https://news.google.com/rss/search?q=Roland+Garros+2025+tennis&hl=en&gl=GB&ceid=GB:en" },
  // ── Padel ─────────────────────────────────────────────────────
  { name: "Google News Padel AR",   type: "rss", priority: "arabic",  sport: "padel", sourceLang: "ar", url: "https://news.google.com/rss/search?q=البادل+بادل+رياضة&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "Google News Padel EN",   type: "rss", priority: "english", sport: "padel", sourceLang: "en", url: "https://news.google.com/rss/search?q=Premier+Padel+World+Padel+Tour+2025&hl=en&gl=GB&ceid=GB:en" },
  { name: "Padel FR",               type: "rss", priority: "french",  sport: "padel", sourceLang: "fr", url: "https://news.google.com/rss/search?q=padel+sport+2025&hl=fr&gl=FR&ceid=FR:fr" },
  // ── Futsal ────────────────────────────────────────────────────
  { name: "Google News Futsal AR",  type: "rss", priority: "arabic",  sport: "futsal", sourceLang: "ar", url: "https://news.google.com/rss/search?q=فوتسال+كرة+قدم+صالات&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "Google News Futsal EN",  type: "rss", priority: "english", sport: "futsal", sourceLang: "en", url: "https://news.google.com/rss/search?q=futsal+FIFA+2025&hl=en&gl=GB&ceid=GB:en" },
  // ── Algérie ──────────────────────────────────────────────────
  { name: "Algérie Foot AR",        type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "ligue-pro-dz", url: "https://news.google.com/rss/search?q=الدوري+الجزائري+كرة+القدم+2025&hl=ar&gl=DZ&ceid=DZ:ar" },
  { name: "Algérie Transferts AR",  type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "ligue-pro-dz", url: "https://news.google.com/rss/search?q=المنتخب+الجزائري+2025&hl=ar&gl=DZ&ceid=DZ:ar" },
  { name: "Dzfoot AR",              type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "ligue-pro-dz", url: "https://news.google.com/rss/search?q=موبيليس+الجزائر+كأس&hl=ar&gl=DZ&ceid=DZ:ar" },
  // ── Égypte ───────────────────────────────────────────────────
  { name: "Égypte Foot AR",         type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "prem-egy", url: "https://news.google.com/rss/search?q=الدوري+المصري+الممتاز+2025&hl=ar&gl=EG&ceid=EG:ar" },
  { name: "Ahly Zamalek AR",        type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "prem-egy", url: "https://news.google.com/rss/search?q=الأهلي+الزمالك+2025&hl=ar&gl=EG&ceid=EG:ar" },
  // ── Maroc ────────────────────────────────────────────────────
  { name: "Maroc Foot AR",          type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "botola-ma", url: "https://news.google.com/rss/search?q=البطولة+الاحترافية+المغربية+2025&hl=ar&gl=MA&ceid=MA:ar" },
  { name: "Wydad Raja AR",          type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "botola-ma", url: "https://news.google.com/rss/search?q=الوداد+الرجاء+الرياضي+2025&hl=ar&gl=MA&ceid=MA:ar" },
  { name: "Hesport Maroc",          type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "botola-ma", url: "https://news.google.com/rss/search?q=كرة+القدم+المغربية+أخبار&hl=ar&gl=MA&ceid=MA:ar" },
  // ── Tunisie ──────────────────────────────────────────────────
  { name: "Tunisie Foot AR",        type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "ligue-pro-tn", url: "https://news.google.com/rss/search?q=الرابطة+المحترفة+التونسية+2025&hl=ar&gl=TN&ceid=TN:ar" },
  { name: "Espérance Etoile AR",    type: "rss", priority: "arabic",  sport: "football", sourceLang: "ar", league: "ligue-pro-tn", url: "https://news.google.com/rss/search?q=الترجي+النجم+الساحلي+2025&hl=ar&gl=TN&ceid=TN:ar" },
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(base, href = "") {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function detectSport(text = "", sourceSport = "football") {
  const v = normalizeText(text);

  const basketSignals = ["كرة السلة", "كرة سلة", "NBA", "الدوري الأمريكي للمحترفين", "ليكرز", "وارييرز", "سيلتكس", "هيت", "بولز", "ثاندر", "نيكس", "لايكرز"];
  const tennisSignals = ["التنس", "كرة المضرب", "رولان غاروس", "ويمبلدون", "يو إس أوبن", "أوستراليا أوبن", "فيدرر", "نادال", "ديوكوفيتش", "سيرينا", "موراي", "ATP", "WTA", "البطولة الكبرى"];
  const padelSignals = ["البادل", "البادلة", "بادل", "Padel", "World Padel Tour", "بطولة البادل"];
  const futsalSignals = ["كرة قدم صالة", "كرة قدم صالات", "فوتسال", "futsal", "الصالات المغلقة", "بطولة الصالات"];

  if (basketSignals.some((s) => v.includes(s))) return "basketball";
  if (tennisSignals.some((s) => v.includes(s))) return "tennis";
  if (padelSignals.some((s) => v.includes(s))) return "padel";
  if (futsalSignals.some((s) => v.includes(s))) return "futsal";

  return sourceSport || "football";
}

function detectLeague(text = "") {
  const value = normalizeText(text);

  const premierSignals = [
    "الدوري الإنجليزي", "البريميرليغ", "البريمير ليغ",
    "مانشستر يونايتد", "مانشستر سيتي", "ليفربول",
    "تشيلسي", "آرسنال", "توتنهام", "أستون فيلا", "نيوكاسل",
    "وست هام", "إيفرتون", "نوتنغهام"
  ];

  const laLigaSignals = [
    "الدوري الإسباني", "الليغا", "ريال مدريد", "برشلونة",
    "أتلتيكو مدريد", "فالنسيا", "إشبيلية", "فياريال",
    "ريال سوسيداد", "بيتيس", "أوساسونا"
  ];

  if (premierSignals.some((s) => value.includes(s))) return "premier-league";
  if (laLigaSignals.some((s) => value.includes(s))) return "la-liga";
  return "mixed";
}

function detectTopicTags(text = "", sport = "football") {
  const value = normalizeText(text);
  const tags = [];

  const sharedMap = [
    ["انتقالات", ["انتقال", "صفقة", "تعاقد", "يرتبط", "اهتمام", "مفاوضات", "عقد"]],
    ["إصابات", ["إصابة", "غياب", "تعافى", "العلاج", "غائب"]],
    ["نتائج", ["فاز", "خسر", "تعادل", "مباراة", "نتيجة", "انتصار", "هزيمة"]],
    ["تصريحات", ["قال", "صرح", "أكد", "أوضح", "تحدث", "كشف"]],
    ["مدربون", ["مدرب", "الجهاز الفني", "التكتيك"]],
    ["لاعبون", ["لاعب", "نجم", "مهاجم", "وسط", "مدافع", "حارس", "لاعبة"]]
  ];

  const sportMap = {
    football: [["كرة القدم", ["كرة القدم", "الدوري", "البطولة", "الكأس", "الملعب", "الهدف"]]],
    basketball: [["كرة السلة", ["كرة السلة", "NBA", "الدوري الأمريكي", "السلة", "باسكيت"]]],
    tennis: [["التنس", ["التنس", "كرة المضرب", "بطولة", "غراند سلام", "المجموعة"]]],
    padel: [["البادل", ["البادل", "البادلة", "الملعب الزجاجي"]]],
    futsal: [["كرة قدم صالة", ["كرة قدم صالة", "فوتسال", "الصالات"]]]
  };

  for (const [tag, signals] of sharedMap) {
    if (signals.some((s) => value.includes(s))) tags.push(tag);
  }

  const sportSpecific = sportMap[sport] || sportMap.football;
  for (const [tag, signals] of sportSpecific) {
    if (signals.some((s) => value.includes(s))) tags.push(tag);
  }

  return tags.length ? tags.slice(0, 4) : [sportLabel(sport)];
}

function sportLabel(sport = "football") {
  const labels = {
    football: "كرة القدم",
    basketball: "كرة السلة",
    tennis: "التنس",
    padel: "البادل",
    futsal: "كرة قدم صالة"
  };
  return labels[sport] || "الرياضة";
}

function looksLikeArabicSportsHeadline(text = "") {
  const value = normalizeText(text);
  if (!value) return false;
  if (value.length < 18 || value.length > 220) return false;

  const arabicCount = (value.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabicCount < 6) return false;

  const badWords = [
    "اتصل بنا", "سياسة الخصوصية", "شروط الاستخدام", "المزيد",
    "فيديوهات", "تحميل", "إعلان", "اعلان", "تسجيل الدخول",
    "اشترك", "تابعنا", "الرئيسية", "البث المباشر من هنا"
  ];
  if (badWords.some((w) => value.includes(w))) return false;

  const sportsWords = [
    "ريال", "برشلونة", "مانشستر", "ليفربول", "تشيلسي", "آرسنال",
    "الدوري", "كأس", "مباراة", "المنتخب", "كرة", "هدف", "مدرب",
    "لاعب", "انتقال", "صفقة", "نادي", "بطولة", "NBA", "التنس",
    "البادل", "السلة", "فوتسال", "الصالة", "نادال", "فيدرر",
    "ديوكوفيتش", "ليكرز", "وارييرز"
  ];
  return sportsWords.some((w) => value.includes(w)) || arabicCount > 20;
}

function slugFromTitle(title = "", index = 0) {
  const cleaned = normalizeText(title)
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || `news-${index + 1}`;
}

async function fetchRss(source) {
  try {
    const feed = await parser.parseURL(source.url);

    return (feed.items || []).slice(0, 16).map((item, index) => {
      const title = normalizeText(item.title || "");
      const description = normalizeText(
        item.contentSnippet || item.content || item.summary || item.description || ""
      );
      const combined = `${title} ${description}`;
      const sport = detectSport(combined, source.sport);

      // Extract image URL from RSS enclosure or media fields
      let imageUrl = null;
      if (item.enclosure?.url && /\.(jpg|jpeg|png|webp)/i.test(item.enclosure.url)) {
        imageUrl = item.enclosure.url;
      } else if (item.mediaThumbnail?.["$"]?.url) {
        imageUrl = item.mediaThumbnail["$"].url;
      } else if (item.mediaContent?.["$"]?.url && /\.(jpg|jpeg|png|webp)/i.test(item.mediaContent["$"].url)) {
        imageUrl = item.mediaContent["$"].url;
      }

      const detectedLeague = source.league || (sport === "football" ? detectLeague(combined) : sport);
      return {
        originalTitle: title,
        originalDescription: description,
        link: item.link || source.url,
        source: source.name,
        sourcePriority: source.priority,
        sourceLang: source.sourceLang || "ar",
        sport,
        league: detectedLeague,
        topicTags: detectTopicTags(combined, sport),
        publishedAt: item.pubDate || new Date().toISOString(),
        slug: slugFromTitle(title, index),
        ...(imageUrl ? { imageUrl } : {})
      };
    });
  } catch (error) {
    console.log(`RSS failed for ${source.name}: ${error.message}`);
    return [];
  }
}

function extractFromHtml(html = "", baseUrl = "", sourceName = "", priority = "arabic", defaultSport = "football") {
  const anchors = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const results = [];

  for (const match of anchors) {
    const href = match[1];
    const rawText = normalizeText(match[2]);

    if (!looksLikeArabicSportsHeadline(rawText)) continue;

    const link = absoluteUrl(baseUrl, href);
    if (!/^https?:\/\//.test(link)) continue;

    const sport = detectSport(rawText, defaultSport);

    results.push({
      originalTitle: rawText,
      originalDescription: `${rawText} - متابعة أولية من ${sourceName}`,
      link,
      source: sourceName,
      sourcePriority: priority,
      sport,
      league: sport === "football" ? detectLeague(rawText) : sport,
      topicTags: detectTopicTags(rawText, sport),
      publishedAt: new Date().toISOString()
    });
  }

  const unique = [];
  const seen = new Set();

  for (const item of results) {
    const key = normalizeText(item.originalTitle).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= 16) break;
  }

  return unique;
}

async function fetchHtml(source) {
  try {
    const response = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await response.text();
    return extractFromHtml(html, source.url, source.name, source.priority, source.sport);
  } catch (error) {
    console.log(`HTML failed for ${source.name}: ${error.message}`);
    return [];
  }
}

async function main() {
  const collected = [];

  for (const source of SOURCES) {
    const items = source.type === "rss" ? await fetchRss(source) : await fetchHtml(source);
    collected.push(...items);
  }

  const unique = [];
  const seen = new Set();

  for (const item of collected) {
    const title = normalizeText(item.originalTitle);
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  const arabicItems = unique.filter((item) => item.sourcePriority === "arabic");
  const fallbackItems = unique.filter((item) => item.sourcePriority !== "arabic");

  // Ligues nord-africaines = tier 2 (10% du football)
  const NA_LEAGUES = new Set(["ligue-pro-dz", "prem-egy", "botola-ma", "ligue-pro-tn"]);

  const bySport = (items, sport) => items.filter(i => i.sport === sport);
  const byTier  = (items, tier) => tier === 1
    ? items.filter(i => !NA_LEAGUES.has(i.league))
    : items.filter(i => NA_LEAGUES.has(i.league));

  // Football : 90% top leagues (tier 1) + 10% Nord-Afrique (tier 2)
  // Cible brute ~120 → rewrite sélectionne 84
  const ftTier1Ar  = byTier(bySport(arabicItems,   "football"), 1).slice(0, 44);
  const ftTier2Ar  = byTier(bySport(arabicItems,   "football"), 2).slice(0, 6);   // ~10%
  const ftTier1Fb  = byTier(bySport(fallbackItems, "football"), 1).slice(0, Math.max(0, 26 - ftTier1Ar.length));
  const basketAr   = bySport(arabicItems,   "basketball").slice(0, 6);
  const tennisAr   = bySport(arabicItems,   "tennis").slice(0, 5);
  const padelAr    = bySport(arabicItems,   "padel").slice(0, 4);
  const futsalAr   = bySport(arabicItems,   "futsal").slice(0, 3);
  const basketFb   = bySport(fallbackItems, "basketball").slice(0, Math.max(0, 6 - basketAr.length));
  const tennisFb   = bySport(fallbackItems, "tennis").slice(0, Math.max(0, 5 - tennisAr.length));
  const padelFb    = bySport(fallbackItems, "padel").slice(0, Math.max(0, 4 - padelAr.length));
  const futsalFb   = bySport(fallbackItems, "futsal").slice(0, Math.max(0, 3 - futsalAr.length));
  const prioritized = [
    ...ftTier1Ar, ...ftTier2Ar, ...basketAr, ...tennisAr, ...padelAr, ...futsalAr,
    ...ftTier1Fb, ...basketFb, ...tennisFb, ...padelFb, ...futsalFb,
  ];

  ensureDir(OUTPUT_PATH);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(prioritized, null, 2), "utf-8");

  const sportCounts = prioritized.reduce((acc, item) => {
    acc[item.sport] = (acc[item.sport] || 0) + 1;
    return acc;
  }, {});
  console.log(`raw news saved: ${prioritized.length}`, sportCounts);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
