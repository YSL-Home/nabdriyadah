import fs from "fs";
import path from "path";
import Link from "next/link";

export const metadata = {
  title: "نبض الرياضة",
  description: "أحدث الأخبار الرياضية العربية وتحليلات البطولات العالمية",
};

function getArticles() {
  try {
    const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
    const file = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(file);
  } catch (error) {
    console.error("Erreur lecture seo-articles.json:", error);
    return [];
  }
}

function slugifyLeague(source = "") {
  return String(source).toLowerCase().replace(/\s+/g, "-");
}

export default function HomePage() {
  const articles = getArticles();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "32px 20px",
        direction: "rtl",
        fontFamily: "Arial, sans-serif",
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
            marginBottom: "40px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "64px",
              fontWeight: 800,
            }}
          >
            نبض الرياضة
          </h1>

          <p
            style={{
              marginTop: "18px",
              fontSize: "24px",
              opacity: 0.95,
            }}
          >
            أخبار - مباشر - فيديو - تحليلات
          </p>
        </section>

        <div
          style={{
            marginBottom: "20px",
            fontSize: "18px",
            color: "#111827",
            fontWeight: 700,
          }}
        >
          عدد المقالات الحالية: {articles.length}
        </div>

        <h2
          style={{
            textAlign: "right",
            marginBottom: "24px",
            fontSize: "32px",
            color: "#111827",
          }}
        >
          🔥 أحدث المقالات
        </h2>

        {articles.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            لا توجد مقالات حالياً
          </div>
        ) : (
          articles.map((article, index) => (
            <article
              key={article.slug || index}
              style={{
                background: "#f9fafb",
                borderRadius: "22px",
                padding: "30px",
                marginBottom: "22px",
                border: "1px solid #e5e7eb",
              }}
            >
              <Link
                href={`/articles/${article.slug}`}
                style={{ textDecoration: "none" }}
              >
                <h3
                  style={{
                    margin: "0 0 14px 0",
                    color: "#111827",
                    fontSize: "30px",
                    lineHeight: 1.5,
                    fontWeight: 800,
                  }}
                >
                  {article.title}
                </h3>
              </Link>

              <p
                style={{
                  margin: "0 0 14px 0",
                  color: "#4b5563",
                  fontSize: "18px",
                  lineHeight: 1.9,
                }}
              >
                {article.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                <Link
                  href={`/league/${slugifyLeague(article.source)}`}
                  style={{
                    color: "#2563eb",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  {article.source}
                </Link>

                <span>{(article.keywords || []).join(" • ")}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
