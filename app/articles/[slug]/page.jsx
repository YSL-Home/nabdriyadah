import fs from "fs";
import path from "path";

function getArticles() {
  const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function generateMetadata({ params }) {
  const articles = getArticles();
  const article = articles.find(a => a.slug === params.slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords
  };
}

export default function ArticlePage({ params }) {
  const articles = getArticles();
  const article = articles.find(a => a.slug === params.slug);

  if (!article) return <div>Article not found</div>;

  return (
    <main style={{ padding: "30px", direction: "rtl", maxWidth: "800px", margin: "auto" }}>
      <h1>{article.title}</h1>

      <p style={{ color: "#666" }}>{article.description}</p>

      {article.content.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      <h2>الأسئلة الشائعة</h2>

      {article.faq.map((f, i) => (
        <div key={i}>
          <strong>{f.q}</strong>
          <p>{f.a}</p>
        </div>
      ))}
    </main>
  );
}
