import fs from "fs";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

function arabicLeagueName(source = "") {
  const s = source.toLowerCase();

  if (s.includes("premier")) return "الدوري الإنجليزي الممتاز";
  if (s.includes("la liga")) return "الدوري الإسباني";
  if (s.includes("serie a")) return "الدوري الإيطالي";
  if (s.includes("bundesliga")) return "الدوري الألماني";
  if (s.includes("ligue 1")) return "الدوري الفرنسي";
  if (s.includes("champions")) return "دوري أبطال أوروبا";
  if (s.includes("saudi")) return "الدوري السعودي";

  return "كرة القدم";
}

function buildArticle(item, index) {
  const league = arabicLeagueName(item.source);

  const shortTitle = `آخر أخبار ${league}`;
  const title = `🔥 ${shortTitle} - التفاصيل الكاملة والتحديثات`;

  return {
    slug: slugify(shortTitle) || `article-${index + 1}`,
    title,
    shortTitle,
    description: `تعرف على آخر أخبار ${league} وتحليل المباريات والنتائج بشكل يومي عبر نبض الرياضة.`,
    content: [
      `تشهد أخبار ${league} متابعة كبيرة من الجماهير الرياضية في مختلف أنحاء العالم العربي.`,
      `في هذا التقرير نقدم تغطية شاملة لأهم الأحداث والتطورات المرتبطة بالبطولة.`,
      `نركز على تقديم محتوى واضح وسريع يساعد القارئ على فهم أهم المستجدات.`,
      `كما نعرض تحليلاً مبسطاً لأبرز النتائج وتأثيرها على ترتيب الفرق.`,
      `تابع نبض الرياضة للحصول على أحدث الأخبار الرياضية بشكل مستمر.`
    ],
    faq: [
      {
        q: `ما أهم أخبار ${league} اليوم؟`,
        a: `نستعرض في هذا المقال أهم المستجدات والنتائج المرتبطة بالبطولة.`
      },
      {
        q: `هل يتم تحديث الأخبار باستمرار؟`,
        a: `نعم، يتم تحديث المقالات بشكل دوري حسب آخر الأخبار المتوفرة.`
      }
    ],
    keywords: ["أخبار رياضية", league, "كرة القدم", "نتائج المباريات"],
    source: item.source,
    originalTitle: item.title,
    link: item.link,
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

async function main() {
  const raw = JSON.parse(
    fs.readFileSync("content/articles/raw-news.json", "utf-8")
  );

  const results = raw.slice(0, 8).map((item, i) => buildArticle(item, i));

  fs.writeFileSync(
    "content/articles/seo-articles.json",
    JSON.stringify(results, null, 2)
  );

  console.log("🔥 ARABIC ARTICLES GENERATED:", results.length);
}

main();
