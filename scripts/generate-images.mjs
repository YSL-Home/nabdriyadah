import fs from "fs/promises";

const INPUT = "content/articles/seo-articles.json";

async function generateImage(prompt) {
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `صورة رياضية احترافية بدون نص: ${prompt}`,
        size: "1024x1024",
      }),
    });

    const data = await res.json();
    return data.data[0].url;
  } catch {
    return null;
  }
}

async function main() {
  const articles = JSON.parse(await fs.readFile(INPUT, "utf-8"));

  for (let article of articles) {
    const image = await generateImage(article.title);

    article.image = image || "/default.jpg";
  }

  await fs.writeFile(INPUT, JSON.stringify(articles, null, 2));
  console.log("✅ Images générées");
}

main();
