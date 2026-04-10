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

function slugifyLeague(source = "") {
  return String(source).toLowerCase().replace(/\s+/g, "-");
}

export function generateStaticParams() {
  const articles = getArticles();

  return articles
    .filter((article) => article?.slug)
    .map((article) => ({
      slug: article.slug,
    }));
}

export async function generateMetadata({ params }) {
  const articles = getArticles();
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    return {
      title: "المقال غير موجود | نبض الرياضة",
      description: "هذه الصفحة غير متوفرة حالياً.",
    };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords || [],
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      locale: "ar_AR",
      siteName: "نبض الرياضة",
    },
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
          background: "#eef2f7",
          padding: "32px 20px",
          direction: "rtl",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "32px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h1 style={{ marginTop: 0 }}>المقال غير موجود</h1>
            <p style={{ color: "#4b5563", lineHeight: 1.8 }}>
              قد يكون هذا المقال غير متوفر حالياً أو تم تغييره.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: "16px",
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "نبض الرياضة",
    },
    publisher: {
      "@type": "Organization",
      name: "نبض الرياضة",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://nabdriyadah.com/articles/${article.slug}`,
    },
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#eef2f7",
        padding: "32px 20px",
        direction: "rtl",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <header
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "16px 22px",
            marginBottom: "22px",
            border: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← العودة إلى الرئيسية
          </Link>

          <Link
            href={`/league/${slugifyLeague(article.source)}`}
            style={{
              color: "#374151",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            {arabicLeagueName(article.source)}
          </Link>
        </header>

        <article
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "36px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#6b7280",
              marginBottom: "14px",
            }}
          >
            {arabicLeagueName(article.source)}
            {article.publishedAt ? (
              <> • {new Date(article.publishedAt).toLocaleDateString("fr-FR")}</>
            ) : null}
          </div>

          <h1
            style={{
              margin: "0 0 18px 0",
              fontSize: "44px",
              lineHeight: 1.4,
              color: "#111827",
              fontWeight: 800,
            }}
          >
            {article.title}
          </h1>

          <p
            style={{
              margin: "0 0 30px 0",
              fontSize: "20px",
              lineHeight: 1.95,
              color: "#4b5563",
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
            <section style={{ marginTop: "42px" }}>
              <h2
                style={{
                  fontSize: "30px",
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
