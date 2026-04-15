import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug
  }));
}

export function generateMetadata({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    return {
      title: "مقال غير موجود",
      description: "هذا المقال غير متوفر حالياً."
    };
  }

  return {
    title: article.title,
    description: article.description || "أحدث الأخبار الرياضية العربية",
    keywords: article.keywords || [],
    alternates: {
      canonical: `https://nabdriyadah.com/articles/${article.slug}`
    },
    openGraph: {
      title: article.title,
      description: article.description || "أحدث الأخبار الرياضية العربية",
      url: `https://nabdriyadah.com/articles/${article.slug}`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description || "أحدث الأخبار الرياضية العربية"
    }
  };
}

export default function ArticlePage({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    inLanguage: "ar",
    mainEntityOfPage: `https://nabdriyadah.com/articles/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: "نبض الرياضة"
    }
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            {article.title}
          </h1>

          <p
            style={{
              color: "#4b5563",
              fontSize: "20px",
              lineHeight: 2,
              marginBottom: "24px"
            }}
          >
            {article.description}
          </p>

          <div
            style={{
              fontSize: "15px",
              color: "#6b7280",
              marginBottom: "24px"
            }}
          >
            {(article.keywords || []).join(" • ")}
          </div>

          <div
            style={{
              color: "#111827",
              fontSize: "19px",
              lineHeight: 2.1,
              whiteSpace: "pre-wrap"
            }}
          >
            {article.content || "المحتوى غير متوفر حالياً."}
          </div>
        </article>
      </div>
    </main>
  );
}
