import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../data/seo-articles.json";

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export function generateMetadata({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    return {
      title: "مقال غير موجود | نبض الرياضة",
      description: "هذا المقال غير متوفر حالياً.",
    };
  }

  return {
    title: `${article.title} | نبض الرياضة`,
    description: article.description || "أحدث الأخبار الرياضية العربية",
  };
}

export default function ArticlePage({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "32px 20px",
        direction: "rtl",
        fontFamily: "Arial, sans-serif",
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
            fontWeight: 700,
          }}
        >
          العودة إلى الصفحة الرئيسية
        </Link>

        <article
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "16px",
              color: "#111827",
              fontSize: "40px",
              lineHeight: 1.5,
            }}
          >
            {article.title}
          </h1>

          <p
            style={{
              color: "#4b5563",
              fontSize: "20px",
              lineHeight: 2,
              marginBottom: "24px",
            }}
          >
            {article.description}
          </p>

          <div
            style={{
              fontSize: "15px",
              color: "#6b7280",
              marginBottom: "24px",
            }}
          >
            {Array.isArray(article.keywords) ? article.keywords.join(" • ") : ""}
          </div>

          <div
            style={{
              color: "#111827",
              fontSize: "19px",
              lineHeight: 2.1,
              whiteSpace: "pre-wrap",
            }}
          >
            {article.content || "المحتوى غير متوفر حالياً."}
          </div>
        </article>
      </div>
    </main>
  );
}
