import fs from "fs";
import path from "path";

function getArticles() {
  const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
  const file = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(file);
}

export async function generateStaticParams() {
  const articles = getArticles();

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }) {
  const articles = getArticles();
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    return {
      title: "المقال غير موجود | نبض الرياضة",
      description: "هذه الصفحة غير موجودة.",
    };
  }

  return {
    title: article.title,
    description: article.description,
  };
}

export default function ArticlePage({ params }) {
  const articles = getArticles();
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    return (
      <main style={{ padding: "40px", direction: "rtl", fontFamily: "system-ui" }}>
        <h1>المقال غير موجود</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        direction: "rtl",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <article
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              marginBottom: "16px",
              background: "#dbeafe",
              color: "#1d4ed8",
              padding: "8px 14px",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            مقال رياضي
          </div>

          <h1
            style={{
              fontSize: "40px",
              lineHeight: 1.4,
              margin: "0 0 16px 0",
            }}
          >
            {article.title}
          </h1>

          <p
            style={{
              color: "#475569",
              fontSize: "18px",
              lineHeight: 1.9,
              marginBottom: "24px",
            }}
          >
            {article.description}
          </p>

          <div
            style={{
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "24px",
            }}
          >
            {new Date(article.publishedAt).toLocaleString("fr-FR")}
          </div>

          <div
            style={{
              fontSize: "18px",
              lineHeight: 2,
              color: "#0f172a",
              marginBottom: "24px",
            }}
          >
            {article.content}
          </div>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #e2e8f0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            {article.keywords?.join(" • ")}
          </div>
        </article>
      </div>
    </main>
  );
}
