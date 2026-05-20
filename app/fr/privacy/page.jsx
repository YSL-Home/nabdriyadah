export const metadata = {
  title: "Politique de confidentialité | Sports Pulse",
  description: "Politique de confidentialité de Sports Pulse (nabdriyadah.com) — collecte, utilisation et protection des données.",
  alternates: { canonical: "https://nabdriyadah.com/fr/privacy/" }
};

const sections = [
  { title: "1. Introduction", body: "Bienvenue sur Sports Pulse (nabdriyadah.com). Nous respectons votre vie privée et nous engageons à protéger vos données personnelles. Cette politique explique comment nous collectons les informations lors de votre visite et comment nous les utilisons et les protégeons." },
  { title: "2. Informations collectées", body: "Nous collectons automatiquement certaines informations non personnelles lors de votre visite : adresse IP, type de navigateur, pages consultées et durée de la visite. Nous ne collectons pas directement d'informations personnelles identifiables (nom, e-mail) sans votre consentement explicite." },
  { title: "3. Cookies", body: "Le site utilise des cookies pour améliorer votre expérience de navigation et analyser le trafic via Google Analytics. Google (AdSense) utilise également des cookies pour afficher des publicités personnalisées basées sur vos visites précédentes. Vous pouvez désactiver ces cookies dans les paramètres de votre navigateur." },
  { title: "4. Google AdSense", body: "Nous utilisons Google AdSense pour afficher des publicités sur notre site. Google peut utiliser des cookies pour diffuser des annonces basées sur vos visites de ce site et d'autres sites web. Vous pouvez désactiver la publicité personnalisée via les Paramètres des annonces Google." },
  { title: "5. Partage des données", body: "Nous ne vendons, n'échangeons ni ne transférons vos informations personnelles à des tiers, sauf exigence légale ou nécessité opérationnelle (hébergement, etc.). Google Analytics et AdSense sont les principaux services tiers que nous utilisons." },
  { title: "6. Sécurité des données", body: "Nous mettons en œuvre des mesures de sécurité conformes aux standards du secteur pour protéger les informations transmises et stockées sur notre site. Cependant, aucune transmission sur internet n'est garantie à 100% sécurisée." },
  { title: "7. Vos droits", body: "Vous avez le droit d'accéder, de corriger ou de supprimer toute donnée personnelle que nous pourrions détenir vous concernant. Contactez-nous à contact@nabdriyadah.com pour exercer ces droits." },
  { title: "8. Mises à jour", body: "Nous pouvons mettre à jour cette politique de temps en temps. Nous vous informerons des changements importants en publiant la nouvelle politique sur cette page avec une date de mise à jour." },
];

export default function PrivacyPageFr() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "40px 20px 80px", direction: "ltr" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, color: "var(--text-1)", marginBottom: "8px" }}>Politique de confidentialité</h1>
        <p style={{ color: "var(--text-3)", fontSize: "14px", marginBottom: "40px" }}>Dernière mise à jour : mai 2026</p>
        {sections.map(s => (
          <div key={s.title} style={{
            background: "var(--bg-card)", borderRadius: "20px", padding: "28px 32px",
            border: "1px solid var(--border)", marginBottom: "16px"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-1)", marginBottom: "12px" }}>{s.title}</h2>
            <p style={{ color: "var(--text-2)", lineHeight: 1.8, margin: 0 }}>{s.body}</p>
          </div>
        ))}
        <p style={{ color: "var(--text-3)", fontSize: "13px", textAlign: "center", marginTop: "32px" }}>
          Questions ? Écrivez-nous à <a href="mailto:contact@nabdriyadah.com" style={{ color: "var(--accent)" }}>contact@nabdriyadah.com</a>
        </p>
      </div>
    </main>
  );
}
