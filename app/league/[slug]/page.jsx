import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";

const leagues = [
  {
    slug: "premier-league",
    title: "الدوري الإنجليزي الممتاز",
    description: "آخر أخبار وتحليلات ونتائج الدوري الإنجليزي الممتاز.",
    content:
      "تابع آخر أخبار الدوري الإنجليزي الممتاز، مواعيد المباريات، النتائج، والتحليلات الكاملة لأهم الفرق والنجوم."
  },
  {
    slug: "la-liga",
    title: "الدوري الإسباني",
    description: "آخر أخبار وتحليلات ونتائج الدوري الإسباني.",
    content:
      "تابع آخر أخبار الدوري الإسباني، نتائج المباريات، وتحليلات أبرز مواجهات ريال مدريد وبرشلونة وباقي الأندية."
  }
];

export function generateStaticParams() {
  return leagues.map((league) => ({
    slug: league.slug
  }));
}

export function generateMetadata({ params }) {
  const league = leagues.find((item) => item.slug === params.slug);

  if (!league) {
    return {
      title: "بطولة غير موجودة",
      description: "هذه الصفحة غير متوفرة حالياً."
    };
  }

  return {
    title: league.title,
    description: league.description,
    alternates: {
      canonical: `https://nabdriyadah.com/league/${league.slug}/`
    }
  };
}

export default function LeaguePage({ params }) {
  const league = leagues.find((item) => item.slug === params.slug);

  if (!league) {
    notFound();
  }

  const relatedArticles = articles.slice(0, 4);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "32px 20px",
        direction: "rtl",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            border: "1px solid #e5e7eb",
            marginBottom: "28px"
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginBottom: "20px",
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 700
            }}
          >
            العودة إلى الصفحة الرئيسية
          </Link>

          <h1
            style={{
              marginTop: 0,
              marginBottom: "16px",
              color: "#111827",
              fontSize: "42px",
              lineHeight: 1.5
            }}
          >
            {league.title}
          </h1>

          <p
            style={{
              color: "#4b5563",
              fontSize: "20px",
              lineHeight: 2,
              marginBottom: "24px"
            }}
          >
            {league.description}
          </p>

          <div
            style={{
              color: "#111827",
              fontSize: "19px",
              lineHeight: 2.1,
              whiteSpace: "pre-wrap"
            }}
          >
            {league.content}
          </div>
        </div>

        <section>
          <h2
            style={{
              fontSize: "30px",
              color: "#111827",
              marginBottom: "20px"
            }}
          >
            مقالات مرتبطة
          </h2>

          <div style={{ display: "grid", gap: "18px" }}>
            {relatedArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}/`}
                style={{ textDecoration: "none" }}
              >
                <article
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "24px",
                    border: "1px solid #e5e7eb"
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "#111827",
                      fontSize: "24px",
                      lineHeight: 1.7
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
                </article>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
