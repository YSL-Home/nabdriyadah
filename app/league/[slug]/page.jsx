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

function slugifyLeague(source = "") {
  return String(source).toLowerCase().replace(/\s+/g, "-");
}

export async function generateStaticParams() {
  const articles = getArticles();

  const uniqueSlugs = [...new Set(articles.map((article) => slugifyLeague(article.source)))];

  return uniqueSlugs
    .filter(Boolean)
    .map((slug) => ({
      slug,
    }));
}

export async function generateMetadata({ params }) {
  return {
    title: `${params.slug} | نبض الرياضة`,
    description: `آخر الأخبار والمقالات المتعلقة بـ ${params.slug}`,
  };
}

export default function LeaguePage({ params }) {
  const articles = getArticles();

  const filtered = articles.filter(
    (article) => slugifyLeague(article.source) === params.slug
  );

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
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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

        <h1
          style={{
            marginBottom: "24px",
            fontSize: "38px",
            color: "#111827",
          }}
        >
          {filtered[0]?.source || params.slug}
        </h1>

        {filtered.length === 0 ? (
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
          filtered.map((article, index) => (
            <Link
              key={article.slug || index}
              href={`/articles/${article.slug}`}
              style={{ textDecoration: "none" }}
            >
              <article
                style={{
                  background: "#f9fafb",
                  borderRadius: "22px",
                  padding: "30px",
                  marginBottom: "22px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 14px 0",
                    color: "#111827",
                    fontSize: "28px",
                    lineHeight: 1.5,
                    fontWeight: 800,
                  }}
                >
                  {article.title}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#4b5563",
                    fontSize: "18px",
                    lineHeight: 1.9,
                  }}
                >
                  {article.description}
                </p>
              </article>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
