/**
 * Generates seo-articles-meta.json from seo-articles.json.
 * Strips heavy fields (content, faq, en_content, fr_content) to keep the
 * bundle chunk under the Cloudflare Pages 25 MiB per-file limit.
 * Run before `next build` via the prebuild script.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const META_FIELDS = [
  "slug", "title", "seoTitle", "description", "seoDescription",
  "sourceTitle", "publishedAt", "updatedAt", "imageUrl", "image",
  "league", "sport", "keywords",
  "en_title", "fr_title", "en_description", "fr_description",
];

const full = JSON.parse(readFileSync(join(ROOT, "content/articles/seo-articles.json"), "utf8"));
const meta = full.map(a => Object.fromEntries(META_FIELDS.filter(k => a[k] !== undefined).map(k => [k, a[k]])));

writeFileSync(join(ROOT, "content/articles/seo-articles-meta.json"), JSON.stringify(meta));

const sizeMB = (Buffer.byteLength(JSON.stringify(meta)) / 1024 / 1024).toFixed(2);
console.log(`✓ seo-articles-meta.json — ${meta.length} articles, ${sizeMB} MB`);
