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

  return [
    `يشهد ${league} في الفترة الحالية متابعة جماهيرية كبيرة، مع اهتمام واسع بكل التطورات المرتبطة بالأندية والنجوم والمباريات المهمة داخل البطولة.`,
    `وفي هذا السياق، تواصل منصة نبض الرياضة متابعة أبرز المستجدات القادمة من ${source} ضمن تغطية عربية مبسطة تهدف إلى تقديم ملخص واضح وسريع للقارئ العربي دون تعقيد.`,
    `وتشير الأجواء العامة المحيطة بالمنافسة إلى وجود حراك متواصل على مستوى التحضيرات الفنية، والتركيز الذهني، وإدارة المباريات، وهو ما ينعكس بشكل مباشر على شكل الصراع داخل ${league}.`,
    `كما تبدو الفرق الكبرى حريصة على الحفاظ على الاستقرار الفني وتحقيق أفضل النتائج الممكنة، خصوصًا مع ضغط المباريات واحتدام المنافسة على المراكز المتقدمة في جدول الترتيب.`,
    `وتزداد أهمية هذه المرحلة مع ارتفاع سقف التوقعات الجماهيرية والإعلامية، حيث تبحث الأندية عن تعزيز حضورها وتأكيد جاهزيتها للمواجهات المقبلة في مختلف المسابقات.`,
    `ومن المنتظر أن تشهد الأيام القادمة مزيدًا من التفاصيل والقرارات المهمة التي قد تؤثر على مسار المنافسة، سواء من ناحية الأداء أو الخيارات الفنية أو حسابات الترتيب.`,
    `في نبض الرياضة، نواصل تقديم تغطية عربية مركزة لأهم أخبار ${league}، مع الحرص على إبقاء القارئ على اطلاع دائم بكل جديد في المشهد الكروي.`
  ].join("\n\n");
}

function buildKeywords(item) {
  const league = leagueName(item.league);
  return [league, "أخبار رياضية", "كرة القدم", "نتائج المباريات", "تحليلات رياضية"];
}

function buildImageUrl(item, index) {
  const fallbackImages = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80"
  ];

  return fallbackImages[index % fallbackImages.length];
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
      image:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      content:
        "حقق ريال مدريد فوزًا مهمًا في مباراة قوية ضمن منافسات الدوري.\n\nشهدت المواجهة أداءً مميزًا من الفريق وتفاعلاً كبيرًا من الجماهير.\n\nويأمل الفريق في مواصلة نتائجه الإيجابية خلال المباريات المقبلة."
    },
    {
      title: "برشلونة يستعد لمواجهة قوية",
      description: "يستعد فريق برشلونة لمباراة حاسمة هذا الأسبوع.",
      slug: "barcelona-match",
      keywords: ["برشلونة", "مباراة", "كرة القدم"],
      image:
        "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
      content:
        "يستعد فريق برشلونة لمباراة حاسمة هذا الأسبوع وسط متابعة جماهيرية واسعة.\n\nويركز الجهاز الفني على رفع الجاهزية الفنية والبدنية.\n\nويأمل الفريق في تحقيق نتيجة إيجابية تعزز موقعه في المنافسة."
    }
  ];
}

function main() {
  const rawItems = readJson(RAW_PATH, []);
  let articles = [];

  if (rawItems.length > 0) {
    articles = rawItems.slice(0, 10).map((item, index) => ({
      title: buildArabicTitle(item, index),
      description: buildArabicDescription(item),
      slug:
        index === 0
          ? "real-madrid-win"
          : index === 1
          ? "barcelona-match"
          : `article-${index + 1}`,
      keywords: buildKeywords(item),
      image: buildImageUrl(item, index),
      content: buildArabicContent(item)
    }));
  } else {
    articles = buildFallbackArticles();
  }

  ensureDir(SEO_PATH);
  fs.writeFileSync(SEO_PATH, JSON.stringify(articles, null, 2), "utf-8");
  console.log(`seo articles saved: ${articles.length}`);
}

main();
