export const metadata = {
  title: "عن نبض الرياضة | موقعك العربي للأخبار الرياضية",
  description: "نبض الرياضة — موقع إخباري رياضي عربي يقدم تغطية يومية لأبرز أحداث كرة القدم والدوريات الكبرى حول العالم.",
  alternates: { canonical: "https://nabdriyadah.com/about/" }
};

const stats = [
  { value: "+100",   label: "مقال جديد كل يوم" },
  { value: "20+",    label: "دوري وبطولة مغطّاة" },
  { value: "3",      label: "لغات: عربي، إنجليزي، فرنسي" },
  { value: "24/7",   label: "تغطية على مدار الساعة" },
];

const sports = ["كرة القدم ⚽", "كرة السلة 🏀", "التنس 🎾", "البادل 🏓", "كرة قدم الصالات 🥅", "الفورمولا 1 🏎️", "الغولف ⛳"];

export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "40px 20px 80px", direction: "rtl" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚡</div>
          <h1 style={{ fontSize: "clamp(28px,6vw,48px)", fontWeight: 900, color: "var(--text-1)", margin: "0 0 16px" }}>
            نبض الرياضة
          </h1>
          <p style={{ fontSize: "clamp(16px,2.5vw,20px)", color: "var(--text-2)", maxWidth: "620px", margin: "0 auto", lineHeight: 1.75 }}>
            موقعك العربي للأخبار الرياضية — تغطية فورية ومتجددة لأبرز أحداث الملاعب حول العالم
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: "var(--bg-card)", borderRadius: "20px", padding: "28px 20px",
              border: "1px solid var(--border)", textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--accent)", marginBottom: "8px" }}>{s.value}</div>
              <div style={{ fontSize: "14px", color: "var(--text-2)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <section style={{
          background: "var(--bg-card)", borderRadius: "24px", padding: "36px",
          border: "1px solid var(--border)", marginBottom: "28px"
        }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "16px" }}>رسالتنا</h2>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.9, margin: 0 }}>
            أُسِّس موقع نبض الرياضة بهدف تقديم أخبار رياضية موثوقة ومحايدة باللغة العربية، تواكب إيقاع الحدث لحظةً بلحظة.
            نؤمن بأن المشجّع العربي يستحق تغطية احترافية بلغته الأم، بعيداً عن الترجمة الآلية وقريباً من روح الملعب.
          </p>
        </section>

        {/* Sports */}
        <section style={{
          background: "var(--bg-card)", borderRadius: "24px", padding: "36px",
          border: "1px solid var(--border)", marginBottom: "28px"
        }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "20px" }}>الرياضات المغطّاة</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {sports.map(s => (
              <span key={s} style={{
                background: "var(--accent-soft)", color: "var(--accent)", borderRadius: "999px",
                padding: "8px 20px", fontSize: "15px", fontWeight: 600
              }}>{s}</span>
            ))}
          </div>
        </section>

        {/* Leagues */}
        <section style={{
          background: "var(--bg-card)", borderRadius: "24px", padding: "36px",
          border: "1px solid var(--border)", marginBottom: "28px"
        }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "16px" }}>التغطية الجغرافية</h2>
          <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.9, margin: 0 }}>
            نغطّي الدوريات الأوروبية الكبرى (الدوري الإنجليزي، الإسباني، الألماني، الإيطالي، الفرنسي)
            ودوري أبطال أوروبا، إلى جانب تغطية واسعة للبطولات العربية والأفريقية:
            الدوري الجزائري، الدوري المصري الممتاز، البطولة المغربية، والرابطة التونسية المحترفة.
          </p>
        </section>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <a href="/" style={{
            display: "inline-block", background: "var(--accent)", color: "#fff",
            padding: "14px 40px", borderRadius: "999px", fontWeight: 800,
            fontSize: "16px", textDecoration: "none"
          }}>
            اقرأ أحدث الأخبار →
          </a>
        </div>

      </div>
    </main>
  );
}
