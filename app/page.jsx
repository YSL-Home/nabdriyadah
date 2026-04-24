import Link from "next/link";
import articles from "../content/articles/seo-articles.json";

export const metadata = {
  title: "أخبار الرياضة العربية والعالمية",
  description:
    "تابع أحدث أخبار كرة القدم، كرة السلة، التنس، البادل والرياضات الأخرى مع تغطية يومية وتحليلات خاصة.",
  alternates: { canonical: "https://nabdriyadah.com/" }
};

const sportCards = [
  { slug: "premier-league", href: "/league/premier-league/", title: "الدوري الإنجليزي الممتاز", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#6d28d9", bg: "#ede9fe", border: "#ddd6fe" },
  { slug: "la-liga", href: "/league/la-liga/", title: "الدوري الإسباني", icon: "🇪🇸", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  { slug: "basketball", href: "/sport/basketball/", title: "كرة السلة", icon: "🏀", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
  { slug: "tennis", href: "/sport/tennis/", title: "التنس", icon: "🎾", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  { slug: "padel", href: "/sport/padel/", title: "البادل", icon: "🏸", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  { slug: "futsal", href: "/sport/futsal/", title: "كرة قدم الصالات", icon: "⚽", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }
];

function sportLabelAr(league, sport) {
  if (league === "premier-league") return "الدوري الإنجليزي";
  if (league === "la-liga") return "الدوري الإسباني";
  if (sport === "basketball") return "كرة السلة";
  if (sport === "tennis") return "التنس";
  if (sport === "padel") return "البادل";
  if (sport === "futsal") return "الصالات";
  return "كرة القدم";
}

function sportColor(league, sport) {
  if (league === "premier-league") return { bg: "#ede9fe", color: "#6d28d9" };
  if (league === "la-liga") return { bg: "#fff7ed", color: "#ea580c" };
  if (sport === "basketball") return { bg: "#fff7ed", color: "#c2410c" };
  if (sport === "tennis") return { bg: "#f0fdf4", color: "#15803d" };
  if (sport === "padel") return { bg: "#eff6ff", color: "#1d4ed8" };
  if (sport === "futsal") return { bg: "#f5f3ff", color: "#7c3aed" };
  return { bg: "#eff6ff", color: "#2563eb" };
}

export default function HomePage() {
  const latest = articles.slice(0, 8);
  const footballLatest = articles.filter((a) => !a.sport || a.sport === "football").slice(0, 4);
  const otherSports = articles.filter((a) => a.sport && a.sport !== "football").slice(0, 4);

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px 52px", background: "#f3f4f6", direction: "rtl" }}>
      <div style={{ maxWidth: "1420px", margin: "0 auto" }}>

        {/* Hero */}
        <section
          style={{
            background: "linear-gradient(135deg, #0f172a, #1d4ed8, #7c3aed)",
            borderRadius: "34px",
            padding: "52px 34px",
            color: "white",
            marginBottom: "28px",
            boxShadow: "0 20px 50px rgba(29,78,216,0.2)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "280px", height: "280px", borderRadius: "999px", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: "-60px", left: "10%", width: "200px", height: "200px", borderRadius: "999px", background: "rgba(255,255,255,0.05)" }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.14)", padding: "10px 16px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, marginBottom: "18px" }}>
              منصة رياضية عربية متعددة الرياضات
            </div>

            <h1 style={{ margin: "0 0 14px 0", fontSize: "64px", lineHeight: 1.15, fontWeight: 800 }}>
              نبض الرياضة
            </h1>

            <p style={{ margin: "0 0 24px 0", maxWidth: "800px", fontSize: "22px", lineHeight: 1.9, opacity: 0.95 }}>
              تغطية عربية يومية لأبرز أخبار كرة القدم، كرة السلة، التنس، البادل، وكرة قدم الصالات — كل الرياضة في مكان واحد.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["كرة القدم", "كرة السلة", "التنس", "البادل", "الصالات", "انتقالات", "نتائج مباشرة"].map((tag) => (
                <span key={tag} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.18)", padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Sports navigation grid */}
        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: 800, color: "#111827" }}>الأقسام الرياضية</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "14px" }}>
            {sportCards.map((card) => (
              <Link key={card.slug} href={card.href} style={{ textDecoration: "none", color: "inherit" }}>
                <div
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                    borderRadius: "22px",
                    padding: "20px 14px",
                    textAlign: "center",
                    transition: "transform 0.15s"
                  }}
                >
                  <div style={{ fontSize: "34px", marginBottom: "10px" }}>{card.icon}</div>
                  <div style={{ color: card.color, fontSize: "15px", fontWeight: 800, lineHeight: 1.5 }}>
                    {card.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest articles */}
        <section style={{ marginBottom: "34px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "12px", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: "36px", fontWeight: 800, color: "#111827" }}>أحدث الأخبار</h2>
            <div style={{ color: "#6b7280", fontSize: "15px" }}>آخر المواد المنشورة على الموقع</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "22px" }}>
            {latest.map((article) => {
              const { bg, color } = sportColor(article.league, article.sport);
              return (
                <Link key={article.slug} href={`/articles/${article.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                  <article style={{ background: "white", borderRadius: "22px", overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 12px 30px rgba(0,0,0,0.05)", height: "100%" }}>
                    <img src={article.image} alt={article.title} style={{ width: "100%", height: "210px", objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "20px" }}>
                      <div style={{ display: "inline-block", marginBottom: "10px", padding: "6px 12px", borderRadius: "999px", background: bg, color, fontSize: "12px", fontWeight: 700 }}>
                        {sportLabelAr(article.league, article.sport)}
                      </div>
                      <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", lineHeight: 1.6, fontWeight: 800, color: "#111827" }}>
                        {article.title}
                      </h3>
                      <p style={{ margin: 0, color: "#4b5563", fontSize: "14px", lineHeight: 1.85 }}>
                        {article.description}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Football + Other sports side by side */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "26px" }}>
          {/* Football */}
          <div style={{ background: "white", borderRadius: "24px", padding: "24px", border: "1px solid #e5e7eb", boxShadow: "0 10px 26px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>⚽ كرة القدم</h2>
              <Link href="/league/premier-league/" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
                عرض المزيد
              </Link>
            </div>
            <div style={{ display: "grid", gap: "14px" }}>
              {footballLatest.map((article) => (
                <Link key={article.slug} href={`/articles/${article.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ paddingBottom: "14px", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.65, marginBottom: "5px" }}>{article.title}</div>
                    <div style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.75 }}>{article.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Other sports */}
          <div style={{ background: "white", borderRadius: "24px", padding: "24px", border: "1px solid #e5e7eb", boxShadow: "0 10px 26px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>🏆 رياضات أخرى</h2>
            </div>
            {otherSports.length > 0 ? (
              <div style={{ display: "grid", gap: "14px" }}>
                {otherSports.map((article) => {
                  const { bg, color } = sportColor(article.league, article.sport);
                  return (
                    <Link key={article.slug} href={`/articles/${article.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={{ paddingBottom: "14px", borderBottom: "1px solid #f3f4f6", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "999px", background: bg, color, fontSize: "12px", fontWeight: 700, flexShrink: 0, marginTop: "4px" }}>
                          {sportLabelAr(article.league, article.sport)}
                        </span>
                        <div>
                          <div style={{ fontSize: "17px", fontWeight: 800, lineHeight: 1.6, marginBottom: "4px" }}>{article.title}</div>
                          <div style={{ color: "#6b7280", fontSize: "13px", lineHeight: 1.7 }}>{article.description}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "#9ca3af", fontSize: "16px", lineHeight: 1.9, padding: "20px 0" }}>
                جارٍ تجميع أخبار كرة السلة، التنس، البادل والصالات. ستظهر تلقائياً في التحديث القادم.
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
