import Link from "next/link";
import articles from "../content/articles/seo-articles.json";

export const metadata = {
  title: "آخر الأخبار الرياضية العربية",
  description:
    "تابع آخر الأخبار الرياضية العربية، أبرز نتائج المباريات، وتحليلات كرة القدم والدوريات الكبرى يوميًا على نبض الرياضة.",
  alternates: {
    canonical: "https://nabdriyadah.com"
  }
};

export default function HomePage() {
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
      <div style={{ maxWidth: "1450px", margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(90deg,#2563eb,#7c3aed)",
            borderRadius: "28px",
            padding: "56px 24px",
            textAlign: "center",
            color: "white",
            marginBottom: "40px"
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1
            }}
          >
            نبض الرياضة
          </h1>

          <p
            style={{
              marginTop: "18px",
              fontSize: "24px",
              opacity: 0.95
            }}
          >
            أخبار - مباشر - فيديو - تحليلات
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2
            style={{
              textAlign: "right",
              marginBottom: "12px",
              fontSize: "32px",
              color: "#111827"
            }}
          >
            أحدث المقالات
          </h2>

          <p
            style={{
              margin: 0,
              color: "#4b5563",
              fontSize: "18px",
              lineHeight: 1.9
            }}
          >
            تابع آخر أخبار كرة القدم العربية والعالمية، واطّلع على أبرز التحليلات والتقارير الخاصة بالدوريات الكبرى.
          </p>
        </section>

        {articles.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              textAlign: "center",
              color: "#6b7280"
            }}
          >
            لا توجد مقالات حالياً
          </div>
        ) : (
          <div style={{ display: "grid", gap: "22px" }}>
            {articles.map((article, index) => (
              <Link
                key={article.slug || index}
                href={`/articles/${article.slug}`}
                style={{ textDecoration: "none" }}
              >
                <article
                  style={{
                    background: "white",
                    borderRadius: "22px",
                    padding: "30px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      marginBottom: "14px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#2563eb",
                      background: "#eff6ff",
                      borderRadius: "999px",
                      padding: "8px 14px"
                    }}
                  >
                    خبر رياضي
                  </div>

                  <h3
                    style={{
                      margin: "0 0 14px 0",
                      color: "#111827",
                      fontSize: "30px",
                      lineHeight: 1.5,
                      fontWeight: 800
                    }}
                  >
                    {article.title}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 16px 0",
                      color: "#4b5563",
                      fontSize: "18px",
                      lineHeight: 1.9
                    }}
                  >
                    {article.description}
                  </p>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280"
                    }}
                  >
                    {(article.keywords || []).join(" • ")}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
