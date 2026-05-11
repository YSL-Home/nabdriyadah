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
    { emoji: "⚽", label: "Football",   base: "/sport/football/" },
    { emoji: "🏀", label: "Basketball", base: "/sport/basketball/" },
    { emoji: "🎾", label: "Tennis",     base: "/sport/tennis/" },
    { emoji: "🏸", label: "Padel",      base: "/sport/padel/" },
    { emoji: "🥅", label: "Futsal",     base: "/sport/futsal/" },
  ],
  en: [
    { emoji: "⚽", label: "Football",   base: "/sport/football/" },
    { emoji: "🏀", label: "Basketball", base: "/sport/basketball/" },
    { emoji: "🎾", label: "Tennis",     base: "/sport/tennis/" },
    { emoji: "🏸", label: "Padel",      base: "/sport/padel/" },
    { emoji: "🥅", label: "Futsal",     base: "/sport/futsal/" },
  ],
};

const SITE_NAME  = { ar: "نبض الرياضة", fr: "Sports Pulse", en: "Sports Pulse" };
const HOME       = { ar: "/", fr: "/fr", en: "/en" };
const LIVE       = { ar: "مباشر", fr: "Direct", en: "Live" };
const LIVE_HREF  = { ar: "/live/", fr: "/fr/live/", en: "/en/live/" };
const DARK_LABEL = { ar: "ليل", fr: "Nuit", en: "Night" };
const LIGHT_LABEL= { ar: "نهار", fr: "Jour", en: "Day" };

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const lang  = detectLang(pathname);
  const prefix = lang === "ar" ? "" : `/${lang}`;
  const links  = NAV[lang] || NAV.ar;
  const isRTL  = lang === "ar";

  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const check = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme !== "light");
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => { obs.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  const headerBg = isDark
    ? scrolled
      ? "rgba(2, 4, 8, 0.92)"
      : "rgba(5, 10, 20, 0.78)"
    : scrolled
      ? "rgba(250, 252, 255, 0.96)"
      : "rgba(245, 248, 255, 0.85)";

  const borderBottom = isDark
    ? "1px solid rgba(0, 200, 255, 0.08)"
    : "1px solid rgba(0, 80, 160, 0.1)";

  const logoColor = isDark ? "#00c8ff" : "#0055bb";
  const nameColor = isDark ? "#e8f0fe" : "#0a0f1e";

  return (
    <header style={{
      background: headerBg,
      backdropFilter: "blur(24px) saturate(1.4)",
      WebkitBackdropFilter: "blur(24px) saturate(1.4)",
      color: isDark ? "#e8f0fe" : "#0a0f1e",
      direction: isRTL ? "rtl" : "ltr",
      position: "sticky",
      top: 0,
      zIndex: 100,
      borderBottom,
      boxShadow: isDark
        ? scrolled ? "0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,200,255,0.04)" : "none"
        : scrolled ? "0 4px 24px rgba(0,30,80,0.1)" : "none",
      transition: "background 0.3s ease, box-shadow 0.3s ease",
    }}>
      {/* Gradient line at top */}
      {isDark && (
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(0,200,255,0.4), rgba(139,92,246,0.3), transparent)",
          position: "absolute",
          top: 0, left: 0, right: 0,
        }} />
      )}

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
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            {/* Pulse icon */}
            <div style={{
              width: "28px", height: "28px",
              borderRadius: "8px",
              background: isDark
                ? "linear-gradient(135deg, rgba(0,200,255,0.2), rgba(139,92,246,0.2))"
                : "linear-gradient(135deg, rgba(0,80,200,0.12), rgba(100,60,200,0.12))",
              border: `1px solid ${isDark ? "rgba(0,200,255,0.25)" : "rgba(0,80,200,0.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isDark ? "0 0 12px rgba(0,200,255,0.15)" : "none",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: "14px" }}>⚡</span>
            </div>
            <span style={{
              fontSize: "clamp(15px, 3vw, 19px)",
              fontWeight: 900,
              color: nameColor,
              letterSpacing: "-0.5px",
              whiteSpace: "nowrap",
            }}>
              {SITE_NAME[lang]}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hdr-nav-desktop">
          {links.map((link) => (
            <Link key={link.base} href={`${prefix}${link.base}`} className="hdr-pill"
              style={{ color: isDark ? "rgba(180,215,255,0.8)" : "rgba(0,40,100,0.75)" }}>
              <span style={{ fontSize: "13px" }}>{link.emoji}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <LangSwitcher />

          {/* Theme badge */}
          <span className="theme-badge"
            style={{
              color: isDark ? "rgba(0,200,255,0.65)" : "rgba(0,80,180,0.65)",
              background: isDark ? "rgba(0,200,255,0.06)" : "rgba(0,60,180,0.05)",
              border: `1px solid ${isDark ? "rgba(0,200,255,0.12)" : "rgba(0,60,180,0.1)"}`,
            }}
            title={isDark ? DARK_LABEL[lang] : LIGHT_LABEL[lang]}
          >
            {isDark ? `🌙 ${DARK_LABEL[lang]}` : `☀️ ${LIGHT_LABEL[lang]}`}
          </span>

          {/* Live badge */}
          <Link href={LIVE_HREF[lang]} style={{ textDecoration: "none" }}>
            <span className="live-badge">
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#ff6b6b", display: "inline-block",
                animation: "pulse 1.4s infinite",
                boxShadow: "0 0 6px #ff4444",
              }} />
              {LIVE[lang]}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="hdr-nav-mobile">
        {links.map((link) => (
          <Link key={link.base} href={`${prefix}${link.base}`} className="hdr-pill-mobile"
            style={{ color: isDark ? "rgba(160,210,255,0.85)" : "rgba(0,50,120,0.75)" }}>
            {link.emoji} {link.label}
          </Link>
        ))}
        <Link href={LIVE_HREF[lang]} className="hdr-pill-mobile"
          style={{ color: "#ff6b6b", borderColor: "rgba(255,100,100,0.25)", background: "rgba(255,50,50,0.06)" }}>
          🔴 {LIVE[lang]}
        </Link>
        <span className="hdr-pill-mobile"
          style={{ color: isDark ? "rgba(0,200,255,0.6)" : "rgba(0,80,180,0.6)", cursor: "default" }}>
          {isDark ? "🌙" : "☀️"}
        </span>
      </div>
    </header>
  );
}
