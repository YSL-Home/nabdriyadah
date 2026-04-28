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
  // ── Football ──────────────────────────────────────────────────
  { name: "Btolat RSS", type: "rss", priority: "arabic", sport: "football", url: "https://www.btolat.com/rss/" },
  { name: "Kooora", type: "html", priority: "arabic", sport: "football", url: "https://www.kooora.com/" },
  { name: "Hesport", type: "html", priority: "arabic", sport: "football", url: "https://www.hesport.com/all" },
  { name: "Al Jazeera Sport", type: "html", priority: "arabic", sport: "football", url: "https://www.aljazeera.net/sport/" },
  { name: "Al Araby Sport", type: "html", priority: "arabic", sport: "football", url: "https://www.alaraby.co.uk/sport" },
  { name: "Elsport", type: "html", priority: "arabic", sport: "football", url: "https://www.elsport.com/" },
  {
    name: "Google News Football",
    type: "rss",
    priority: "arabic",
    sport: "football",
    url: "https://news.google.com/rss/search?q=كرة+القدم+أخبار&hl=ar&gl=SA&ceid=SA:ar"
  },
  // ── Basketball ────────────────────────────────────────────────
  { name: "Google News Basketball AR",  type: "rss", priority: "arabic",   sport: "basketball", url: "https://news.google.com/rss/search?q=كرة+السلة+NBA&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "Google News NBA AR",         type: "rss", priority: "arabic",   sport: "basketball", url: "https://news.google.com/rss/search?q=الدوري+الأمريكي+للمحترفين+باسكيت&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "BBC Sport Basketball",       type: "rss", priority: "fallback", sport: "basketball", url: "https://feeds.bbci.co.uk/sport/basketball/rss.xml" },
  { name: "ESPN NBA RSS",               type: "rss", priority: "fallback", sport: "basketball", url: "https://www.espn.com/espn/rss/nba/news" },
  { name: "Google News NBA EN",         type: "rss", priority: "fallback", sport: "basketball", url: "https://news.google.com/rss/search?q=NBA+basketball+playoffs+2025&hl=en&gl=US&ceid=US:en" },
  // ── Tennis ────────────────────────────────────────────────────
  { name: "Google News Tennis AR",      type: "rss", priority: "arabic",   sport: "tennis",     url: "https://news.google.com/rss/search?q=تنس+ATP+WTA+بطولة&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "Google News Tennis AR2",     type: "rss", priority: "arabic",   sport: "tennis",     url: "https://news.google.com/rss/search?q=كرة+المضرب+لاعب+تنس&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "BBC Sport Tennis",           type: "rss", priority: "fallback", sport: "tennis",     url: "https://feeds.bbci.co.uk/sport/tennis/rss.xml" },
  { name: "Google News Tennis EN",      type: "rss", priority: "fallback", sport: "tennis",     url: "https://news.google.com/rss/search?q=tennis+ATP+WTA+tournament+2025&hl=en&gl=US&ceid=US:en" },
  // ── Padel ─────────────────────────────────────────────────────
  { name: "Google News Padel AR",       type: "rss", priority: "arabic",   sport: "padel",      url: "https://news.google.com/rss/search?q=البادل+بادل+رياضة&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "Google News Premier Padel",  type: "rss", priority: "fallback", sport: "padel",      url: "https://news.google.com/rss/search?q=Premier+Padel+World+Padel+Tour+2025&hl=en&gl=US&ceid=US:en" },
  { name: "Google News Padel EN",       type: "rss", priority: "fallback", sport: "padel",      url: "https://news.google.com/rss/search?q=padel+sport+tournament+ranking&hl=en&gl=US&ceid=US:en" },
  // ── Futsal ────────────────────────────────────────────────────
  { name: "Google News Futsal AR",      type: "rss", priority: "arabic",   sport: "futsal",     url: "https://news.google.com/rss/search?q=فوتسال+كرة+قدم+صالات&hl=ar&gl=SA&ceid=SA:ar" },
  { name: "Google News Futsal EN",      type: "rss", priority: "fallback", sport: "futsal",     url: "https://news.google.com/rss/search?q=futsal+championship+FIFA+2025&hl=en&gl=US&ceid=US:en" },
  // ── Fallback Football ──────────────────────────────────────────
  { name: "BBC Sport Football",         type: "rss", priority: "fallback", sport: "football",   url: "https://feeds.bbci.co.uk/sport/football/rss.xml" }
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

      return {
        originalTitle: title,
        originalDescription: description,
        link: item.link || source.url,
        source: source.name,
        sourcePriority: source.priority,
        sport,
        league: sport === "football" ? detectLeague(combined) : sport,
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

  // Per-sport caps to guarantee variety: arabic preferred, fallback fills gaps
  const bySport = (items, sport) => items.filter(i => i.sport === sport);
  const footballAr  = bySport(arabicItems, "football").slice(0, 12);
  const basketAr    = bySport(arabicItems, "basketball").slice(0, 6);
  const tennisAr    = bySport(arabicItems, "tennis").slice(0, 6);
  const padelAr     = bySport(arabicItems, "padel").slice(0, 5);
  const futsalAr    = bySport(arabicItems, "futsal").slice(0, 4);
  const footballFb  = bySport(fallbackItems, "football").slice(0, Math.max(0, 12 - footballAr.length));
  const basketFb    = bySport(fallbackItems, "basketball").slice(0, Math.max(0, 6 - basketAr.length));
  const tennisFb    = bySport(fallbackItems, "tennis").slice(0, Math.max(0, 6 - tennisAr.length));
  const padelFb     = bySport(fallbackItems, "padel").slice(0, Math.max(0, 5 - padelAr.length));
  const futsalFb    = bySport(fallbackItems, "futsal").slice(0, Math.max(0, 4 - futsalAr.length));
  const prioritized = [...footballAr, ...basketAr, ...tennisAr, ...padelAr, ...futsalAr,
                       ...footballFb, ...basketFb, ...tennisFb, ...padelFb, ...futsalFb];

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
