import Link from "next/link";
import articles from "../content/articles/seo-articles.json";

export const metadata = {
  title: "أخبار كرة القدم العربية والعالمية",
  description:
    "تابع أحدث أخبار كرة القدم العربية والعالمية مع تغطية يومية وتحليلات ومتابعة خاصة للدوري الإنجليزي والدوري الإسباني.",
  alternates: {
    canonical: "https://nabdriyadah.com/"
  }
};

const leagueMeta = {
  "premier-league": {
    title: "الدوري الإنجليزي الممتاز",
    href: "/league/premier-league/",
    description: "آخر أخبار البريميرليغ وتحليلات الأندية الكبرى."
  },
  "la-liga": {
    title: "الدوري الإسباني",
    href: "/league/la-liga/",
    description: "تغطية يومية لليغا وأبرز أخبار ريال مدريد وبرشلونة."
  }
};

function latestArticles() {
  return articles.slice(0, 8);
}

function leagueArticles(slug) {
  return articles.filter((article) => article.league === slug).slice(0, 4);
}

export default function HomePage() {
  const latest = latestArticles();
  const premierLeague = leagueArticles("premier-league");
  const laLiga = leagueArticles("la-liga");

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px 48px",
        background: "#f3f4f6",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
            borderRadius: "30px",
            padding: "56px 28px",
            color: "white",
            marginBottom: "28px",
            boxShadow: "0 16px 45px rgba(29,78,216,0.18)"
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.14)",
              padding: "10px 16px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "18px"
            }}
          >
            منصة رياضية عربية
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "60px",
              lineHeight: 1.15,
              fontWeight: 800
            }}
          >
            نبض الرياضة
          </h1>

          <p
            style={{
              margin: "18px 0 0 0",
              maxWidth: "850px",
              fontSize: "22px",
              lineHeight: 1.9,
              opacity: 0.96
            }}
          >
            تغطية عربية يومية لأبرز أخبار كرة القدم، مع متابعة خاصة لملفات
            الدوري الإنجليزي الممتاز والدوري الإسباني وأهم المستجدات التي تهم
            الجمهور العربي.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}
        >
          {Object.entries(leagueMeta).map(([slug, meta]) => (
            <Link
              key={slug}
              href={meta.href}
              style={{
                textDecoration: "none",
                color: "inherit"
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "24px",
                  padding: "24px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
                }}
              >
                <div
                  style={{
                    color: "#2563eb",
                    fontSize: "14px",
                    fontWeight: 700,
                    marginBottom: "10px"
                  }}
                >
                  صفحة فئة
                </div>

                <h2
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "30px",
                    lineHeight: 1.5,
                    fontWeight: 800
                  }}
                >
                  {meta.title}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#4b5563",
                    fontSize: "17px",
                    lineHeight: 1.9
                  }}
                >
                  {meta.description}
                </p>
              </div>
            </Link>
          ))}
        </section>

        <section style={{ marginBottom: "34px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "38px",
                fontWeight: 800,
                color: "#111827"
              }}
            >
              أحدث الأخبار
            </h2>

            <div
              style={{
                color: "#6b7280",
                fontSize: "15px"
              }}
            >
              آخر المواد المنشورة والمحدثة على الموقع
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "22px"
            }}
          >
            {latest.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}/`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article
                  style={{
                    background: "white",
                    borderRadius: "22px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
                    height: "100%"
                  }}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    style={{
                      width: "100%",
                      height: "215px",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />

                  <div style={{ padding: "22px" }}>
                    <div
                      style={{
                        display: "inline-block",
                        marginBottom: "12px",
                        padding: "8px 12px",
                        borderRadius: "999px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        fontSize: "13px",
                        fontWeight: 700
                      }}
                    >
                      {article.league === "premier-league"
                        ? "الدوري الإنجليزي"
                        : article.league === "la-liga"
                        ? "الدوري الإسباني"
                        : "كرة القدم"}
                    </div>

                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "22px",
                        lineHeight: 1.6,
                        fontWeight: 800,
                        color: "#111827"
                      }}
                    >
                      {article.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#4b5563",
                        fontSize: "16px",
                        lineHeight: 1.9
                      }}
                    >
                      {article.description}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "26px"
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 26px rgba(0,0,0,0.04)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px"
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 800
                }}
              >
                الدوري الإنجليزي الممتاز
              </h2>

              <Link
                href="/league/premier-league/"
                style={{
                  color: "#2563eb",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "14px"
                }}
              >
                عرض المزيد
              </Link>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              {premierLeague.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}/`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      paddingBottom: "14px",
                      borderBottom: "1px solid #f3f4f6"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        lineHeight: 1.7,
                        marginBottom: "6px"
                      }}
                    >
                      {article.title}
                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "15px",
                        lineHeight: 1.8
                      }}
                    >
                      {article.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 26px rgba(0,0,0,0.04)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px"
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 800
                }}
              >
                الدوري الإسباني
              </h2>

              <Link
                href="/league/la-liga/"
                style={{
                  color: "#2563eb",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "14px"
                }}
              >
                عرض المزيد
              </Link>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              {laLiga.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}/`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      paddingBottom: "14px",
                      borderBottom: "1px solid #f3f4f6"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        lineHeight: 1.7,
                        marginBottom: "6px"
                      }}
                    >
                      {article.title}
                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "15px",
                        lineHeight: 1.8
                      }}
                    >
                      {article.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
