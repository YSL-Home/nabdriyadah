import fs from "fs";
import path from "path";
import Parser from "rss-parser";

const parser = new Parser();
const OUTPUT_PATH = path.join(process.cwd(), "content/raw-news.json");

const SOURCES = [
  {
    name: "Btolat RSS",
    type: "rss",
    priority: "arabic",
    url: "https://www.btolat.com/rss/"
  },
  {
    name: "Kooora",
    type: "html",
    priority: "arabic",
    url: "https://www.kooora.com/"
  },
  {
    name: "Hesport",
    type: "html",
    priority: "arabic",
    url: "https://www.hesport.com/all"
  },
  {
    name: "Al Jazeera Sport",
    type: "html",
    priority: "arabic",
    url: "https://www.aljazeera.net/sport/"
  },
  {
    name: "Al Araby Sport",
    type: "html",
    priority: "arabic",
    url: "https://www.alaraby.co.uk/sport"
  },
  {
    name: "Elsport",
    type: "html",
    priority: "arabic",
    url: "https://www.elsport.com/"
  },
  {
    name: "BBC Sport",
    type: "rss",
    priority: "fallback",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml"
  }
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

function detectLeague(text = "") {
  const value = normalizeText(text);

  if (
    value.includes("الدوري الإنجليزي") ||
    value.includes("البريميرليغ") ||
    value.includes("مانشستر") ||
    value.includes("ليفربول") ||
    value.includes("تشيلسي") ||
    value.includes("آرسنال") ||
    value.includes("توتنهام") ||
    value.includes("نيوكاسل")
  ) {
    return "premier-league";
  }

  if (
    value.includes("الدوري الإسباني") ||
    value.includes("الليغا") ||
    value.includes("ريال مدريد") ||
    value.includes("برشلونة") ||
    value.includes("أتلتيكو") ||
    value.includes("فالنسيا")
  ) {
    return "la-liga";
  }

  return "mixed";
}

function looksLikeArabicSportsHeadline(text = "") {
  const value = normalizeText(text);
  if (!value) return false;
  if (value.length < 18 || value.length > 180) return false;

  const arabicCount = (value.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabicCount < 8) return false;

  const badWords = [
    "اتصل بنا",
    "سياسة الخصوصية",
    "شروط الاستخدام",
    "المزيد",
    "المزيد...",
    "فيديو",
    "فيديوهات",
    "تحميل",
    "إعلان",
    "اعلان",
    "تسجيل الدخول",
    "اشترك",
    "تابعنا",
    "الرئيسية"
  ];

  if (badWords.some((w) => value.includes(w))) return false;

  const sportsWords = [
    "ريال",
    "برشلونة",
    "مانشستر",
    "ليفربول",
    "تشيلسي",
    "آرسنال",
    "الدوري",
    "كأس",
    "مباراة",
    "المنتخب",
    "كرة",
    "هدف",
    "مدرب",
    "لاعب",
    "انتقال",
    "صفقة",
    "نادي"
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

    return (feed.items || []).slice(0, 15).map((item, index) => {
      const title = normalizeText(item.title || "");
      const description = normalizeText(
        item.contentSnippet || item.content || item.summary || item.description || ""
      );

      return {
        originalTitle: title,
        originalDescription: description,
        link: item.link || source.url,
        source: source.name,
        sourcePriority: source.priority,
        league: detectLeague(`${title} ${description}`),
        publishedAt: item.pubDate || new Date().toISOString(),
        slug: slugFromTitle(title, index)
      };
    });
  } catch (error) {
    console.log(`RSS failed for ${source.name}: ${error.message}`);
    return [];
  }
}

function extractFromHtml(html = "", baseUrl = "", sourceName = "", priority = "arabic") {
  const anchors = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const results = [];

  for (const match of anchors) {
    const href = match[1];
    const rawText = normalizeText(match[2]);

    if (!looksLikeArabicSportsHeadline(rawText)) continue;

    const link = absoluteUrl(baseUrl, href);
    if (!/^https?:\/\//.test(link)) continue;

    results.push({
      originalTitle: rawText,
      originalDescription: `${rawText} - متابعة أولية من ${sourceName}`,
      link,
      source: sourceName,
      sourcePriority: priority,
      league: detectLeague(rawText),
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
    if (unique.length >= 15) break;
  }

  return unique;
}

async function fetchHtml(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();
    return extractFromHtml(html, source.url, source.name, source.priority);
  } catch (error) {
    console.log(`HTML failed for ${source.name}: ${error.message}`);
    return [];
  }
}

async function main() {
  const collected = [];

  for (const source of SOURCES) {
    const items =
      source.type === "rss" ? await fetchRss(source) : await fetchHtml(source);

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

  const prioritized = [
    ...arabicItems.slice(0, 18),
    ...fallbackItems.slice(0, 2)
  ];

  ensureDir(OUTPUT_PATH);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(prioritized, null, 2), "utf-8");
  console.log(`raw news saved: ${prioritized.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
