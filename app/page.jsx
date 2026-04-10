import fs from "fs";
import path from "path";
import Link from "next/link";

export const metadata = {
  title: "نبض الرياضة",
  description: "أحدث الأخبار الرياضية العربية وتحليلات البطولات العالمية",
};

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
  if (s.includes("padel")) return "البادل";
  return source || "كرة القدم";
}

function pickTrends(articles) {
  const counts = new Map();

  for (const article of articles) {
    for (const keyword of article.keywords || []) {
      const key = String(keyword || "").trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);
}

export default function HomePage() {
  const articles = getArticles();

  const featured = articles[0] || null;
  const secondaryFeatured = articles.slice(1, 3);
  const latest = articles.slice(3, 9);

  const leagueGroups = [...new Map(
    articles.map((article) => [
      slugifyLeague(article.source),
      {
        slug: slugifyLeague(article.source),
        name: arabicLeagueName(article.source),
        items: articles.filter(
          (a) => slugifyLeague(a.source) === slugifyLeague(article.source)
        ),
      },
    ])
  ).values()];

  const trends = pickTrends(articles);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f8f7",
        direction: "rtl",
      }}
    >
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "24px 20px 56px" }}>
        <header
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <img
              src="/logo.svg"
              alt="نبض الرياضة"
              style={{
                width: "min(100%, 560px)",
              }}
            />

            <nav
              style={{
                display: "flex",
                gap: "18px",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              <Link href="/" style={{ textDecoration: "none", color: "#2E7D32", fontWeight: 800 }}>
                🏠 الرئيسية
              </Link>

              {leagueGroups.slice(0, 6).map((league) => (
                <Link
                  key={league.slug}
                  href={`/league/${league.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "#1f2937",
                    fontWeight: 700,
                  }}
                >
                  🏆 {league.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <section
          style={{
            background: "linear-gradient(135deg, #2E7D32, #8BC34A)",
            borderRadius: "32px",
            padding: "54px 24px",
            textAlign: "center",
            color: "white",
            marginBottom: "32px",
            boxShadow: "0 20px 40px rgba(46,125,50,0.16)",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              opacity: 0.95,
              marginBottom: "10px",
            }}
          >
            ⚽ منصة عربية رياضية حديثة
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "68px",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            نبض الرياضة
          </h1>

          <p
            style={{
              marginTop: "18px",
              fontSize: "24px",
              opacity: 0.97,
            }}
          >
            📰 أخبار - ⏱️ مباشر - 🎥 فيديو - 📊 تحليلات
          </p>
        </section>

        <section style={{ marginBottom: "34px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 18px 0",
                  fontSize: "34px",
                  color: "#1f2937",
                }}
              >
                🔥 العنوان الأبرز
              </h2>

              {featured && (
                <article
                  style={{
                    background: "white",
                    borderRadius: "28px",
                    padding: "34px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
                    minHeight: "100%",
                  }}
                >
                  <Link
                    href={`/articles/${featured.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <h3
                      style={{
                        margin: "0 0 16px 0",
                        color: "#1f2937",
                        fontSize: "42px",
                        lineHeight: 1.45,
                        fontWeight: 800,
                      }}
                    >
                      📰 {featured.title}
                    </h3>
                  </Link>

                  <p
                    style={{
                      margin: "0 0 18px 0",
                      color: "#4b5563",
                      fontSize: "20px",
                      lineHeight: 2,
                    }}
                  >
                    {featured.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                      alignItems: "center",
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    <Link
                      href={`/league/${slugifyLeague(featured.source)}`}
                      style={{
                        color: "#2E7D32",
                        textDecoration: "none",
                        fontWeight: 800,
                      }}
                    >
                      🏆 {arabicLeagueName(featured.source)}
                    </Link>

                    <span>🏷️ {(featured.keywords || []).join(" • ")}</span>
                  </div>
                </article>
              )}
            </div>

            <div>
              <h2
                style={{
                  margin: "0 0 18px 0",
                  fontSize: "30px",
                  color: "#1f2937",
                }}
              >
                📌 رائج الآن
              </h2>

              <div
                style={{
                  background: "white",
                  borderRadius: "24px",
                  padding: "24px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {trends.map((trend, index) => (
                    <span
                      key={index}
                      style={{
                        background: "#EDF7EE",
                        color: "#2E7D32",
                        padding: "10px 14px",
                        borderRadius: "999px",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      📈 {trend}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "24px",
                    fontSize: "15px",
                    color: "#6b7280",
                    lineHeight: 1.9,
                  }}
                >
                  ✅ يتم استخراج المواضيع الرائجة من الكلمات المفتاحية داخل المقالات المنشورة.
                </div>
              </div>
            </div>
          </div>
        </section>

        {secondaryFeatured.length > 0 && (
          <section style={{ marginBottom: "34px" }}>
            <h2
              style={{
                margin: "0 0 18px 0",
                fontSize: "32px",
                color: "#1f2937",
              }}
            >
              ⚡ أبرز المتابعات
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              {secondaryFeatured.map((article, index) => (
                <article
                  key={article.slug || index}
                  style={{
                    background: "white",
                    borderRadius: "24px",
                    padding: "26px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 8px 20px rgba(15,23,42,0.03)",
                  }}
                >
                  <Link
                    href={`/articles/${article.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        color: "#1f2937",
                        fontSize: "28px",
                        lineHeight: 1.6,
                        fontWeight: 800,
                      }}
                    >
                      🗞️ {article.title}
                    </h3>
                  </Link>

                  <p
                    style={{
                      margin: "0 0 14px 0",
                      color: "#4b5563",
                      fontSize: "17px",
                      lineHeight: 1.95,
                    }}
                  >
                    {article.description}
                  </p>

                  <Link
                    href={`/league/${slugifyLeague(article.source)}`}
                    style={{
                      color: "#2E7D32",
                      textDecoration: "none",
                      fontWeight: 800,
                      fontSize: "14px",
                    }}
                  >
                    🏆 {arabicLeagueName(article.source)}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginBottom: "34px" }}>
          <h2
            style={{
              margin: "0 0 18px 0",
              fontSize: "32px",
              color: "#1f2937",
            }}
          >
            🏆 حسب البطولة
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {leagueGroups.map((league, index) => (
              <div
                key={league.slug || index}
                style={{
                  background: "white",
                  borderRadius: "24px",
                  padding: "24px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.03)",
                }}
              >
                <Link
                  href={`/league/${league.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <h3
                    style={{
                      margin: "0 0 14px 0",
                      color: "#1f2937",
                      fontSize: "24px",
                      lineHeight: 1.5,
                      fontWeight: 800,
                    }}
                  >
                    🥇 {league.name}
                  </h3>
                </Link>

                <div style={{ display: "grid", gap: "12px" }}>
                  {league.items.slice(0, 3).map((article, articleIndex) => (
                    <Link
                      key={article.slug || articleIndex}
                      href={`/articles/${article.slug}`}
                      style={{
                        textDecoration: "none",
                        color: "#4b5563",
                        fontSize: "15px",
                        lineHeight: 1.8,
                        fontWeight: 700,
                      }}
                    >
                      • {article.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2
            style={{
              textAlign: "right",
              marginBottom: "24px",
              fontSize: "34px",
              color: "#1f2937",
            }}
          >
            ⏱️ آخر الأخبار
          </h2>

          {latest.length === 0 ? (
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
            latest.map((article, index) => (
              <article
                key={article.slug || index}
                style={{
                  background: "white",
                  borderRadius: "24px",
                  padding: "30px",
                  marginBottom: "20px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.03)",
                }}
              >
                <Link
                  href={`/articles/${article.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <h3
                    style={{
                      margin: "0 0 14px 0",
                      color: "#1f2937",
                      fontSize: "30px",
                      lineHeight: 1.5,
                      fontWeight: 800,
                    }}
                  >
                    📰 {article.title}
                  </h3>
                </Link>

                <p
                  style={{
                    margin: "0 0 16px 0",
                    color: "#4b5563",
                    fontSize: "18px",
                    lineHeight: 1.95,
                  }}
                >
                  {article.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  <Link
                    href={`/league/${slugifyLeague(article.source)}`}
                    style={{
                      color: "#2E7D32",
                      textDecoration: "none",
                      fontWeight: 800,
                    }}
                  >
                    🏆 {arabicLeagueName(article.source)}
                  </Link>

                  <span>🏷️ {(article.keywords || []).join(" • ")}</span>
                </div>
              </article>
            ))
          )}
        </section>

        <footer
          style={{
            marginTop: "42px",
            padding: "24px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "15px",
          }}
        >
          ✅ نبض الرياضة © واجهة مجلة رياضية عربية بهيكل أقوى للنشر والـ SEO
        </footer>
      </div>
    </main>
  );
}
