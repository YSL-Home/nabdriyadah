import Link from "next/link";
import articles from "../content/articles/seo-articles.json";

export const metadata = {
  title: "آخر الأخبار الرياضية العربية",
  description:
    "تابع آخر الأخبار الرياضية العربية، أبرز نتائج المباريات، وتحليلات كرة القدم والدوريات الكبرى يوميًا على نبض الرياضة.",
  alternates: {
    canonical: "https://nabdriyadah.com/"
  }
};

function getFeaturedArticles() {
  return articles.slice(0, 2);
}

function getLatestHeadlines() {
  return articles.slice(0, 6);
}

export default function HomePage() {
  const featuredArticles = getFeaturedArticles();
  const latestHeadlines = getLatestHeadlines();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        direction: "rtl",
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ maxWidth: "1450px", margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            borderRadius: "32px",
            padding: "64px 28px",
            textAlign: "center",
            color: "white",
            marginBottom: "34px",
            boxShadow: "0 20px 50px rgba(37,99,235,0.20)"
          }}
        >
          <div
            style={{
              display: "inline-block",
              marginBottom: "18px",
              padding: "10px 18px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.16)",
              fontSize: "14px",
              fontWeight: 700
            }}
          >
            منصة أخبار رياضية عربية
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "68px",
              fontWeight: 800,
              lineHeight: 1.1
            }}
          >
            نبض الرياضة
          </h1>

          <p
            style={{
              margin: "18px auto 0 auto",
              maxWidth: "900px",
              fontSize: "24px",
              lineHeight: 1.9,
              opacity: 0.96
            }}
          >
            تغطية عربية سريعة لأهم أخبار كرة القدم، التحليلات، نتائج المباريات،
            وأبرز مستجدات الدوريات الكبرى.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 360px",
            gap: "24px",
            alignItems: "start",
            marginBottom: "34px"
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "28px",
              padding: "28px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "14px",
                fontSize: "34px",
                color: "#111827"
              }}
            >
              المشهد الرياضي اليوم
            </h2>

            <p
              style={{
                margin: 0,
                color: "#4b5563",
                fontSize: "18px",
                lineHeight: 2
              }}
            >
              نتابع على مدار اليوم أبرز الأخبار المتداولة في كرة القدم الأوروبية،
              مع عرض موجز سريع لأهم التطورات والملفات التي تهم القارئ العربي.
            </p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "28px",
              padding: "28px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#2563eb",
                marginBottom: "10px"
              }}
            >
              إحصائية سريعة
            </div>

            <div
              style={{
                fontSize: "42px",
                fontWeight: 800,
                color: "#111827",
                marginBottom: "10px"
              }}
            >
              {articles.length}
            </div>

            <div
              style={{
                color: "#6b7280",
                fontSize: "17px",
                lineHeight: 1.8
              }}
            >
              عدد المقالات المتاحة حاليًا داخل قاعدة المحتوى.
            </div>
          </div>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2
            style={{
              textAlign: "right",
              marginBottom: "18px",
              fontSize: "36px",
              color: "#111827"
            }}
          >
            المقالات المميزة
          </h2>

          {featuredArticles.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "22px",
                padding: "28px",
                textAlign: "center",
                color: "#6b7280",
                border: "1px solid #e5e7eb"
              }}
            >
              لا توجد مقالات حالياً
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: "24px"
              }}
            >
              {featuredArticles[0] && (
                <Link
                  href="/article-1/"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      background: "white",
                      borderRadius: "26px",
                      padding: "30px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                      minHeight: "230px"
                    }}
                  >
                    {featuredArticles[0].image && (
                      <img
                        src={featuredArticles[0].image}
                        alt={featuredArticles[0].title}
                        style={{
                          width: "100%",
                          height: "260px",
                          objectFit: "cover",
                          borderRadius: "18px",
                          marginBottom: "18px"
                        }}
                      />
                    )}

                    <div
                      style={{
                        display: "inline-block",
                        marginBottom: "14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#2563eb",
                        background: "#eff6ff",
                        borderRadius: "999px",
                        padding: "8px 14px"
                      }}
                    >
                      المقال الأول
                    </div>

                    <h3
                      style={{
                        margin: "0 0 14px 0",
                        color: "#111827",
                        fontSize: "34px",
                        lineHeight: 1.6,
                        fontWeight: 800
                      }}
                    >
                      {featuredArticles[0].title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#4b5563",
                        fontSize: "18px",
                        lineHeight: 1.95
                      }}
                    >
                      {featuredArticles[0].description}
                    </p>
                  </article>
                </Link>
              )}

              {featuredArticles[1] && (
                <Link
                  href="/article-2/"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      background: "white",
                      borderRadius: "26px",
                      padding: "30px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                      minHeight: "230px"
                    }}
                  >
                    {featuredArticles[1].image && (
                      <img
                        src={featuredArticles[1].image}
                        alt={featuredArticles[1].title}
                        style={{
                          width: "100%",
                          height: "260px",
                          objectFit: "cover",
                          borderRadius: "18px",
                          marginBottom: "18px"
                        }}
                      />
                    )}

                    <div
                      style={{
                        display: "inline-block",
                        marginBottom: "14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#7c3aed",
                        background: "#f5f3ff",
                        borderRadius: "999px",
                        padding: "8px 14px"
                      }}
                    >
                      المقال الثاني
                    </div>

                    <h3
                      style={{
                        margin: "0 0 14px 0",
                        color: "#111827",
                        fontSize: "34px",
                        lineHeight: 1.6,
                        fontWeight: 800
                      }}
                    >
                      {featuredArticles[1].title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#4b5563",
                        fontSize: "18px",
                        lineHeight: 1.95
                      }}
                    >
                      {featuredArticles[1].description}
                    </p>
                  </article>
                </Link>
              )}
            </div>
          )}
        </section>

        <section
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
              fontSize: "34px",
              color: "#111827"
            }}
          >
            أحدث العناوين
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            {latestHeadlines.map((article, index) => (
              <div
                key={index}
                style={{
                  paddingBottom: "16px",
                  borderBottom:
                    index === latestHeadlines.length - 1 ? "none" : "1px solid #f3f4f6"
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    lineHeight: 1.7,
                    color: "#111827",
                    marginBottom: "8px"
                  }}
                >
                  {article.title}
                </div>

                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "17px",
                    lineHeight: 1.9
                  }}
                >
                  {article.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
