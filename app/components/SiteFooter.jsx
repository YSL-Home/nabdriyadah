import Link from "next/link";

const FOOTER_LINKS = {
  ar: {
    site: "نبض الرياضة",
    tagline: "تغطية رياضية عربية على مدار الساعة",
    copyright: "جميع الحقوق محفوظة",
    sections: [
      {
        title: "الرياضات",
        links: [
          { label: "كرة القدم", href: "/sport/football/" },
          { label: "كرة السلة", href: "/sport/basketball/" },
          { label: "التنس", href: "/sport/tennis/" },
          { label: "البادل", href: "/sport/padel/" },
          { label: "فورمولا 1", href: "/sport/f1/" },
          { label: "الغولف", href: "/sport/golf/" },
        ]
      },
      {
        title: "الدوريات",
        links: [
          { label: "الدوري الإنجليزي", href: "/league/premier-league/" },
          { label: "الدوري الإسباني", href: "/league/la-liga/" },
          { label: "دوري أبطال أوروبا", href: "/league/champions-league/" },
          { label: "البوندسليغا", href: "/league/bundesliga/" },
          { label: "الدوري الإيطالي", href: "/league/serie-a/" },
          { label: "الدوري السعودي", href: "/league/saudi-pro-league/" },
          { label: "الدوري المصري", href: "/league/prem-egy/" },
          { label: "البطولة المغربية", href: "/league/botola/" },
          { label: "NBA", href: "/sport/basketball/" },
        ]
      },
      {
        title: "الموقع",
        links: [
          { label: "جميع المقالات", href: "/articles/" },
          { label: "من نحن", href: "/about/" },
          { label: "اتصل بنا", href: "/contact/" },
          { label: "سياسة الخصوصية", href: "/privacy/" },
          { label: "English", href: "/en/" },
          { label: "Français", href: "/fr/" },
        ]
      }
    ]
  },
  en: {
    site: "Sports Pulse",
    tagline: "Arabic sports news around the clock",
    copyright: "All rights reserved",
    sections: [
      {
        title: "Sports",
        links: [
          { label: "Football", href: "/en/sport/football/" },
          { label: "Basketball", href: "/en/sport/basketball/" },
          { label: "Tennis", href: "/en/sport/tennis/" },
          { label: "Padel", href: "/en/sport/padel/" },
          { label: "Formula 1", href: "/en/sport/f1/" },
          { label: "Golf", href: "/en/sport/golf/" },
        ]
      },
      {
        title: "Leagues",
        links: [
          { label: "Premier League", href: "/league/premier-league/" },
          { label: "La Liga", href: "/league/la-liga/" },
          { label: "Champions League", href: "/league/champions-league/" },
          { label: "Bundesliga", href: "/league/bundesliga/" },
          { label: "Serie A", href: "/league/serie-a/" },
          { label: "Saudi Pro League", href: "/league/saudi-pro-league/" },
          { label: "Egyptian Premier League", href: "/league/prem-egy/" },
          { label: "Botola Pro", href: "/league/botola/" },
          { label: "NBA", href: "/sport/basketball/" },
        ]
      },
      {
        title: "Site",
        links: [
          { label: "All Articles", href: "/articles/" },
          { label: "About", href: "/about/" },
          { label: "Contact", href: "/contact/" },
          { label: "Privacy Policy", href: "/privacy/" },
          { label: "عربي", href: "/" },
          { label: "Français", href: "/fr/" },
        ]
      }
    ]
  },
  fr: {
    site: "Sports Pulse",
    tagline: "L'actualité sportive arabe en continu",
    copyright: "Tous droits réservés",
    sections: [
      {
        title: "Sports",
        links: [
          { label: "Football", href: "/fr/sport/football/" },
          { label: "Basketball", href: "/fr/sport/basketball/" },
          { label: "Tennis", href: "/fr/sport/tennis/" },
          { label: "Padel", href: "/fr/sport/padel/" },
          { label: "Formule 1", href: "/fr/sport/f1/" },
          { label: "Golf", href: "/fr/sport/golf/" },
        ]
      },
      {
        title: "Ligues",
        links: [
          { label: "Premier League", href: "/league/premier-league/" },
          { label: "Liga", href: "/league/la-liga/" },
          { label: "Ligue des Champions", href: "/league/champions-league/" },
          { label: "Bundesliga", href: "/league/bundesliga/" },
          { label: "Serie A", href: "/league/serie-a/" },
          { label: "Championnat d'Arabie Saoudite", href: "/league/saudi-pro-league/" },
          { label: "Championnat d'Égypte", href: "/league/prem-egy/" },
          { label: "Botola Pro", href: "/league/botola/" },
          { label: "NBA", href: "/sport/basketball/" },
        ]
      },
      {
        title: "Site",
        links: [
          { label: "Tous les articles", href: "/articles/" },
          { label: "À propos", href: "/about/" },
          { label: "Contact", href: "/contact/" },
          { label: "Politique de confidentialité", href: "/privacy/" },
          { label: "عربي", href: "/" },
          { label: "English", href: "/en/" },
        ]
      }
    ]
  }
};

export default function SiteFooter({ lang = "ar" }) {
  const t = FOOTER_LINKS[lang] || FOOTER_LINKS.ar;
  const isRTL = lang === "ar";
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border)",
        padding: "48px 24px 28px",
        direction: isRTL ? "rtl" : "ltr",
        marginTop: "60px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Top row: logo + sections */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `200px repeat(${t.sections.length}, 1fr)`,
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href={lang === "ar" ? "/" : `/${lang}/`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  color: "var(--accent)",
                  marginBottom: "8px",
                }}
              >
                {t.site}
              </div>
            </Link>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-2)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {t.tagline}
            </p>
          </div>

          {/* Sections */}
          {t.sections.map((section) => (
            <div key={section.title}>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: "0 0 14px",
                }}
              >
                {section.title}
              </h3>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "8px" }}>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: "14px",
                        color: "var(--text-2)",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-3)" }}>
            © {year} {t.site} — {t.copyright}
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/about/" style={{ fontSize: "13px", color: "var(--text-3)", textDecoration: "none" }}>
              {lang === "ar" ? "عن الموقع" : lang === "fr" ? "À propos" : "About"}
            </Link>
            <Link href="/privacy/" style={{ fontSize: "13px", color: "var(--text-3)", textDecoration: "none" }}>
              {lang === "ar" ? "الخصوصية" : lang === "fr" ? "Confidentialité" : "Privacy"}
            </Link>
            <Link href="/contact/" style={{ fontSize: "13px", color: "var(--text-3)", textDecoration: "none" }}>
              {lang === "ar" ? "اتصل بنا" : "Contact"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
