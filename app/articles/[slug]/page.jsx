import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug
  }));
}

export function generateMetadata({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    return {
      title: "مقال غير موجود",
      description: "هذا المقال غير متوفر حالياً."
    };
  }

  return {
    title: article.title,
    description: article.description || "أحدث الأخبار الرياضية العربية",
    keywords: article.keywords || [],
    alternates: {
      canonical: `https://nabdriyadah.com/articles/${article.slug}`
    },
    openGraph: {
      title: article.title,
      description: article.description || "أحدث الأخبار الرياضية العربية",
      url: `https://nabdriyadah.com/articles/${article.slug}`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "article"
    }
  };
}

function getRelatedArticles(currentSlug) {
  return articles.filter((article) => article.slug !== currentSlug).slice(0, 3);
}

export default function ArticlePage({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article.slug);

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
              <Link
                href="/"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "15px"
                }}
              >
                الصفحة الرئيسية
              </Link>

              <span style={{ margin: "0 8px", color: "#9ca3af" }}>←</span>

              <Link
                href="/league/premier-league"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "15px"
                }}
              >
                الدوريات
              </Link>
            </div>

            <div
              style={{
                display: "inline-block",
                marginBottom: "16px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#2563eb",
                background: "#eff6ff",
                borderRadius: "999px",
                padding: "8px 14px"
              }}
            >
              تحليل ومتابعة
            </div>

            <h1
              style={{
                marginTop: 0,
                marginBottom: "18px",
                color: "#111827",
                fontSize: "44px",
                lineHeight: 1.5,
                fontWeight: 800
              }}
            >
              {article.title}
            </h1>

            <p
              style={{
                color: "#4b5563",
                fontSize: "21px",
                lineHeight: 2,
                marginBottom: "24px"
              }}
            >
              {article.description}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "28px"
              }}
            >
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

            <div
              style={{
                height: "1px",
                background: "#e5e7eb",
                marginBottom: "28px"
              }}
            />

            <div
              style={{
                color: "#111827",
                fontSize: "20px",
                lineHeight: 2.2,
                whiteSpace: "pre-wrap"
              }}
            >
              {article.content || "المحتوى غير متوفر حالياً."}
            </div>

            <div
              style={{
                marginTop: "34px",
                paddingTop: "24px",
                borderTop: "1px solid #e5e7eb"
              }}
            >
              <h2
                style={{
                  fontSize: "28px",
                  color: "#111827",
                  marginTop: 0,
                  marginBottom: "16px"
                }}
              >
                روابط داخلية مفيدة
              </h2>

              <div style={{ display: "grid", gap: "12px" }}>
                <Link
                  href="/league/premier-league"
                  style={{
                    color: "#2563eb",
                    fontWeight: 700,
                    textDecoration: "none"
                  }}
                >
                  تصفح آخر أخبار الدوري الإنجليزي الممتاز
                </Link>

                <Link
                  href="/league/la-liga"
                  style={{
                    color: "#2563eb",
                    fontWeight: 700,
                    textDecoration: "none"
                  }}
                >
                  تصفح آخر أخبار الدوري الإسباني
                </Link>

                <Link
                  href="/"
                  style={{
                    color: "#2563eb",
                    fontWeight: 700,
                    textDecoration: "none"
                  }}
                >
                  العودة إلى جميع الأخبار الرياضية
                </Link>
              </div>
            </div>
          </article>

          <aside
            style={{
              display: "grid",
              gap: "20px"
            }}
          >
            <section
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "16px",
                  color: "#111827",
                  fontSize: "24px"
                }}
              >
                مقالات ذات صلة
              </h3>

              <div style={{ display: "grid", gap: "16px" }}>
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.slug}
                    href={`/articles/${relatedArticle.slug}`}
                    style={{
                      textDecoration: "none",
                      borderBottom: "1px solid #f3f4f6",
                      paddingBottom: "14px"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        lineHeight: 1.8,
                        fontWeight: 800,
                        color: "#111827",
                        marginBottom: "6px"
                      }}
                    >
                      {relatedArticle.title}
                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        lineHeight: 1.8
                      }}
                    >
                      {relatedArticle.description}
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "16px",
                  color: "#111827",
                  fontSize: "24px"
                }}
              >
                أقسام الموقع
              </h3>

              <div style={{ display: "grid", gap: "12px" }}>
                <Link
                  href="/league/premier-league"
                  style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
                >
                  الدوري الإنجليزي الممتاز
                </Link>

                <Link
                  href="/league/la-liga"
                  style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
                >
                  الدوري الإسباني
                </Link>

                <Link
                  href="/"
                  style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
                >
                  جميع المقالات
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
