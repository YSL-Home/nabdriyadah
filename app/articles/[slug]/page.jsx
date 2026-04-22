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
      title: "المقال غير موجود",
      description: "هذه الصفحة غير متوفرة حالياً."
    };
  }

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.description,
    alternates: {
      canonical: `https://nabdriyadah.com/articles/${article.slug}/`
    },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.description,
      url: `https://nabdriyadah.com/articles/${article.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "article"
    }
  };
}

function leagueLabel(slug) {
  if (slug === "premier-league") return "الدوري الإنجليزي الممتاز";
  if (slug === "la-liga") return "الدوري الإسباني";
  return "كرة القدم";
}

function scoreRelatedness(baseArticle, otherArticle) {
  let score = 0;

  if (baseArticle.league === otherArticle.league) score += 5;

  const baseTags = baseArticle.topicTags || [];
  const otherTags = otherArticle.topicTags || [];
  const sharedTags = baseTags.filter((tag) => otherTags.includes(tag));
  score += sharedTags.length * 3;

  const baseKeywords = baseArticle.keywords || [];
  const otherKeywords = otherArticle.keywords || [];
  const sharedKeywords = baseKeywords.filter((keyword) =>
    otherKeywords.includes(keyword)
  );
  score += sharedKeywords.length * 2;

  return score;
}

export default function ArticlePage({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = articles
    .filter((item) => item.slug !== article.slug)
    .map((item) => ({ ...item, score: scoreRelatedness(article, item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "32px 20px 48px",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "330px minmax(0, 1fr)",
            gap: "28px",
            alignItems: "start"
          }}
        >
          <aside style={{ display: "grid", gap: "22px" }}>
            <section
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 26px rgba(0,0,0,0.04)"
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "24px",
                  fontWeight: 800
                }}
              >
                موضوع المقال
              </h2>

              <div
                style={{
                  color: "#4b5563",
                  fontSize: "16px",
                  lineHeight: 1.95
                }}
              >
                يتناول هذا المقال آخر المستجدات المرتبطة بـ {leagueLabel(article.league)} مع
                متابعة لأهم التفاصيل والخلفيات المرتبطة بالخبر.
              </div>
            </section>

            <section
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 26px rgba(0,0,0,0.04)"
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "24px",
                  fontWeight: 800
                }}
              >
                مقالات ذات صلة
              </h2>

              <div style={{ display: "grid", gap: "16px" }}>
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.slug}
                    href={`/articles/${relatedArticle.slug}/`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      paddingBottom: "14px",
                      borderBottom: "1px solid #f3f4f6"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        lineHeight: 1.7,
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
          </aside>

          <article
            style={{
              background: "white",
              borderRadius: "28px",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              boxShadow: "0 14px 34px rgba(0,0,0,0.05)"
            }}
          >
            <img
              src={article.image}
              alt={article.title}
              style={{
                width: "100%",
                height: "430px",
                objectFit: "cover",
                display: "block"
              }}
            />

            <div style={{ padding: "34px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                  alignItems: "center"
                }}
              >
                <Link
                  href="/"
                  style={{
                    color: "#2563eb",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "14px"
                  }}
                >
                  الرئيسية
                </Link>

                <span style={{ color: "#9ca3af" }}>←</span>

                <Link
                  href={article.league === "premier-league" ? "/league/premier-league/" : article.league === "la-liga" ? "/league/la-liga/" : "/"}
                  style={{
                    color: "#2563eb",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "14px"
                  }}
                >
                  {leagueLabel(article.league)}
                </Link>
              </div>

              <div
                style={{
                  display: "inline-block",
                  marginBottom: "14px",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  fontSize: "13px",
                  fontWeight: 700
                }}
              >
                {leagueLabel(article.league)}
              </div>

              <h1
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "48px",
                  lineHeight: 1.45,
                  fontWeight: 800,
                  color: "#111827"
                }}
              >
                {article.title}
              </h1>

              <p
                style={{
                  margin: "0 0 22px 0",
                  fontSize: "22px",
                  lineHeight: 2,
                  color: "#4b5563"
                }}
              >
                {article.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "28px"
                }}
              >
                {(article.keywords || []).map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "999px",
                      background: "#f3f4f6",
                      color: "#374151",
                      fontSize: "14px",
                      fontWeight: 700
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  borderRadius: "20px",
                  padding: "20px 22px",
                  marginBottom: "28px"
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "#111827",
                    marginBottom: "8px"
                  }}
                >
                  خلاصة سريعة
                </div>

                <div
                  style={{
                    color: "#4b5563",
                    fontSize: "17px",
                    lineHeight: 1.9
                  }}
                >
                  {article.seoDescription || article.description}
                </div>
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
                  fontSize: "20px",
                  lineHeight: 2.15,
                  color: "#111827",
                  whiteSpace: "pre-wrap"
                }}
              >
                {article.content}
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
