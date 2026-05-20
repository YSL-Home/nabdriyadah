export const metadata = {
  title: "À propos de Sports Pulse | Actualités sportives arabes",
  description: "Sports Pulse (Nabd Riyadah) est un site d'actualités sportives arabophones couvrant le football, le basket, le tennis, le padel, le futsal, la F1 et le golf 24h/24.",
  alternates: { canonical: "https://nabdriyadah.com/fr/about/" }
};

const stats = [
  { value: "100+",  label: "Nouveaux articles par jour" },
  { value: "20+",   label: "Ligues & tournois couverts" },
  { value: "3",     label: "Langues : arabe, anglais, français" },
  { value: "24/7",  label: "Couverture en continu" },
];

const sports = ["Football ⚽", "Basketball 🏀", "Tennis 🎾", "Padel 🏓", "Futsal 🥅", "Formule 1 🏎️", "Golf ⛳"];

export default function AboutPageFr() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "40px 20px 80px", direction: "ltr" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏆</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 900, color: "var(--text-1)", marginBottom: "16px" }}>
            À propos de Sports Pulse
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-2)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
            La principale plateforme d'actualités sportives en arabe — une couverture en temps réel des plus grandes ligues et compétitions mondiales.
          </p>
        </div>

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

        <div style={{ background: "var(--bg-card)", borderRadius: "24px", padding: "36px", border: "1px solid var(--border)", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "24px" }}>Sports couverts</h2>
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

        <div style={{ background: "var(--bg-card)", borderRadius: "24px", padding: "36px", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "16px" }}>Notre mission</h2>
          <p style={{ color: "var(--text-2)", lineHeight: 1.8, fontSize: "16px", marginBottom: "16px" }}>
            Sports Pulse a été créé pour apporter un journalisme sportif de qualité aux audiences arabophones du monde entier. Nous combinons collecte automatisée d'actualités et supervision éditoriale pour une couverture précise, rapide et approfondie.
          </p>
          <p style={{ color: "var(--text-2)", lineHeight: 1.8, fontSize: "16px" }}>
            Notre contenu est disponible en arabe, anglais et français — faisant de nous la référence pour les fans de sport du monde arabe, d'Europe et d'ailleurs.
          </p>
        </div>
      </div>
    </main>
  );
}
