/**
 * build-videos-index.mjs
 * Génère content/cartoon-videos-index.json à partir des vidéos présentes dans public/generated/cartoons/
 * Appelé automatiquement après chaque génération de vidéo cartoon.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, "..");
const CARTOONS   = path.join(ROOT, "public", "generated", "cartoons");
const ARTICLES   = path.join(ROOT, "content", "articles", "seo-articles.json");
const INDEX_OUT  = path.join(ROOT, "content", "cartoon-videos-index.json");

if (!fs.existsSync(CARTOONS)) { fs.mkdirSync(CARTOONS, { recursive: true }); }

const articles  = JSON.parse(fs.readFileSync(ARTICLES, "utf-8"));
const articleMap = Object.fromEntries(articles.map((a) => [a.slug, a]));

const files = fs.readdirSync(CARTOONS);
const videos = files
  .filter((f) => f.endsWith("_final.mp4") || (f.startsWith("demo_") && f.endsWith(".mp4")))
  .map((f) => {
    const isDemo = f.startsWith("demo_");
    const slug   = f.replace("_final.mp4", "").replace("demo_", "").replace(".mp4", "");
    const art    = articleMap[slug];
    if (!art) return null;

    const thumbFile  = `${slug}.png`;
    const thumbDemo  = `demo_${slug}.png`;
    const thumbPath  = fs.existsSync(path.join(CARTOONS, thumbFile)) ? `/generated/cartoons/${thumbFile}`
                     : fs.existsSync(path.join(CARTOONS, thumbDemo)) ? `/generated/cartoons/${thumbDemo}`
                     : art.image || null;

    return {
      slug,
      videoPath:   `/generated/cartoons/${f}`,
      thumb:       thumbPath,
      title:       art.title,
      description: art.description,
      sport:       art.sport,
      publishedAt: art.publishedAt,
      isDemo,
    };
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

fs.writeFileSync(INDEX_OUT, JSON.stringify(videos, null, 2));
console.log(`✅ cartoon-videos-index.json: ${videos.length} vidéos indexées`);
