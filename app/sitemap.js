import fs from "fs";
import path from "path";

export default function sitemap() {
  const baseUrl = "https://nabdriyadah.com";

  const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
  const articles = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const articleUrls = articles.map((a) => ({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified: new Date(a.publishedAt),
  }));

  const leagueUrls = [
    "premier-league",
    "la-liga",
    "serie-a",
    "bundesliga",
    "ligue-1",
    "champions-league",
    "saudi-pro-league",
  ].map((slug) => ({
    url: `${baseUrl}/league/${slug}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...articleUrls,
    ...leagueUrls,
  ];
}
