"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LangSwitcher from "./LangSwitcher";

function detectLang(pathname = "/") {
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/fr")) return "fr";
  return "ar";
}

const NAV = {
  ar: [
    { emoji: "⚽", label: "كرة القدم", base: "/sport/football/" },
    { emoji: "🏀", label: "كرة السلة", base: "/sport/basketball/" },
    { emoji: "🎾", label: "التنس",     base: "/sport/tennis/" },
    { emoji: "🏸", label: "البادل",    base: "/sport/padel/" },
    { emoji: "🥅", label: "الصالات",   base: "/sport/futsal/" },
  ],
  fr: [
    { emoji: "⚽", label: "Football",    base: "/sport/football/" },
    { emoji: "🏀", label: "Basketball",  base: "/sport/basketball/" },
    { emoji: "🎾", label: "Tennis",      base: "/sport/tennis/" },
    { emoji: "🏸", label: "Padel",       base: "/sport/padel/" },
    { emoji: "🥅", label: "Futsal",      base: "/sport/futsal/" },
  ],
  en: [
    { emoji: "⚽", label: "Football",    base: "/sport/football/" },
    { emoji: "🏀", label: "Basketball",  base: "/sport/basketball/" },
    { emoji: "🎾", label: "Tennis",      base: "/sport/tennis/" },
    { emoji: "🏸", label: "Padel",       base: "/sport/padel/" },
    { emoji: "🥅", label: "Futsal",      base: "/sport/futsal/" },
  ],
};

const SITE_NAME = { ar: "نبض الرياضة", fr: "Sports Pulse", en: "Sports Pulse" };
const HOME     = { ar: "/", fr: "/fr", en: "/en" };
const LIVE     = { ar: "مباشر", fr: "En direct", en: "Live" };
const LIVE_HREF = { ar: "/live/", fr: "/fr/live/", en: "/en/live/" };
const DARK_LABEL = { ar: "ليل", fr: "Nuit", en: "Night" };
const LIGHT_LABEL = { ar: "نهار", fr: "Jour", en: "Day" };

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const lang = detectLang(pathname);
  const prefix = lang === "ar" ? "" : `/${lang}`;
  const links = NAV[lang] || NAV.ar;

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme !== "light");
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const isRTL = lang === "ar";

  return (
    <header style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1d3a8a 100%)",
      color: "white",
      direction: isRTL ? "rtl" : "ltr",
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
        <Link href={HOME[lang]} style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="/logo-v2.svg"
              alt={SITE_NAME[lang]}
              style={{ height: "30px", width: "auto" }}
              onError={e => { e.currentTarget.style.display = "none"; }}
            />
            <span style={{ fontSize: "clamp(15px, 3.5vw, 20px)", fontWeight: 900, color: "white", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {SITE_NAME[lang]}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hdr-nav-desktop">
          {links.map((link) => (
            <Link key={link.base} href={`${prefix}${link.base}`} className="hdr-pill">
              {link.emoji} {link.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster: language switcher + theme + live */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Language switcher */}
          <LangSwitcher />

          {/* Day/Night indicator */}
          <span className="theme-badge" title={isDark ? DARK_LABEL[lang] : LIGHT_LABEL[lang]}>
            {isDark ? `🌙 ${DARK_LABEL[lang]}` : `☀️ ${LIGHT_LABEL[lang]}`}
          </span>

          {/* Live badge */}
          <Link href={LIVE_HREF[lang]} style={{ textDecoration: "none" }}>
            <span className="live-badge">
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#fca5a5", display: "inline-block",
                animation: "pulse 1.5s infinite"
              }} />
              {LIVE[lang]}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="hdr-nav-mobile">
        {links.map((link) => (
          <Link key={link.base} href={`${prefix}${link.base}`} className="hdr-pill-mobile">
            {link.emoji} {link.label}
          </Link>
        ))}
        <Link href={LIVE_HREF[lang]} className="hdr-pill-mobile" style={{ color: "#fca5a5", borderColor: "rgba(252,165,165,0.3)" }}>
          🔴 {LIVE[lang]}
        </Link>
        <span className="hdr-pill-mobile" style={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.1)", cursor: "default" }}>
          {isDark ? "🌙" : "☀️"}
        </span>
      </div>
    </header>
  );
}
