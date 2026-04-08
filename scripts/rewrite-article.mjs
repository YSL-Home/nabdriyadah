import fs from "fs";

const raw = JSON.parse(
  fs.readFileSync("content/articles/raw-news.json", "utf-8")
);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const seoArticles = raw.map((item, index) => {
  const title = item.title || `Article ${index + 1}`;
  const content = item.content || item.summary || "Contenu sportif généré automatiquement.";
  const description = content.slice(0, 140);
  const slug = slugify(title) || `article-${index + 1}`;

  return {
    slug,
    title: `${title} | آخر الأخبار الرياضية`,
    description,
    content: `${content} تابع المزيد من الأخبار الرياضية الحصرية على نبض الرياضة.`,
    keywords: ["أخبار رياضية", "كرة القدم", "الدوري السعودي"],
    publishedAt: new Date().toISOString()
  };
});

fs.writeFileSync(
  "content/articles/seo-articles.json",
  JSON.stringify(seoArticles, null, 2)
);

console.log("SEO articles generated ✅");
