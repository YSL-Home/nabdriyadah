import fs from "fs";
import path from "path";

const RAW_PATH = path.join(process.cwd(), "content/raw-news.json");
const SEO_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function leagueName(slug = "") {
  if (slug === "premier-league") return "الدوري الإنجليزي الممتاز";
  if (slug === "la-liga") return "الدوري الإسباني";
  return "كرة القدم الأوروبية";
}

function sourceArabic(source = "") {
  if (source.includes("BBC")) return "بي بي سي سبورت";
  if (source.includes("Sky")) return "سكاي سبورت";
  return "المصدر الرياضي";
}

function buildArabicTitle(item, index) {
  const league = leagueName(item.league);
  const patterns = [
    `آخر أخبار ${league}`,
    `مستجدات ${league}`,
    `أهم ما يحدث في ${league}`,
    `تحليل أخبار ${league}`
  ];
  return `${patterns[index % patterns.length]} ${index + 1}`;
}

function buildArabicDescription(item) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);

  return `نستعرض في هذا التقرير آخر المستجدات المرتبطة بـ ${league} مع متابعة لأبرز الأخبار المتداولة عبر ${source}، في تغطية عربية مختصرة وسريعة لأهم ما يهم الجماهير.`;
}

function buildArabicContent(item) {
  const league = leagueName(item.league);
  const source = sourceArabic(item.source);
  const originalTitle = normalizeText(item.originalTitle);
  const originalDescription = normalizeText(item.originalDescription);

  return [
    `يشهد ${league} متابعة جماهيرية كبيرة خلال الفترة الحالية، مع اهتمام متزايد بكل التفاصيل المرتبطة بالأندية والنجوم والمباريات الحاسمة.`,
    `وفي هذا السياق، تتابع منصة نبض الرياضة أبرز المستجدات الواردة من ${source} ضمن تغطية عربية مبسطة تهدف إلى تقديم صورة واضحة وسريعة للقارئ العربي.`,
    originalTitle
      ? `ويتناول الخبر الأصلي عنوانًا بارزًا يتمحور حول: ${originalTitle}.`
      : `ويتناول الخبر الأصلي تطورات جديدة لافتة داخل المشهد الكروي المرتبط بهذه البطولة.`,
    originalDescription
      ? `كما تشير المعطيات المتاحة إلى أن أبرز التفاصيل المتداولة حاليًا تتمثل في الآتي: ${originalDescription}.`
      : `وتشير المتابعات إلى وجود تطورات جديدة قد يكون لها تأثير مباشر على شكل المنافسة خلال المرحلة المقبلة.`,
    `وتحاول الفرق الكبرى في ${league} الحفاظ على الاستقرار الفني وتحقيق أفضل النتائج الممكنة، خصوصًا مع ضغط المباريات واحتدام الصراع على المراكز المتقدمة.`,
    `ومن المنتظر أن تشهد الأيام المقبلة مزيدًا من الأخبار والقرارات المهمة، وهو ما يمنح الجماهير مساحة واسعة للمتابعة والتحليل والترقب.`,
    `في نبض الرياضة، نواصل تقديم تغطية عربية مركزة لأهم أخبار ${league}، مع الحرص على إبقاء القارئ على اطلاع دائم بكل جديد.`
  ].join("\n\n");
}

function buildKeywords(item) {
  const league = leagueName(item.league);
  return [league, "أخبار رياضية", "كرة القدم", "نتائج المباريات", "تحليلات رياضية"];
}

function slugifySafe(text = "", index = 1) {
  const latin = String(text)
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return latin || `article-${index}`;
}

function readJson(filePath, fallback = []) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function buildFallbackArticles() {
  return [
    {
      title: "فوز ريال مدريد في مباراة مثيرة",
      description: "حقق ريال مدريد فوزًا مهمًا في مباراة قوية ضمن منافسات الدوري.",
      slug: "real-madrid-win",
      keywords: ["ريال مدريد", "الدوري", "كرة القدم"],
      content:
        "حقق ريال مدريد فوزًا مهمًا في مباراة قوية ضمن منافسات الدوري.\n\nشهدت المواجهة أداءً مميزًا من الفريق وتفاعلاً كبيرًا من الجماهير.\n\nويأمل الفريق في مواصلة نتائجه الإيجابية خلال المباريات المقبلة."
    },
    {
      title: "برشلونة يستعد لمواجهة قوية",
      description: "يستعد فريق برشلونة لمباراة حاسمة هذا الأسبوع.",
      slug: "barcelona-match",
      keywords: ["برشلونة", "مباراة", "كرة القدم"],
      content:
        "يستعد فريق برشلونة لمباراة حاسمة هذا الأسبوع وسط متابعة جماهيرية واسعة.\n\nويركز الجهاز الفني على رفع الجاهزية الفنية والبدنية.\n\nويأمل الفريق في تحقيق نتيجة إيجابية تعزز موقعه في المنافسة."
    }
  ];
}

function main() {
  const rawItems = readJson(RAW_PATH, []);
  let articles = [];

  if (rawItems.length > 0) {
    articles = rawItems.slice(0, 10).map((item, index) => {
      const safeBase =
        normalizeText(item.originalTitle) ||
        normalizeText(item.originalDescription) ||
        `article-${index + 1}`;

      return {
        title: buildArabicTitle(item, index),
        description: buildArabicDescription(item),
        slug: slugifySafe(safeBase, index + 1),
        keywords: buildKeywords(item),
        content: buildArabicContent(item)
      };
    });
  } else {
    articles = buildFallbackArticles();
  }

  ensureDir(SEO_PATH);
  fs.writeFileSync(SEO_PATH, JSON.stringify(articles, null, 2), "utf-8");
  console.log(`seo articles saved: ${articles.length}`);
}

main();
