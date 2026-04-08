import fs from "fs";

const raw = JSON.parse(
  fs.readFileSync("content/articles/raw-news.json", "utf-8")
);

const seoArticles = raw.map((item, index) => {
  const title = item.title || `Article ${index + 1}`;
  const content = item.content || item.summary || "Contenu sportif généré automatiquement.";
  const description = content.slice(0, 100);

  return {
    slug: title
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-"),
    title: `${title} | آخر الأخبار الرياضية`,
    description,
    content: `${content} تابع المزيد من الأخبار الرياضية الحصرية على نبض الرياضة.`,
    keywords: ["أخبار رياضية", "كرة القدم", "الدوري السعودي"]
  };
});

fs.writeFileSync(
  "content/articles/seo-articles.json",
  JSON.stringify(seoArticles, null, 2)
);

console.log("SEO articles generated ✅");
