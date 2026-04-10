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

function arabicLeagueName(source = "") {
  const s = String(source).toLowerCase();

  if (s.includes("premier")) return "الدوري الإنجليزي الممتاز";
  if (s.includes("la-liga") || s.includes("la liga")) return "الدوري الإسباني";
  if (s.includes("serie-a") || s.includes("serie a")) return "الدوري الإيطالي";
  if (s.includes("bundesliga")) return "الدوري الألماني";
  if (s.includes("ligue-1") || s.includes("ligue 1")) return "الدوري الفرنسي";
  if (s.includes("champions")) return "دوري أبطال أوروبا";
  if (s.includes("saudi")) return "الدوري السعودي";
  return source || "كرة القدم";
}

export function generateStaticParams() {
  const articles = getArticles();

  const uniqueSlugs = [...new Set(articles.map((article) => slugifyLeague(article.source)))];

  return uniqueSlugs
    .filter(Boolean)
    .map((slug) => ({
      slug,
    }));
}

export async function generateMetadata({ params }) {
  const leagueName = arabicLeagueName(params.slug);

  return {
    title: `${leagueName} | نبض الرياضة`,
    description: `آخر الأخبار والتحليلات والمقالات المتعلقة بـ ${leagueName}`,
  };
}

export default function LeaguePage({ params }) {
  const articles = getArticles();
  const filtered = articles.filter(
    (article) => slugifyLeague(article.source) === params.slug
  );

  const leagueName = arabicLeagueName(params.slug);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f8f7",
        padding: "32px 20px",
        direction: "rtl",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "16px 22px",
            marginBottom: "22px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#2E7D32",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            ← العودة إلى الرئيسية
          </Link>
        </header>

        <section
          style={{
            background: "linear-gradient(135deg,#2E7D32,#8BC34A)",
            borderRadius: "28px",
            padding: "42px 28px",
            color: "white",
            marginBottom: "28px",
            boxShadow: "0 18px 36px rgba(46,125,50,0.12)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "46px",
              fontWeight: 800,
            }}
          >
            🏆 {leagueName}
          </h1>
          <p
            style={{
              marginTop: "14px",
              fontSize: "19px",
              opacity: 0.95,
            }}
          >
            آخر الأخبار والمقالات والتحليلات الخاصة بهذه البطولة
          </p>
        </section>

        {filtered.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              textAlign: "center",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
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
                  background: "white",
                  borderRadius: "22px",
                  padding: "30px",
                  marginBottom: "20px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.03)",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 14px 0",
                    color: "#1f2937",
                    fontSize: "30px",
                    lineHeight: 1.5,
                    fontWeight: 800,
                  }}
                >
                  📰 {article.title}
                </h2>

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
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  🏷️ {(article.keywords || []).join(" • ")}
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
