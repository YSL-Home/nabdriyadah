import fs from "fs/promises";

const sourcesPath = new URL("../data/sources.json", import.meta.url);
const outputPath = new URL("../content/articles/raw-news.json", import.meta.url);

async function main() {
  const raw = await fs.readFile(sourcesPath, "utf-8");
  const sources = JSON.parse(raw);

  const items = sources.map((source, index) => ({
    id: `news-${Date.now()}-${index}`,
    source: source.name,
    title: `Sample title from ${source.name}`,
    summary: `Sample summary from ${source.name}`,
    url: source.url,
    fetchedAt: new Date().toISOString()
  }));

  await fs.mkdir(new URL("../content/articles/", import.meta.url), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(items, null, 2), "utf-8");
  console.log("raw news saved");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
