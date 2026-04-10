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

export default function HomePage() {
  const articles = getArticles();

  const uniqueLeagues = [
    ...new Map(
      articles.map((article) => [
        slugifyLeague(article.source),
        {
          slug: slugifyLeague(article.source),
          name: arabicLeagueName(article.source),
        },
      ])
    ).values(),
  ].filter((league) => league.slug);

  const featured = articles[0] || null;
  const latest = articles.slice(1);

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

              {uniqueLeagues.slice(0, 6).map((league) => (
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

        <section style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "34px",
                color: "#1f2937",
              }}
            >
              🏆 البطولات
            </h2>

            <div
              style={{
                fontSize: "16px",
                color: "#1f2937",
                fontWeight: 700,
              }}
            >
              📌 عدد المقالات الحالية: {articles.length}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {uniqueLeagues.map((league) => (
              <Link
                key={league.slug}
                href={`/league/${league.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "22px",
                    padding: "22px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 8px 20px rgba(15,23,42,0.03)",
                    minHeight: "120px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "#1f2937",
                      marginBottom: "10px",
                    }}
                  >
                    🏅 {league.name}
                  </div>
                  <div
                    style={{
                      color: "#6b7280",
                      lineHeight: 1.8,
                      fontSize: "15px",
                    }}
                  >
                    آخر الأخبار والمقالات الخاصة بهذه البطولة
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {featured && (
          <section style={{ marginBottom: "30px" }}>
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "34px",
                color: "#1f2937",
              }}
            >
              🔥 الخبر الأبرز
            </h2>

            <article
              style={{
                background: "white",
                borderRadius: "26px",
                padding: "32px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
              }}
            >
              <Link
                href={`/articles/${featured.slug}`}
                style={{ textDecoration: "none" }}
              >
                <h3
                  style={{
                    margin: "0 0 14px 0",
                    color: "#1f2937",
                    fontSize: "38px",
                    lineHeight: 1.5,
                    fontWeight: 800,
                  }}
                >
                  📰 {featured.title}
                </h3>
              </Link>

              <p
                style={{
                  margin: "0 0 16px 0",
                  color: "#4b5563",
                  fontSize: "19px",
                  lineHeight: 1.95,
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

                <span>{(featured.keywords || []).join(" • ")}</span>
              </div>
            </article>
          </section>
        )}

        <section>
          <h2
            style={{
              textAlign: "right",
              marginBottom: "24px",
              fontSize: "34px",
              color: "#1f2937",
            }}
          >
            📌 أحدث المقالات
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
          ✅ نبض الرياضة © هوية بصرية خضراء حديثة موجهة للأخبار الرياضية العربية
        </footer>
      </div>
    </main>
  );
}
