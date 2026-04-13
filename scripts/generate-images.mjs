import fs from "fs/promises";

const INPUT = "content/articles/seo-articles.json";

// 🔍 détecte si on veut du texte dans l’image
function needsTextImage(title) {
  const keywords = [
    "الدوري",
    "ريال",
    "برشلونة",
    "مانشستر",
    "نهائي",
    "كأس",
    "مباراة"
  ];

  return keywords.some(k => title.includes(k));
}

// 🧠 GPT IMAGE (sans texte)
async function generateWithGPT(prompt) {
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `sports cinematic image, no text, ${prompt}`,
        size: "1024x1024",
      }),
    });

    const data = await res.json();
    return data.data?.[0]?.url || null;
  } catch {
    return null;
  }
}

// 🧠 GEMINI IMAGE (avec texte arabe)
async function generateWithGemini(prompt, title) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `تصميم صورة رياضية احترافية مع كتابة عربية واضحة: "${title}" بأسلوب حديث، خلفية كرة قدم`
                }
              ]
            }
          ]
        }),
      }
    );

    const data = await res.json();

    // ⚠️ Gemini image API dépend du setup (placeholder ici)
    return data?.image || null;

  } catch {
    return null;
  }
}

async function main() {
  const articles = JSON.parse(await fs.readFile(INPUT, "utf-8"));

  for (let article of articles) {
    let image = null;

    if (needsTextImage(article.title)) {
      console.log("🟢 Gemini image:", article.title);
      image = await generateWithGemini(article.description, article.title);
    } else {
      console.log("🔵 GPT image:", article.title);
      image = await generateWithGPT(article.description);
    }

    article.image = image || "/default.jpg";
  }

  await fs.writeFile(INPUT, JSON.stringify(articles, null, 2));
  console.log("✅ Images générées (Gemini + GPT)");
}

main();
