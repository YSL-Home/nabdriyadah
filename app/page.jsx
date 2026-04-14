import Link from "next/link";

const articles = [
  {
    title: "فوز ريال مدريد في مباراة مثيرة",
    description: "حقق ريال مدريد فوزًا مهمًا في مباراة قوية ضمن منافسات الدوري.",
    slug: "real-madrid-win",
    keywords: ["ريال مدريد", "الدوري", "كرة القدم"]
  },
  {
    title: "برشلونة يستعد لمواجهة قوية",
    description: "يستعد فريق برشلونة لمباراة حاسمة هذا الأسبوع وسط اهتمام جماهيري كبير.",
    slug: "barcelona-match",
    keywords: ["برشلونة", "مباراة", "كرة القدم"]
  }
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "32px 20px",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(90deg,#2563eb,#7c3aed)",
            borderRadius: "28px",
            padding: "56px 24px",
            textAlign: "center",
            color: "white",
            marginBottom: "40px"
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.1
            }}
          >
            نبض الرياضة
          </h1>

          <p
            style={{
              marginTop: "18px",
              fontSize: "22px",
              opacity: 0.95
            }}
          >
            أخبار - مباشر - فيديو - تحليلات
          </p>
        </section>

        <h2
          style={{
            textAlign: "right",
            marginBottom: "24px",
            fontSize: "32px",
            color: "#111827"
          }}
        >
          أحدث المقالات
        </h2>

        <div style={{ display: "grid", gap: "22px" }}>
          {articles.map((article, index) => (
            <Link key={index} href={`/articles/${article.slug}/`}>
              <article
                style={{
                  background: "white",
                  borderRadius: "22px",
                  padding: "30px",
                  border: "1px solid #e5e7eb"
                }}
              >
                <h3
                  style={{
                    margin: "0 0 14px 0",
                    color: "#111827",
                    fontSize: "30px",
                    lineHeight: 1.5,
                    fontWeight: 800
                  }}
                >
                  {article.title}
                </h3>

                <p
                  style={{
                    margin: "0 0 14px 0",
                    color: "#4b5563",
                    fontSize: "18px",
                    lineHeight: 1.9
                  }}
                >
                  {article.description}
                </p>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280"
                  }}
                >
                  {article.keywords.join(" • ")}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
