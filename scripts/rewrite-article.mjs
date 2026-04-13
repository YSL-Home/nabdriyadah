const fs = require("fs");
const path = require("path");

const RAW_NEWS_PATH = path.join(process.cwd(), "data", "raw-news.json");
const SEO_ARTICLES_PATH = path.join(process.cwd(), "data", "seo-articles.json");

function slugifyArabic(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[A-Za-z]/g, "")
    .replace(/[^\u0600-\u06FF0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function containsArabic(text = "") {
  return /[\u0600-\u06FF]/.test(text);
}

function isMostlyArabic(text = "") {
  if (!text) return false;

  const cleaned = text.replace(/\s/g, "");
  if (!cleaned.length) return false;

  const arabicCount = (cleaned.match(/[\u0600-\u06FF]/g) || []).length;
  return arabicCount / cleaned.length >= 0.45;
}

function removeEnglishLetters(text = "") {
  return text
    .replace(/[A-Za-z]/g, "")
    .replace(/\s+/g, " ")
    .replace(/Read more/gi, "")
    .replace(/Breaking/gi, "")
    .replace(/Trending/gi, "")
    .replace(/Latest/gi, "")
    .replace(/Analysis/gi, "")
    .trim();
}

function cleanArabicText(text = "") {
  return removeEnglishLetters(text)
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function validateArabicArticle(article) {
  if (!article) return false;

  const title = article.title || "";
  const description = article.description || "";
  const content = article.content || "";

  if (!containsArabic(title)) return false;
  if (!containsArabic(description)) return false;
  if (!containsArabic(content)) return false;

  if (!isMostlyArabic(title)) return false;
  if (!isMostlyArabic(description)) return false;
  if (!isMostlyArabic(content)) return false;

  return true;
}

function extractText(item) {
  return cleanArabicText(
    item.content ||
      item.description ||
      item.summary ||
      item.body ||
      item.title ||
      ""
  );
}

function splitIntoParagraphs(text = "") {
  return text
    .split(/[.!؟\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function generateLocalArabicFallback(newsItem) {
  const sourceTitle = cleanArabicText(newsItem.title || "خبر رياضي جديد");
  const sourceText = extractText(newsItem);

  const paragraphs = splitIntoParagraphs(sourceText);
  const intro =
    paragraphs[0] ||
    "تشهد الساحة الرياضية تطورات جديدة تهم الجماهير العربية وعشاق كرة القدم في مختلف البطولات.";
  const detail1 =
    paragraphs[1] ||
    "وتأتي هذه المستجدات في وقت يتزايد فيه الاهتمام بمتابعة الأخبار الرياضية اليومية وتحليل انعكاساتها على الأندية واللاعبين.";
  const detail2 =
    paragraphs[2] ||
    "ومن المنتظر أن تتضح الصورة بشكل أكبر خلال الساعات المقبلة مع صدور تفاصيل إضافية وردود فعل من الأطراف المعنية.";
  const closing =
    "ويبقى هذا الملف مفتوحاً على احتمالات عديدة، في انتظار ما ستسفر عنه التطورات القادمة على الساحة الرياضية.";

  const title = sourceTitle;
  const description = cleanArabicText(
    `تفاصيل جديدة حول ${sourceTitle} مع متابعة لأبرز التطورات والانعكاسات المحتملة على المشهد الرياضي.`
  );

  const content = [
    intro,
    detail1,
    detail2,
    closing,
  ]
    .map(cleanArabicText)
    .join("\n\n");

  const keywords = [
    "أخبار الرياضة",
    "كرة القدم",
    "أخبار عاجلة",
    cleanArabicText(sourceTitle),
  ].filter(Boolean);

  return {
    slug: slugifyArabic(title) || `خبر-${Date.now()}`,
    title,
    description,
    content,
    keywords,
    category: "football",
    publishedAt: new Date().toISOString(),
  };
}

async function rewriteWithOpenAI(newsItem) {
  return null;
}

async function rewriteWithClaude(newsItem) {
  return null;
}

async function buildArticle(newsItem) {
  let article = null;

  try {
    article = await rewriteWithOpenAI(newsItem);
  } catch (error) {
    console.error("OpenAI failed:", error.message);
  }

  if (!article) {
    try {
      article = await rewriteWithClaude(newsItem);
    } catch (error) {
      console.error("Claude failed:", error.message);
    }
  }

  if (!article) {
    article = generateLocalArabicFallback(newsItem);
  }

  article = {
    ...article,
    title: cleanArabicText(article.title || ""),
    description: cleanArabicText(article.description || ""),
    content: cleanArabicText(article.content || ""),
    keywords: Array.isArray(article.keywords)
      ? article.keywords.map((keyword) => cleanArabicText(keyword)).filter(Boolean)
      : [],
    category: article.category || "football",
    publishedAt: article.publishedAt || new Date().toISOString(),
  };

  if (!article.slug || !containsArabic(article.slug.replace(/-/g, " "))) {
    article.slug = slugifyArabic(article.title) || `خبر-${Date.now()}`;
  }

  if (!validateArabicArticle(article)) {
    console.log("❌ Article rejeté car non arabe, fallback local activé");
    article = generateLocalArabicFallback(newsItem);
  }

  return article;
}

async function main() {
  if (!fs.existsSync(RAW_NEWS_PATH)) {
    console.error("❌ Fichier raw-news.json introuvable");
    process.exit(1);
  }

  const raw = fs.readFileSync(RAW_NEWS_PATH, "utf-8");
  const rawNews = JSON.parse(raw);

  if (!Array.isArray(rawNews)) {
    console.error("❌ raw-news.json doit être un tableau");
    process.exit(1);
  }

  const seoArticles = [];

  for (const newsItem of rawNews) {
    try {
      const article = await buildArticle(newsItem);
      if (validateArabicArticle(article)) {
        seoArticles.push(article);
      } else {
        console.log("❌ Article ignoré après validation finale");
      }
    } catch (error) {
      console.error("❌ Erreur génération article:", error.message);
    }
  }

  fs.writeFileSync(
    SEO_ARTICLES_PATH,
    JSON.stringify(seoArticles, null, 2),
    "utf-8"
  );

  console.log(`✅ ${seoArticles.length} articles arabes enregistrés dans seo-articles.json`);
}

main();
