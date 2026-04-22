import articles from "../content/articles/seo-articles.json";

export default function HomePage() {
  return (
    <main style={{ padding: "40px", direction: "rtl", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        المشهد الرياضي اليوم
      </h1>

      <p style={{ marginBottom: "40px", color: "#555" }}>
        تابع آخر أخبار كرة القدم العالمية والعربية مع تغطية حصرية وتحليل احترافي.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px"
        }}
      >
        {articles.map((article, index) => (
          <a
            key={index}
            href={`/articles/${article.slug}/`}
            style={{
              display: "block",
              border: "1px solid #eee",
              borderRadius: "12px",
              overflow: "hidden",
              textDecoration: "none",
              color: "black",
              background: "#fff"
            }}
          >
            <img
              src={article.image}
              alt={article.title}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover"
              }}
            />

            <div style={{ padding: "15px" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>
                {article.title}
              </h2>

              <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.8" }}>
                {article.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
