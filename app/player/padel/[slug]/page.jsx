import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import articles from "../../../../content/articles/seo-articles.json";

function loadPadelTop40() {
  try {
    const p = path.join(process.cwd(), "content/players/padel-top40.json");
    const d = JSON.parse(fs.readFileSync(p, "utf-8"));
    return [...(d.men || []), ...(d.women || [])];
  } catch {
    return [];
  }
}

export function generateStaticParams() {
  const players = loadPadelTop40();
  return players.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const players = loadPadelTop40();
  const player = players.find((p) => p.slug === params.slug);
  if (!player) return { title: "لاعب غير موجود" };

  const genderLabel = player.gender === "F" ? "سيدات" : "رجال";
  return {
    title: `${player.nameAr} — المركز ${player.rank} Premier Padel ${genderLabel} | نبض الرياضة`,
    description: `صفحة لاعب البادل ${player.nameAr}، المركز ${player.rank} في تصنيف Premier Padel ${genderLabel} بـ ${player.points?.toLocaleString()} نقطة.`,
    alternates: {
      canonical: `https://nabdriyadah.com/player/padel/${params.slug}/`
    },
    openGraph: {
      title: `${player.nameAr} — البادل`,
      description: `تصنيف ${player.nameAr} في Premier Padel`,
      url: `https://nabdriyadah.com/player/padel/${params.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "profile"
    }
  };
}

export default function PadelPlayerPage({ params }) {
  const players = loadPadelTop40();
  const player = players.find((p) => p.slug === params.slug);

  if (!player) {
    notFound();
  }

  const isWoman = player.gender === "F";
  const genderLabel = isWoman ? "سيدات" : "رجال";

  const theme = {
    heroFrom: "#2e1065",
    heroTo: "#7c3aed",
    primary: "#7c3aed",
    primarySoft: "#ede9fe",
    border: "#ddd6fe",
    pageBg: "#f5f3ff"
  };

  const relatedArticles = articles
    .filter((a) => a.slug && a.sport === "padel")
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 6);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": player.name,
    "alternateName": player.nameAr,
    "nationality": player.countryAr || player.country,
    "url": `https://nabdriyadah.com/player/padel/${player.slug}/`,
    "description": `لاعب البادل ${player.nameAr}، المركز ${player.rank} في تصنيف Premier Padel ${genderLabel} بـ ${player.points?.toLocaleString()} نقطة.`
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
            href="/league/padel-premier/"
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
            ← العودة إلى تصنيف Premier Padel
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
              <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: 600 }}>PADEL</span>
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
                Premier Padel — {genderLabel}
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
            { label: "التصنيف العالمي", value: `#${player.rank}`, color: theme.primary },
            { label: "نقاط Premier Padel", value: player.points?.toLocaleString() || "—", color: "#374151" },
            { label: "الجنسية", value: player.countryAr || player.country, color: "#374151" },
            { label: "الفئة", value: genderLabel, color: theme.primary }
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
              { label: "التصنيف الحالي", value: `#${player.rank} Premier Padel` },
              { label: "النقاط", value: player.points?.toLocaleString() || "—" },
              { label: "الفئة", value: `Premier Padel (${genderLabel})` }
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
                أحدث أخبار البادل
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
                        بادل
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
