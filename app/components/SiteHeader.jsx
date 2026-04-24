import Link from "next/link";

const navLinks = [
  { label: "⚽ كرة القدم", href: "/sport/football/" },
  { label: "🏀 السلة", href: "/sport/basketball/" },
  { label: "🎾 التنس", href: "/sport/tennis/" },
  { label: "🏸 البادل", href: "/sport/padel/" },
  { label: "🥅 الصالات", href: "/sport/futsal/" },
];

export default function SiteHeader() {
  return (
    <header style={{
      background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
      color: "white",
      direction: "rtl",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 2px 20px rgba(0,0,0,0.25)"
    }}>
      <div style={{
        maxWidth: "1450px",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        gap: "20px"
      }}>

        {/* Logo → Homepage */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/logo-v2.svg"
              alt="نبض الرياضة"
              style={{ height: "36px", width: "auto", objectFit: "contain" }}
            />
            <span style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.5px",
              lineHeight: 1
            }}>
              نبض الرياضة
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                color: "rgba(255,255,255,0.9)",
                fontWeight: 700,
                fontSize: "14px",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                whiteSpace: "nowrap"
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Live badge */}
        <div style={{ flexShrink: 0 }}>
          <Link href="/live/" style={{ textDecoration: "none" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#dc2626",
              color: "white",
              fontWeight: 800,
              fontSize: "13px",
              padding: "7px 14px",
              borderRadius: "999px",
              boxShadow: "0 0 12px rgba(220,38,38,0.5)"
            }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fca5a5", display: "inline-block" }} />
              مباشر
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
