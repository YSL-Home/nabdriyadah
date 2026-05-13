/**
 * generate-sitemap-news.mjs
 * Génère public/sitemap-news.xml (Google News Sitemap) à partir des articles
 * publiés dans les dernières 48h. Exécuté à chaque full-refresh.
 *
 * Google News Sitemap spec:
 *  - Max 1000 articles
 *  - Articles des 2 derniers jours uniquement
 *  - <news:publication_date> en format ISO 8601
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.join(__dirname, "..");
const ARTICLES    = path.join(ROOT, "content", "articles", "seo-articles.json");
const OUT         = path.join(ROOT, "public", "sitemap-news.xml");
const BASE        = "https://nabdriyadah.com";
const WINDOW_MS   = 48 * 60 * 60 * 1000;

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const articles = JSON.parse(fs.readFileSync(ARTICLES, "utf-8"));
const cutoff   = Date.now() - WINDOW_MS;

const recent = articles
  .filter(a => a.slug && a.title && new Date(a.publishedAt || 0).getTime() > cutoff)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  .slice(0, 1000);

const items = recent.map(a => {
  const pubDate = new Date(a.publishedAt).toISOString();
  return `  <url>
    <loc>${BASE}/articles/${a.slug}/</loc>
    <news:news>
      <news:publication>
        <news:name>نبض الرياضة</news:name>
        <news:language>ar</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
      <news:keywords>${esc([a.sport, a.league, "رياضة", "كرة القدم"].filter(Boolean).join(", "))}</news:keywords>
    </news:news>
  </url>`;
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>
`;

fs.writeFileSync(OUT, xml, "utf-8");
console.log(`✅ sitemap-news.xml: ${recent.length} articles (dernières 48h)`);
