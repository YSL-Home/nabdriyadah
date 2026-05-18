import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import articles from "../../../../content/articles/seo-articles.json";

function loadGolfTop30() {
  try {
    const p = path.join(process.cwd(), "content/players/golf-top30.json");
    const d = JSON.parse(fs.readFileSync(p, "utf-8"));
    return d.rankings || [];
  } catch {
    return [];
  }
}

export function generateStaticParams() {
  const players = loadGolfTop30();
  return players.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const players = loadGolfTop30();
  const player = players.find((p) => p.slug === params.slug);
  if (!player) return { title: "لاعب غير موجود" };

  return {
    title: `${player.nameAr} — المركز ${player.rank} OWGR | نبض الرياضة`,
    description: `صفحة لاعب الغولف ${player.nameAr}، المركز ${player.rank} في التصنيف العالمي OWGR بـ ${player.points} نقطة متوسطة.`,
    alternates: {
      canonical: `https://nabdriyadah.com/player/golf/${params.slug}/`
    },
    openGraph: {
      title: `${player.nameAr} — الغولف`,
      description: `تصنيف ${player.nameAr} في جولة PGA`,
      url: `https://nabdriyadah.com/player/golf/${params.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "profile"
    }
  };
}

export default function GolfPlayerPage({ params }) {
  const players = loadGolfTop30();
  const player = players.find((p) => p.slug === params.slug);

  if (!player) {
    notFound();
  }

  const theme = {
    heroFrom: "#052e16",
    heroTo: "#16a34a",
    primary: "#16a34a",
    primarySoft: "#dcfce7",
    border: "#bbf7d0",
    pageBg: "#f0fdf4"
  };

  const relatedArticles = articles
    .filter((a) => a.slug && a.sport === "golf")
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 6);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": player.name,
    "alternateName": player.nameAr,
    "nationality": player.countryAr || player.country,
    "url": `https://nabdriyadah.com/player/golf/${player.slug}/`,
    "description": `لاعب الغولف ${player.nameAr}، المركز ${player.rank} عالمياً في تصنيف OWGR بـ ${player.points} نقطة متوسطة.`
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        padding: "0 0 52px",
        direction: "rtl"
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`,
          padding: "48px 24px 60px",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "-60px",
            width: "200px",
            height: "200px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.07)"
          }}
        />
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Link
            href="/league/pga-tour/"
            style={{
              display: "inline-block",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "14px",
              opacity: 0.9,
              marginBottom: "20px"
            }}
          >
            ← العودة إلى تصنيف PGA Tour
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            {/* Rang */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: "28px", fontWeight: 900, lineHeight: 1 }}>{player.rank}</span>
              <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: 600 }}>OWGR</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "5px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  marginBottom: "12px"
                }}
              >
                PGA Tour — الغولف
              </div>
              <h1
                style={{
                  margin: "0 0 8px",
                  fontSize: "clamp(28px, 5vw, 52px)",
                  fontWeight: 900,
                  lineHeight: 1.2
                }}
              >
                {player.nameAr}
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "18px",
                  opacity: 0.9,
                  fontWeight: 600
                }}
              >
                {player.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 20px 0" }}>
        {/* Stats rapides */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "28px"
          }}
        >
          {[
            { label: "التصنيف العالمي OWGR", value: `#${player.rank}`, color: theme.primary },
            { label: "متوسط النقاط", value: player.points?.toFixed(2) || "—", color: "#374151" },
            { label: "الجنسية", value: player.countryAr || player.country, color: "#374151" },
            { label: "عدد الماجورز", value: player.majors?.length || 0, color: theme.primary }
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "20px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: stat.color,
                  marginBottom: "6px"
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Palmarès Majeurs */}
        {player.majors && player.majors.length > 0 && (
          <section
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "24px",
              border: `1px solid ${theme.border}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
              marginBottom: "24px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div
                style={{
                  width: "5px",
                  height: "26px",
                  borderRadius: "999px",
                  background: theme.primary
                }}
              />
              <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>
                ألقاب الماجورز ({player.majors.length})
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {player.majors.map((major, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    background: theme.primarySoft,
                    borderRadius: "14px",
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: theme.primary,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                    {major}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Profil */}
        <section
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "24px",
            border: `1px solid ${theme.border}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "5px", height: "26px", borderRadius: "999px", background: theme.primary }} />
            <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>الملف الشخصي</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px"
            }}
          >
            {[
              { label: "الاسم الكامل", value: player.name },
              { label: "الاسم بالعربية", value: player.nameAr },
              { label: "الجنسية", value: player.countryAr || player.country },
              { label: "التصنيف الحالي", value: `#${player.rank} OWGR` },
              { label: "متوسط النقاط", value: player.points?.toFixed(2) || "—" },
              { label: "الجولة", value: "PGA Tour — الغولف" }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "14px",
                  background: "#f9fafb",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb"
                }}
              >
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, marginBottom: "4px" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Articles liés */}
        {relatedArticles.length > 0 && (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{ width: "5px", height: "26px", borderRadius: "999px", background: theme.primary }} />
              <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>
                أحدث أخبار الغولف
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
              {relatedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}/`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      background: "white",
                      borderRadius: "18px",
                      overflow: "hidden",
                      border: `1px solid ${theme.border}`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
                    }}
                  >
                    <div style={{ padding: "18px" }}>
                      <div
                        style={{
                          display: "inline-block",
                          background: theme.primarySoft,
                          color: theme.primary,
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          marginBottom: "10px"
                        }}
                      >
                        غولف
                      </div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#111827",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {article.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
