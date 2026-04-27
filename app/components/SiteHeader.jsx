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
    <header style={{ background: "linear-gradient(135deg, #0f172a, #1d4ed8)", color: "white", direction: "rtl", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,0.25)" }}>
      <div className="hdr-inner">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo-v2.svg" alt="نبض الرياضة" style={{ height: "36px", width: "auto" }} />
            <span style={{ fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>نبض الرياضة</span>
          </div>
        </Link>
        {/* Nav */}
        <nav className="sports-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="sports-nav-item">
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Live badge */}
        <div style={{ flexShrink: 0 }}>
          <Link href="/live/" style={{ textDecoration: "none" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#dc2626", color: "white", fontWeight: 800, fontSize: "13px", padding: "7px 14px", borderRadius: "999px", boxShadow: "0 0 12px rgba(220,38,38,0.5)" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fca5a5", display: "inline-block" }} />
              مباشر
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
