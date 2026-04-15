import Link from "next/link";
import articles from "../../content/articles/seo-articles.json";

export const metadata = {
  title: articles[1]?.title || "مقال رياضي",
  description: articles[1]?.description || "مقال رياضي"
};

export default function ArticleTwoPage() {
  const article = articles[1];

  if (!article) {
    return (
      <main style={{ padding: 40, direction: "rtl", fontFamily: "Arial, sans-serif" }}>
        <p>المقال غير متوفر حالياً.</p>
      </main>
    );
  }

  const relatedArticles = [articles[0]].filter(Boolean);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "32px 20px",
        direction: "rtl",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 320px",
            gap: "28px",
            alignItems: "start"
          }}
        >
          <article
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "34px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ marginBottom: "18px" }}>
              <Link href="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>
                الصفحة الرئيسية
              </Link>
            </div>

            <h1 style={{ marginTop: 0, marginBottom: "18px", color: "#111827", fontSize: "44px", lineHeight: 1.5, fontWeight: 800 }}>
              {article.title}
            </h1>

            <p style={{ color: "#4b5563", fontSize: "21px", lineHeight: 2, marginBottom: "24px" }}>
              {article.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "28px" }}>
              {(article.keywords || []).map((keyword, index) => (
                <span
                  key={index}
                  style={{
                    background: "#f3f4f6",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "8px 12px",
                    borderRadius: "999px"
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>

            <div style={{ color: "#111827", fontSize: "20px", lineHeight: 2.2, whiteSpace: "pre-wrap" }}>
              {article.content || "المحتوى غير متوفر حالياً."}
            </div>
          </article>

          <aside style={{ display: "grid", gap: "20px" }}>
            <section
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#111827", fontSize: "24px" }}>
                مقالات ذات صلة
              </h3>

              <div style={{ display: "grid", gap: "16px" }}>
                {relatedArticles.map((relatedArticle, index) => (
                  <Link
                    key={index}
                    href="/article-1/"
                    style={{
                      textDecoration: "none",
                      borderBottom: "1px solid #f3f4f6",
                      paddingBottom: "14px"
                    }}
                  >
                    <div style={{ fontSize: "18px", lineHeight: 1.8, fontWeight: 800, color: "#111827", marginBottom: "6px" }}>
                      {relatedArticle.title}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.8 }}>
                      {relatedArticle.description}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
