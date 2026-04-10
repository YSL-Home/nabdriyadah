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
          source: article.source,
        },
      ])
    ).values(),
  ].filter((league) => league.slug);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#eef2f7",
        direction: "rtl",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "24px 20px 48px" }}>
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
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}>
              نبض الرياضة
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
              منصة أخبار رياضية عربية سريعة ومحدثة
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link href="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>
              الرئيسية
            </Link>
            {uniqueLeagues.slice(0, 6).map((league) => (
              <Link
                key={league.slug}
                href={`/league/${league.slug}`}
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {league.name}
              </Link>
            ))}
          </nav>
        </header>

        <section
          style={{
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            borderRadius: "30px",
            padding: "72px 24px",
            textAlign: "center",
            color: "white",
            marginBottom: "36px",
            boxShadow: "0 20px 40px rgba(37,99,235,0.15)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "72px",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            نبض الرياضة
          </h1>

          <p
            style={{
              marginTop: "18px",
              fontSize: "26px",
              opacity: 0.95,
            }}
          >
            أخبار - مباشر - فيديو - تحليلات
          </p>
        </section>

        <section style={{ marginBottom: "34px" }}>
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
                color: "#111827",
              }}
            >
              البطولات
            </h2>

            <div
              style={{
                fontSize: "16px",
                color: "#374151",
                fontWeight: 700,
              }}
            >
              عدد المقالات الحالية: {articles.length}
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
                    borderRadius: "20px",
                    padding: "22px",
                    border: "1px solid #e5e7eb",
                    minHeight: "120px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "#111827",
                      marginBottom: "10px",
                    }}
                  >
                    {league.name}
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

        <section>
          <h2
            style={{
              textAlign: "right",
              marginBottom: "24px",
              fontSize: "34px",
              color: "#111827",
            }}
          >
            🔥 أحدث المقالات
          </h2>

          {articles.length === 0 ? (
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
            articles.map((article, index) => (
              <article
                key={article.slug || index}
                style={{
                  background: "white",
                  borderRadius: "24px",
                  padding: "30px",
                  marginBottom: "20px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
                }}
              >
                <Link
                  href={`/articles/${article.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <h3
                    style={{
                      margin: "0 0 14px 0",
                      color: "#111827",
                      fontSize: "32px",
                      lineHeight: 1.5,
                      fontWeight: 800,
                    }}
                  >
                    {article.title}
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
                      color: "#2563eb",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    {arabicLeagueName(article.source)}
                  </Link>

                  <span>{(article.keywords || []).join(" • ")}</span>
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
          نبض الرياضة © منصة أخبار رياضية عربية مبنية للنشر السريع والهيكلة SEO
        </footer>
      </div>
    </main>
  );
}
