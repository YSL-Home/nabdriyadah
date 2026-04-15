import articles from "../content/articles/seo-articles.json";

export default function sitemap() {
  const baseUrl = "https://nabdriyadah.com";

  const articleUrls = articles.map((_, index) => ({
    url: `${baseUrl}/articles/article-${index + 1}/`,
    lastModified: new Date()
  }));

  const leagueUrls = [
    {
      url: `${baseUrl}/league/premier-league/`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/league/la-liga/`,
      lastModified: new Date()
    }
  ];

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date()
    },
    ...articleUrls,
    ...leagueUrls
  ];
}
