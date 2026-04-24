import articles from "../content/articles/seo-articles.json";

export default function sitemap() {
  const baseUrl = "https://nabdriyadah.com";

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}/`,
    lastModified: new Date()
  }));

  const leagueUrls = [
    { url: `${baseUrl}/league/premier-league/`, lastModified: new Date() },
    { url: `${baseUrl}/league/la-liga/`, lastModified: new Date() }
  ];

  const sportUrls = [
    { url: `${baseUrl}/sport/basketball/`, lastModified: new Date() },
    { url: `${baseUrl}/sport/tennis/`, lastModified: new Date() },
    { url: `${baseUrl}/sport/padel/`, lastModified: new Date() },
    { url: `${baseUrl}/sport/futsal/`, lastModified: new Date() }
  ];

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    ...leagueUrls,
    ...sportUrls,
    ...articleUrls
  ];
}
