import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";

function buildArticleSlug(index) {
  return `article-${index + 1}`;
}

function findArticleByRouteSlug(routeSlug) {
  const index = articles.findIndex((_, i) => buildArticleSlug(i) === routeSlug);

  if (index === -1) {
    return null;
  }

  return {
    article: articles[index],
    index
  };
}

export function generateStaticParams() {
  return articles.map((_, index) => ({
    slug: buildArticleSlug(index)
  }));
}

export function generateMetadata({ params }) {
  const result = findArticleByRouteSlug(params.slug);

  if (!result) {
    return {
      title: "مقال غير موجود",
      description: "هذا المقال غير متوفر حالياً."
    };
  }

  const { article, index } = result;

  return {
    title: article.title,
    description: article.description || "أحدث الأخبار الرياضية العربية",
    keywords: article.keywords || [],
    alternates: {
      canonical: `https://nabdriyadah.com/articles/${buildArticleSlug(index)}/`
    }
  };
}

function getRelatedArticles(currentIndex) {
  return articles
    .map((article, index) => ({ article, index }))
    .filter((item) => item.index !== currentIndex)
    .slice(0, 3);
}

export default function ArticlePage({ params }) {
  const result = findArticleByRouteSlug(params.slug);

  if (!result) {
    notFound();
  }

  const { article, index } = result;
  const relatedArticles = getRelatedArticles(index);

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
              {(article.keywords || []).map((keyword, keywordIndex) => (
                <span
                  key={keywordIndex}
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
                color: "#111827",
                fontSize: "20px",
                lineHeight: 2.2,
                whiteSpace: "pre-wrap"
              }}
            >
              {article.content || "المحتوى غير متوفر حالياً."}
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
                {relatedArticles.map((item) => (
                  <Link
                    key={item.index}
                    href={`/articles/${buildArticleSlug(item.index)}/`}
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
                      {item.article.title}
                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        lineHeight: 1.8
                      }}
                    >
                      {item.article.description}
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
