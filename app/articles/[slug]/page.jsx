import fs from "fs";
import path from "path";

export function generateStaticParams() {
  const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
  const file = fs.readFileSync(filePath, "utf-8");
  const articles = JSON.parse(file);

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

function getArticle(slug) {
  const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
  const file = fs.readFileSync(filePath, "utf-8");
  const articles = JSON.parse(file);

  return articles.find((a) => a.slug === slug);
}

export default function ArticlePage({ params }) {
  const article = getArticle(params.slug);

  if (!article) {
    return <div>Article non trouvé</div>;
  }

  return (
    <main style={{ padding: "40px", direction: "rtl" }}>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </main>
  );
}
