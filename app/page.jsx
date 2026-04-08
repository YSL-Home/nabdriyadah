import fs from "fs";
import path from "path";
import Link from "next/link";

function readArticles() {
  try {
    const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
    const file = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(file);
  } catch (error) {
    return [];
  }
}

export default function Page() {
  const articles = readArticles();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 16px",
        direction: "rtl",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            color: "white",
            borderRadius: "24px",
            padding: "48px 24px",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "42px", fontWeight: 800 }}>نبض الرياضة</h1>
          <p style={{ marginTop: "12px", fontSize: "18px", opacity: 0.95 }}>
            أخبار - مباشر - فيديو - تحليلات
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>🔥 أحدث المقالات</h2>

          {articles.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              لا توجد مقالات حالياً. شغّل الـ workflow ثم أعد التحديث.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {articles.map((article, index) => (
                <article
                  key={article.slug || index}
                  style={{
                    background: "white",
                    borderRadius: "18px",
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "24px",
                      lineHeight: 1.5,
                    }}
                  >
                    <Link
                      href={`/articles/${article.slug}`}
                      style={{
                        color: "#0f172a",
                        textDecoration: "none",
                      }}
                    >
                      {article.title}
                    </Link>
                  </h3>

                  <p
                    style={{
                      margin: "0 0 12px 0",
                      color: "#475569",
                      lineHeight: 1.8,
                    }}
                  >
                    {article.description}
                  </p>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    {article.keywords?.join(" • ")}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
