"use client";
import Link from "next/link";

const navLinks = [
  { label: "⚽", full: "كرة القدم", href: "/sport/football/" },
  { label: "🏀", full: "كرة السلة", href: "/sport/basketball/" },
  { label: "🎾", full: "التنس",     href: "/sport/tennis/"    },
  { label: "🏸", full: "البادل",    href: "/sport/padel/"     },
  { label: "🥅", full: "الصالات",   href: "/sport/futsal/"    },
];

export default function SiteHeader() {
  return (
    <header style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1d3a8a 100%)",
      color: "white",
      direction: "rtl",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 2px 24px rgba(0,0,0,0.35)"
    }}>
      {/* Main row */}
      <div style={{
        maxWidth: "1450px",
        margin: "0 auto",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "56px",
        gap: "12px",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/logo-v2.svg" alt="نبض الرياضة" style={{ height: "30px", width: "auto" }} onError={e => { e.currentTarget.style.display = "none"; }} />
            <span style={{ fontSize: "clamp(15px, 3.5vw, 20px)", fontWeight: 900, color: "white", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              نبض الرياضة
            </span>
          </div>
        </Link>

        {/* Desktop nav — hidden on mobile via CSS */}
        <nav className="hdr-nav-desktop">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hdr-pill">
              {link.label} {link.full}
            </Link>
          ))}
        </nav>

        {/* Live badge */}
        <Link href="/live/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span className="live-badge">
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fca5a5", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            مباشر
          </span>
        </Link>
      </div>

      {/* Mobile nav row — full width scrollable pills */}
      <div className="hdr-nav-mobile">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hdr-pill-mobile">
            {link.label} {link.full}
          </Link>
        ))}
        <Link href="/live/" className="hdr-pill-mobile" style={{ color: "#fca5a5", borderColor: "rgba(252,165,165,0.3)" }}>
          🔴 مباشر
        </Link>
      </div>
    </header>
  );
}
