import articles from "../content/articles/seo-articles.json";

export default function sitemap() {
  const baseUrl = "https://nabdriyadah.com";

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}/`,
    lastModified: new Date()
  }));

  const leagueUrls = [
    "premier-league", "la-liga", "bundesliga", "serie-a",
    "ligue-1", "champions-league", "saudi-pro-league", "eredivisie"
  ].map((slug) => ({ url: `${baseUrl}/league/${slug}/`, lastModified: new Date() }));

  const sportUrls = [
    "football", "basketball", "tennis", "padel", "futsal"
  ].map((slug) => ({ url: `${baseUrl}/sport/${slug}/`, lastModified: new Date() }));

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    ...sportUrls,
    ...leagueUrls,
    ...articleUrls
  ];
}
