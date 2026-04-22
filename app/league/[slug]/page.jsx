import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";

const leagueMap = {
  "premier-league": {
    title: "الدوري الإنجليزي الممتاز",
    description:
      "تابع آخر أخبار الدوري الإنجليزي الممتاز، أبرز المستجدات، والتحليلات الخاصة بالأندية واللاعبين."
  },
  "la-liga": {
    title: "الدوري الإسباني",
    description:
      "أحدث أخبار الدوري الإسباني مع متابعة خاصة لريال مدريد وبرشلونة وأبرز ملفات الليغا."
  }
};

export function generateStaticParams() {
  return Object.keys(leagueMap).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const league = leagueMap[params.slug];

  if (!league) {
    return {
      title: "القسم غير موجود",
      description: "هذه الصفحة غير متاحة حالياً."
    };
  }

  return {
    title: league.title,
    description: league.description,
    alternates: {
      canonical: `https://nabdriyadah.com/league/${params.slug}/`
    },
    openGraph: {
      title: league.title,
      description: league.description,
      url: `https://nabdriyadah.com/league/${params.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "website"
    }
  };
}

export default function LeaguePage({ params }) {
  const league = leagueMap[params.slug];

  if (!league) {
    notFound();
  }

  const leagueArticles = articles.filter((article) => article.league === params.slug);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "32px 20px 48px",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <section
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "34px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 12px 30px rgba(0,0,0,0.04)",
            marginBottom: "28px"
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-block",
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "14px",
              marginBottom: "14px"
            }}
          >
            العودة إلى الرئيسية
          </Link>

          <h1
            style={{
              margin: "0 0 14px 0",
              fontSize: "48px",
              lineHeight: 1.4,
              fontWeight: 800
            }}
          >
            {league.title}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "20px",
              lineHeight: 1.95,
              color: "#4b5563"
            }}
          >
            {league.description}
          </p>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "22px"
          }}
        >
          {leagueArticles.map((article) => (
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
                    height: "220px",
                    objectFit: "cover",
                    display: "block"
                  }}
                />

                <div style={{ padding: "22px" }}>
                  <h2
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "22px",
                      lineHeight: 1.6,
                      fontWeight: 800
                    }}
                  >
                    {article.title}
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
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
      </div>
    </main>
  );
}
