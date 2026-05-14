export const metadata = {
  title: "اتصل بنا | نبض الرياضة",
  description: "تواصل مع فريق نبض الرياضة لأي استفسار أو اقتراح أو شراكة إعلانية.",
  alternates: { canonical: "https://nabdriyadah.com/contact/" }
};

const topics = [
  { icon: "📰", title: "تصحيح معلومة",   desc: "إذا لاحظت خطأً في أحد مقالاتنا، أخبرنا فوراً." },
  { icon: "🤝", title: "شراكة إعلانية",  desc: "للاستفسار عن الإعلانات والتعاون التجاري." },
  { icon: "✍️", title: "مساهمة بمحتوى", desc: "هل أنت كاتب رياضي؟ تواصل معنا لمناقشة التعاون." },
  { icon: "💬", title: "اقتراح أو ملاحظة", desc: "آراؤكم تساعدنا على التحسين المستمر." },
];

export default function ContactPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "40px 20px 80px", direction: "rtl" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, color: "var(--text-1)", marginBottom: "12px" }}>
            اتصل بنا
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-2)", maxWidth: "520px", margin: "0 auto" }}>
            نسعد بتواصلكم — فريقنا يقرأ كل رسالة ويردّ في أقرب وقت ممكن
          </p>
        </div>

        {/* Topics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "40px" }}>
          {topics.map(t => (
            <div key={t.title} style={{
              background: "var(--bg-card)", borderRadius: "20px", padding: "24px",
              border: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{t.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-1)", marginBottom: "8px" }}>{t.title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Email CTA */}
        <div style={{
          background: "var(--bg-card)", borderRadius: "24px", padding: "40px",
          border: "1px solid var(--border)", textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✉️</div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "12px" }}>
            راسلنا عبر البريد الإلكتروني
          </h2>
          <p style={{ fontSize: "16px", color: "var(--text-2)", marginBottom: "24px" }}>
            للتواصل المباشر مع فريق نبض الرياضة:
          </p>
          <a
            href="mailto:contact@nabdriyadah.com"
            style={{
              display: "inline-block", background: "var(--accent)", color: "#fff",
              padding: "14px 40px", borderRadius: "999px", fontWeight: 800,
              fontSize: "16px", textDecoration: "none", letterSpacing: "0.3px"
            }}
          >
            contact@nabdriyadah.com
          </a>
          <p style={{ marginTop: "20px", fontSize: "13px", color: "var(--text-3)" }}>
            نردّ خلال 24-48 ساعة عادةً
          </p>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "اتصل بنا — نبض الرياضة",
          "url": "https://nabdriyadah.com/contact/",
          "publisher": { "@type": "Organization", "name": "نبض الرياضة", "url": "https://nabdriyadah.com" }
        })}} />

      </div>
    </main>
  );
}
