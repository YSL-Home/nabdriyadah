import fs from "fs";
import path from "path";
import Link from "next/link";

function getArticles() {
  try {
    const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
    const file = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(file);
  } catch (e) {
    return [];
  }
}

export const metadata = {
  title: "نبض الرياضة | الصفحة الرئيسية",
  description: "الصفحة الرئيسية لموقع نبض الرياضة",
};

export default function Page() {
  const articles = getArticles();
  const version = "HOME-V2-ARABIC-DEBUG";
  const count = articles.length;
  const firstTitle = articles[0]?.title || "لا يوجد عنوان";
  const firstSource = articles[0]?.source || "لا يوجد مصدر";

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
            background: "linear-gradient(135deg,#0f172a,#2563eb,#7c3aed)",
            color: "white",
            borderRadius: "24px",
            padding: "40px 24px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              marginBottom: "12px",
              background: "rgba(255,255,255,0.15)",
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {version}
          </div>

          <h1 style={{ margin: 0, fontSize: "44px", fontWeight: 800 }}>
            نبض الرياضة
          </h1>

          <p style={{ marginTop: "12px", fontSize: "18px", opacity: 0.95 }}>
            الصفحة الرئيسية الجديدة المتصلة مباشرة بملف المقالات
          </p>
        </section>

        <section
          style={{
            background: "#fff7ed",
            border: "1px solid #fdba74",
            color: "#9a3412",
            borderRadius: "18px",
            padding: "18px 20px",
            marginBottom: "24px",
            lineHeight: 1.9,
          }}
        >
          <div><strong>عدد المقالات:</strong> {count}</div>
          <div><strong>أول عنوان:</strong> {firstTitle}</div>
          <div><strong>أول مصدر:</strong> {firstSource}</div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "30px", marginBottom: "16px" }}>📰 أحدث المقالات</h2>

          {articles.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              لا توجد مقالات حالياً في ملف seo-articles.json
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
                      fontSize: "26px",
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
                      fontSize: "17px",
                    }}
                  >
                    {article.description}
                  </p>

                  <div style={{ fontSize: "14px", color: "#64748b" }}>
                    {(article.keywords || []).join(" • ")}
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
