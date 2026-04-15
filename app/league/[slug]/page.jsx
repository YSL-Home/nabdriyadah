import Link from "next/link";
import { notFound } from "next/navigation";

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
      canonical: `https://nabdriyadah.com/league/${league.slug}`
    }
  };
}

export default function LeaguePage({ params }) {
  const league = leagues.find((item) => item.slug === params.slug);

  if (!league) {
    notFound();
  }

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
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: "24px",
            color: "#2563eb",
            textDecoration: "none",
            fontWeight: 700
          }}
        >
          العودة إلى الصفحة الرئيسية
        </Link>

        <article
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            border: "1px solid #e5e7eb"
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "16px",
              color: "#111827",
              fontSize: "40px",
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
        </article>
      </div>
    </main>
  );
}
