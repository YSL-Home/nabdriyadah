import fs from "fs";

const raw = JSON.parse(
  fs.readFileSync("content/articles/raw-news.json")
);

const seoArticles = raw.map((item) => ({
  title: item.title + " | آخر الأخبار الرياضية",
  description: item.content.slice(0, 100),
  content: item.content + " تابع المزيد من الأخبار الرياضية الحصرية.",
  keywords: ["أخبار رياضية", "كرة القدم", "الدوري السعودي"]
}));

fs.writeFileSync(
  "content/articles/seo-articles.json",
  JSON.stringify(seoArticles, null, 2)
);

console.log("SEO articles generated ✅");
