import Link from "next/link";
import { notFound } from "next/navigation";

const articles = [
  {
    title: "فوز ريال مدريد في مباراة مثيرة",
    description: "حقق ريال مدريد فوزًا مهمًا في مباراة قوية ضمن منافسات الدوري.",
    slug: "real-madrid-win",
    keywords: ["ريال مدريد", "الدوري", "كرة القدم"],
    content:
      "حقق ريال مدريد فوزًا مهمًا في مباراة قوية ضمن منافسات الدوري. شهدت المواجهة أداءً مميزًا من الفريق وتفاعلاً كبيرًا من الجماهير، في لقاء حمل الكثير من الندية والإثارة حتى الدقائق الأخيرة."
  },
  {
    title: "برشلونة يستعد لمواجهة قوية",
    description: "يستعد فريق برشلونة لمباراة حاسمة هذا الأسبوع وسط اهتمام جماهيري كبير.",
    slug: "barcelona-match",
    keywords: ["برشلونة", "مباراة", "كرة القدم"],
    content:
      "يستعد فريق برشلونة لمباراة حاسمة هذا الأسبوع وسط متابعة جماهيرية واسعة. ويأمل الجهاز الفني في تقديم أداء قوي وتحقيق نتيجة إيجابية تعزز وضع الفريق في المنافسة."
  }
];

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug
  }));
}

export function generateMetadata({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    return {
      title: "مقال غير موجود | نبض الرياضة"
    };
  }

  return {
    title: `${article.title} | نبض الرياضة`,
    description: article.description
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
            {article.keywords.join(" • ")}
          </div>

          <div
            style={{
              color: "#111827",
              fontSize: "19px",
              lineHeight: 2.1,
              whiteSpace: "pre-wrap"
            }}
          >
            {article.content}
          </div>
        </article>
      </div>
    </main>
  );
}
