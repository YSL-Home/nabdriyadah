export const metadata = {
  title: "Contact Us | Sports Pulse",
  description: "Get in touch with the Sports Pulse team for corrections, partnerships, or feedback.",
  alternates: { canonical: "https://nabdriyadah.com/en/contact/" }
};

const topics = [
  { icon: "📰", title: "Correction",        desc: "Spotted an error in one of our articles? Let us know immediately." },
  { icon: "🤝", title: "Advertising",        desc: "Inquiries about advertising or commercial partnerships." },
  { icon: "✍️", title: "Content Contribution", desc: "Are you a sports writer? Contact us to discuss collaboration." },
  { icon: "💬", title: "Feedback",           desc: "Your suggestions help us improve continuously." },
];

export default function ContactPageEn() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "40px 20px 80px", direction: "ltr" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, color: "var(--text-1)", marginBottom: "12px" }}>Contact Us</h1>
          <p style={{ fontSize: "18px", color: "var(--text-2)", maxWidth: "520px", margin: "0 auto" }}>
            We're happy to hear from you — our team reads every message and responds as soon as possible.
          </p>
        </div>

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

        <div style={{
          background: "var(--bg-card)", borderRadius: "24px", padding: "40px",
          border: "1px solid var(--border)", textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✉️</div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "12px" }}>Email Us</h2>
          <p style={{ color: "var(--text-2)", marginBottom: "24px" }}>We respond within 24–48 hours on business days.</p>
          <a href="mailto:contact@nabdriyadah.com" style={{
            display: "inline-block", background: "var(--accent)",
            color: "#fff", padding: "14px 32px", borderRadius: "14px",
            fontWeight: 700, fontSize: "16px", textDecoration: "none"
          }}>contact@nabdriyadah.com</a>
        </div>
      </div>
    </main>
  );
}
