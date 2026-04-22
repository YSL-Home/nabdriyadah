import Link from "next/link";
import articles from "../content/articles/seo-articles.json";

export const metadata = {
  title: "نبض الرياضة | أخبار كرة القدم العربية والعالمية",
  description:
    "تابع آخر أخبار كرة القدم العربية والعالمية، مع تغطية يومية، صفحات دوريات مخصصة، ومقالات رياضية محسنة لمحركات البحث.",
  alternates: {
    canonical: "https://nabdriyadah.com/"
  }
};

function getLeagueLabel(slug) {
  if (slug === "premier-league") return "الدوري الإنجليزي الممتاز";
  if (slug === "la-liga") return "الدوري الإسباني";
  return "كرة القدم";
}

function getGroupedArticles() {
  const premierLeague = articles.filter((a) => a.league === "premier-league");
  const laLiga = articles.filter((a) => a.league === "la-liga");
  const mixed = articles.filter((a) => !a.league || a.league === "mixed");

  return { premierLeague, laLiga, mixed };
}

function ArticleCard({ article, compact = false }) {
  return (
    <Link
      href={`/articles/${article.slug}/`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <article
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          height: "100%"
        }}
      >
        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            style={{
              width: "100%",
              height: compact ? "180px" : "220px",
              objectFit: "cover",
              display: "block"
            }}
          />
        )}

        <div style={{ padding: "22px" }}>
          <div
            style={{
              display: "inline-block",
              marginBottom: "12px",
              padding: "7px 12px",
              borderRadius: "999px",
              background: "#eff6ff",
              color: "#2563eb",
              fontSize: "13px",
              fontWeight: 700
            }}
          >
            {getLeagueLabel(article.league)}
          </div>

          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: compact ? "26px" : "30px",
              lineHeight: 1.45,
              color: "#111827"
            }}
          >
            {article.title}
          </h3>

          <p
            style={{
              margin: 0,
              color: "#4b5563",
              fontSize: "17px",
              lineHeight: 1.9
            }}
          >
            {article.description}
          </p>
        </div>
      </article>
    </Link>
  );
}

export default function HomePage() {
  const { premierLeague, laLiga, mixed } = getGroupedArticles();
  const featured = articles.slice(0, 4);
  const latest = articles.slice(0, 8);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        direction: "rtl",
        fontFamily: "Arial, sans-serif",
        padding: "28px 18px 60px"
      }}
    >
      <div style={{ maxWidth: "1450px", margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(135deg,#1d4ed8,#7c3aed)",
            color: "white",
            borderRadius: "30px",
            padding: "56px 28px",
            marginBottom: "34px",
            boxShadow: "0 18px 50px rgba(37,99,235,0.22)"
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.16)",
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "16px"
            }}
          >
            موقع رياضي عربي
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "64
