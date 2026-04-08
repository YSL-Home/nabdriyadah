import fs from "fs";
import Parser from "rss-parser";

const parser = new Parser();
const sources = JSON.parse(fs.readFileSync("data/sources.json", "utf-8"));

async function main() {
  const allItems = [];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of (feed.items || []).slice(0, 5)) {
        allItems.push({
          source: source.name,
          title: item.title || "",
          summary: item.contentSnippet || item.content || item.summary || "",
          link: item.link || "",
          publishedAt: item.pubDate || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Failed source: ${source.name}`, error.message);
    }
  }

  fs.mkdirSync("content/articles", { recursive: true });
  fs.writeFileSync(
    "content/articles/raw-news.json",
    JSON.stringify(allItems, null, 2),
    "utf-8"
  );

  console.log(`raw news saved: ${allItems.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
