export const metadata = {
  title: "About Sports Pulse | Your Arabic Sports News Source",
  description: "Sports Pulse (Nabd Riyadah) is an Arabic sports news site covering football, basketball, tennis, padel, futsal, F1 and golf around the clock.",
  alternates: { canonical: "https://nabdriyadah.com/en/about/" }
};

const stats = [
  { value: "100+",  label: "New articles every day" },
  { value: "20+",   label: "Leagues & tournaments covered" },
  { value: "3",     label: "Languages: Arabic, English, French" },
  { value: "24/7",  label: "Around-the-clock coverage" },
];

const sports = ["Football ⚽", "Basketball 🏀", "Tennis 🎾", "Padel 🏓", "Futsal 🥅", "Formula 1 🏎️", "Golf ⛳"];

export default function AboutPageEn() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "40px 20px 80px", direction: "ltr" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏆</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 900, color: "var(--text-1)", marginBottom: "16px" }}>
            About Sports Pulse
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-2)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
            The leading Arabic sports news platform — delivering real-time coverage of the world's biggest leagues and tournaments.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "16px", marginBottom: "56px" }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: "var(--bg-card)", borderRadius: "20px", padding: "28px 20px",
              border: "1px solid var(--border)", textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: "var(--accent)", marginBottom: "8px" }}>{s.value}</div>
              <div style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sports */}
        <div style={{ background: "var(--bg-card)", borderRadius: "24px", padding: "36px", border: "1px solid var(--border)", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "24px" }}>Sports We Cover</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {sports.map(s => (
              <span key={s} style={{
                background: "var(--bg-page)", border: "1px solid var(--border)",
                borderRadius: "100px", padding: "8px 18px",
                fontSize: "15px", color: "var(--text-1)", fontWeight: 600
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div style={{ background: "var(--bg-card)", borderRadius: "24px", padding: "36px", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "16px" }}>Our Mission</h2>
          <p style={{ color: "var(--text-2)", lineHeight: 1.8, fontSize: "16px", marginBottom: "16px" }}>
            Sports Pulse was created to bring high-quality sports journalism to Arabic-speaking audiences worldwide. We combine automated news gathering with editorial oversight to deliver accurate, timely, and in-depth coverage.
          </p>
          <p style={{ color: "var(--text-2)", lineHeight: 1.8, fontSize: "16px" }}>
            Our content is available in Arabic, English and French — making us the go-to source for sports fans across the Arab world, Europe and beyond.
          </p>
        </div>
      </div>
    </main>
  );
}
