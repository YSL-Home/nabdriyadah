import articles from "../content/articles/seo-articles.json";

const BASE = "https://nabdriyadah.com";

export default function sitemap() {
  const now = new Date();

  // ── Page d'accueil ────────────────────────────────────────────────────────
  const home = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
  ];

  // ── Pages sports ──────────────────────────────────────────────────────────
  const sportUrls = [
    { slug: "football",   priority: 0.85 },
    { slug: "basketball", priority: 0.80 },
    { slug: "tennis",     priority: 0.80 },
    { slug: "padel",      priority: 0.75 },
    { slug: "futsal",     priority: 0.70 },
  ].map(({ slug, priority }) => ({
    url: `${BASE}/sport/${slug}/`,
    lastModified: now,
    changeFrequency: "daily",
    priority,
  }));

  // ── Pages ligues ──────────────────────────────────────────────────────────
  const leagueUrls = [
    { slug: "premier-league",     priority: 0.85 },
    { slug: "la-liga",            priority: 0.85 },
    { slug: "champions-league",   priority: 0.85 },
    { slug: "bundesliga",         priority: 0.80 },
    { slug: "serie-a",            priority: 0.80 },
    { slug: "ligue-1",            priority: 0.80 },
    { slug: "saudi-pro-league",   priority: 0.78 },
    { slug: "eredivisie",         priority: 0.70 },
    { slug: "world-cup",          priority: 0.80 },
    { slug: "euro",               priority: 0.78 },
    { slug: "afcon",              priority: 0.75 },
    { slug: "caf-champions-league", priority: 0.72 },
    { slug: "club-world-cup",     priority: 0.75 },
  ].map(({ slug, priority }) => ({
    url: `${BASE}/league/${slug}/`,
    lastModified: now,
    changeFrequency: "daily",
    priority,
  }));

  // ── Pages articles ────────────────────────────────────────────────────────
  const articleUrls = articles.map((article) => ({
    url: `${BASE}/articles/${article.slug}/`,
    lastModified: article.publishedAt ? new Date(article.publishedAt) : now,
    changeFrequency: "monthly",
    priority: article.sport === "football" ? 0.72 : 0.65,
  }));

  return [...home, ...sportUrls, ...leagueUrls, ...articleUrls];
}
