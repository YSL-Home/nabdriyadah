export const metadata = {
  title: "Privacy Policy | Sports Pulse",
  description: "Privacy policy for Sports Pulse (nabdriyadah.com) — how we collect, use and protect your data.",
  alternates: { canonical: "https://nabdriyadah.com/en/privacy/" }
};

const sections = [
  { title: "1. Introduction", body: "Welcome to Sports Pulse (nabdriyadah.com). We respect your privacy and are committed to protecting your personal data. This policy explains how we collect information when you visit our site and how we use and safeguard it." },
  { title: "2. Information We Collect", body: "We automatically collect certain non-personal information when you visit the site, including: IP address, browser type, pages visited, and visit duration. We do not directly collect personally identifiable information such as your name or email address without your explicit consent." },
  { title: "3. Cookies", body: "The site uses cookies to improve your browsing experience and analyse traffic via Google Analytics. Google (AdSense) also uses cookies to display personalised ads based on your previous visits. You can disable these cookies in your browser settings at any time." },
  { title: "4. Google AdSense", body: "We use Google AdSense to display ads on our site. Google may use cookies and web beacons to serve ads based on your visits to this and other websites. You can opt out of personalised advertising at Google's Ads Settings page." },
  { title: "5. Data Sharing", body: "We do not sell, trade, or transfer your personal information to third parties except as required by law or to operate the site (e.g., hosting providers). Google Analytics and AdSense are the primary third-party services we use." },
  { title: "6. Data Security", body: "We implement industry-standard security measures to protect information transmitted to and stored on our site. However, no method of transmission over the internet is 100% secure." },
  { title: "7. Your Rights", body: "You have the right to access, correct, or delete any personal data we may hold about you. Contact us at contact@nabdriyadah.com to exercise these rights." },
  { title: "8. Policy Updates", body: "We may update this privacy policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date." },
];

export default function PrivacyPageEn() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "40px 20px 80px", direction: "ltr" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, color: "var(--text-1)", marginBottom: "8px" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-3)", fontSize: "14px", marginBottom: "40px" }}>Last updated: May 2026</p>
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
          Questions? Email us at <a href="mailto:contact@nabdriyadah.com" style={{ color: "var(--accent)" }}>contact@nabdriyadah.com</a>
        </p>
      </div>
    </main>
  );
}
