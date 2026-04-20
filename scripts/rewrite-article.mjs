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
    `يشهد ${league} خلال الفترة الحالية متابعة جماهيرية كبيرة، مع اهتمام متزايد بكل التفاصيل المرتبطة بالأندية والنجوم والمباريات الحاسمة.`,
    `وفي هذا السياق، تتابع منصة نبض الرياضة أبرز المستجدات الواردة من ${source} ضمن تغطية عربية مبسطة تهدف إلى تقديم صورة واضحة وسريعة للقارئ العربي.`,
    `وتشير الأجواء العامة المحيطة بالمنافسة إلى وجود حراك متواصل على مستوى التحضيرات الفنية وإدارة المباريات والجاهزية الذهنية، وهو ما ينعكس بشكل مباشر على شكل الصراع داخل ${league}.`,
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
  const premierLeagueImages = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80"
  ];

  const laLigaImages = [
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80"
  ];

  const genericImages = [
    "https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=1200&q=80"
  ];

  if (item.league === "premier-league") {
    return premierLeagueImages[index % premierLeagueImages.length];
  }

  if (item.league === "la-liga") {
    return laLigaImages[index % laLigaImages.length];
  }

  return genericImages[index % genericImages.length];
}

function buildSlug(index) {
  if (index === 0) return "real-madrid-win";
  if (index === 1) return "barcelona-match";
  return `article-${index + 1}`;
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
      seoTitle: "فوز ريال مدريد في مباراة مثيرة | نبض الرياضة",
      seoDescription: "تعرف على تفاصيل فوز ريال مدريد وأبرز ما حدث في المباراة ضمن تغطية عربية رياضية محدثة.",
      slug: "real-madrid-win",
      keywords: ["ريال مدريد", "الدوري", "كرة القدم"],
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      content:
        "حقق ريال مدريد فوزًا مهمًا في مباراة قوية ضمن منافسات الدوري.\n\nشهدت المواجهة أداءً مميزًا من الفريق وتفاعلاً كبيرًا من الجماهير.\n\nويأمل الفريق في مواصلة نتائجه الإيجابية خلال المباريات المقبلة."
    },
    {
      title: "برشلونة يستعد لمواجهة قوية",
      description: "يستعد فريق برشلونة لمباراة حاسمة هذا الأسبوع.",
      seoTitle: "برشلونة يستعد لمواجهة قوية | نبض الرياضة",
      seoDescription: "آخر أخبار برشلونة والتحضيرات الخاصة بالمواجهة المقبلة ضمن تغطية رياضية عربية محدثة.",
      slug: "barcelona-match",
      keywords: ["برشلونة", "مباراة", "كرة القدم"],
      image: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
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
      const title = buildArabicTitle(item, index);
      const description = buildArabicDescription(item);

      return {
        title,
        description,
        seoTitle: `${title} | نبض الرياضة`,
        seoDescription: description,
        slug: buildSlug(index),
        keywords: buildKeywords(item),
        image: buildImageUrl(item, index),
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
