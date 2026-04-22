import articles from "../../../content/articles/seo-articles.json";

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug
  }));
}

export default function ArticlePage({ params }) {
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    return (
      <main style={{ padding: "40px", direction: "rtl", fontFamily: "sans-serif" }}>
        <div>المقال غير موجود</div>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px", direction: "rtl", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        {article.title}
      </h1>

      <img
        src={article.image}
        alt={article.title}
        style={{
          width: "100%",
          maxHeight: "400px",
          objectFit: "cover",
          borderRadius: "10px",
          marginBottom: "20px"
        }}
      />

      <p style={{ color: "#444", lineHeight: "1.8", fontSize: "18px", whiteSpace: "pre-wrap" }}>
        {article.content}
      </p>
    </main>
  );
}
