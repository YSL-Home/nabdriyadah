import fs from "fs";
import path from "path";
import Link from "next/link";

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

export async function generateStaticParams() {
  const articles = getArticles();

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }) {
  const articles = getArticles();
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    return {
      title: "المقال غير موجود | نبض الرياضة",
      description: "هذه الصفحة غير موجودة.",
    };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords || [],
  };
}

export default function ArticlePage({ params }) {
  const articles = getArticles();
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
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
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1>المقال غير موجود</h1>
          <Link href="/" style={{ color: "#2563eb", textDecoration: "none" }}>
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </main>
    );
  }

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
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            color: "#2563eb",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← العودة إلى الرئيسية
        </Link>

        <article
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              marginBottom: "16px",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            {article.source || "أخبار رياضية"} •{" "}
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString("fr-FR")
              : ""}
          </div>

          <h1
            style={{
              margin: "0 0 18px 0",
              fontSize: "40px",
              lineHeight: 1.4,
              color: "#111827",
              fontWeight: 800,
            }}
          >
            {article.title}
          </h1>

          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.9,
              color: "#4b5563",
              marginBottom: "28px",
            }}
          >
            {article.description}
          </p>

          <div style={{ display: "grid", gap: "18px" }}>
            {(article.content || []).map((paragraph, index) => (
              <p
                key={index}
                style={{
                  margin: 0,
                  fontSize: "18px",
                  lineHeight: 2,
                  color: "#111827",
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {(article.faq || []).length > 0 && (
            <section style={{ marginTop: "36px" }}>
              <h2
                style={{
                  fontSize: "28px",
                  marginBottom: "18px",
                  color: "#111827",
                }}
              >
                الأسئلة الشائعة
              </h2>

              <div style={{ display: "grid", gap: "16px" }}>
                {article.faq.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      padding: "18px",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "18px",
                        color: "#111827",
                      }}
                    >
                      {item.q}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "#4b5563",
                        lineHeight: 1.9,
                        fontSize: "16px",
                      }}
                    >
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(article.keywords || []).length > 0 && (
            <div
              style={{
                marginTop: "28px",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              {(article.keywords || []).join(" • ")}
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
