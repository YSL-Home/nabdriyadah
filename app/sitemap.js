import fs from "fs";
import path from "path";

function getArticles() {
  try {
    const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
    const file = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(file);
  } catch (error) {
    return [];
  }
}

function slugifyLeague(source = "") {
  return String(source).toLowerCase().replace(/\s+/g, "-");
}

export default function sitemap() {
  const baseUrl = "https://nabdriyadah.com";
  const articles = getArticles();

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.publishedAt || new Date().toISOString(),
  }));

  const leagueUrls = [...new Set(articles.map((article) => slugifyLeague(article.source)))]
    .filter(Boolean)
    .map((slug) => ({
      url: `${baseUrl}/league/${slug}`,
      lastModified: new Date().toISOString(),
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
    },
    ...leagueUrls,
    ...articleUrls,
  ];
}
