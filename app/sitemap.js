import articles from "../content/articles/seo-articles.json";

const BASE = "https://nabdriyadah.com";

const LEAGUES = [
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
  { slug: "botola",             priority: 0.74 },
  { slug: "botola-ma",          priority: 0.74 },
  { slug: "ligue-pro-dz",       priority: 0.73 },
  { slug: "prem-egy",           priority: 0.73 },
  { slug: "ligue-pro-tn",       priority: 0.72 },
  { slug: "liga-portugal",      priority: 0.70 },
  { slug: "mls",                priority: 0.68 },
  { slug: "nba",                priority: 0.82 },
  { slug: "atp",                priority: 0.80 },
  { slug: "wta",                priority: 0.78 },
  { slug: "padel-premier",      priority: 0.72 },
  { slug: "futsal-monde",       priority: 0.68 },
  { slug: "f1",                 priority: 0.80 },
  { slug: "pga-tour",           priority: 0.72 },
];

const SPORTS = [
  { slug: "football",   priority: 0.85 },
  { slug: "basketball", priority: 0.80 },
  { slug: "tennis",     priority: 0.80 },
  { slug: "padel",      priority: 0.75 },
  { slug: "futsal",     priority: 0.70 },
  { slug: "f1",         priority: 0.80 },
  { slug: "golf",       priority: 0.72 },
];

export default function sitemap() {
  const now = new Date();

  // ── Accueil (3 langues) ───────────────────────────────────────────────────
  const home = [
    { url: `${BASE}/`,     lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE}/fr/`,  lastModified: now, changeFrequency: "hourly", priority: 0.90 },
    { url: `${BASE}/en/`,  lastModified: now, changeFrequency: "hourly", priority: 0.90 },
    { url: `${BASE}/videos/`, lastModified: now, changeFrequency: "daily", priority: 0.80 },
  ];

  // ── Sports (3 langues) ───────────────────────────────────────────────────
  const sportUrls = SPORTS.flatMap(({ slug, priority }) => [
    { url: `${BASE}/sport/${slug}/`,     lastModified: now, changeFrequency: "daily", priority },
    { url: `${BASE}/fr/sport/${slug}/`,  lastModified: now, changeFrequency: "daily", priority: priority - 0.05 },
    { url: `${BASE}/en/sport/${slug}/`,  lastModified: now, changeFrequency: "daily", priority: priority - 0.05 },
  ]);

  // ── Ligues (3 langues) ───────────────────────────────────────────────────
  const leagueUrls = LEAGUES.flatMap(({ slug, priority }) => [
    { url: `${BASE}/league/${slug}/`,     lastModified: now, changeFrequency: "daily", priority },
    { url: `${BASE}/fr/league/${slug}/`,  lastModified: now, changeFrequency: "daily", priority: priority - 0.05 },
    { url: `${BASE}/en/league/${slug}/`,  lastModified: now, changeFrequency: "daily", priority: priority - 0.05 },
  ]);

  // ── Articles (3 langues) ─────────────────────────────────────────────────
  const articleUrls = articles.flatMap((article) => {
    const lastMod = article.publishedAt ? new Date(article.publishedAt) : now;
    const basePriority = article.sport === "football" ? 0.72 : 0.65;
    const urls = [
      { url: `${BASE}/articles/${article.slug}/`, lastModified: lastMod, changeFrequency: "monthly", priority: basePriority },
    ];
    if (article.fr_title) {
      urls.push({ url: `${BASE}/fr/articles/${article.slug}/`, lastModified: lastMod, changeFrequency: "monthly", priority: basePriority - 0.05 });
    }
    if (article.en_title) {
      urls.push({ url: `${BASE}/en/articles/${article.slug}/`, lastModified: lastMod, changeFrequency: "monthly", priority: basePriority - 0.05 });
    }
    return urls;
  });

  return [...home, ...sportUrls, ...leagueUrls, ...articleUrls];
}
