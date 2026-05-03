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
const HOME       = { ar: "/",           fr: "/fr",           en: "/en" };
const LIVE       = { ar: "مباشر",       fr: "En direct",     en: "Live" };
const LIVE_HREF  = { ar: "/live/",      fr: "/fr/live/",     en: "/en/live/" };
const DARK_LABEL = { ar: "ليل",         fr: "Nuit",          en: "Night" };
const LIGHT_LABEL= { ar: "نهار",        fr: "Jour",          en: "Day" };

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const lang     = detectLang(pathname);
  const prefix   = lang === "ar" ? "" : `/${lang}`;
  const links    = NAV[lang] || NAV.ar;
  const isRTL    = lang === "ar";

  const [isDark,     setIsDark]     = useState(true);
  const [scrolled,   setScrolled]   = useState(false);
  const [activeLink, setActiveLink] = useState(null);

  useEffect(() => {
    // Theme observer
    const check = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme !== "light");
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Scroll observer
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => { obs.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  // Detect active nav link
  useEffect(() => {
    const found = links.find(l => pathname.includes(l.base.replace(/\/$/, "")));
    setActiveLink(found?.base || null);
  }, [pathname, links]);

  return (
    <header
      className="hdr-root"
      style={{
        direction: isRTL ? "rtl" : "ltr",
        boxShadow: scrolled
          ? "0 2px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(79,142,255,0.08)"
          : "0 1px 20px rgba(0,0,0,0.3)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* Main row */}
      <div className="hdr-inner-row">

        {/* ── Logo ── */}
        <Link href={HOME[lang]} className="hdr-logo">
          <img
            src="/logo-v2.svg"
            alt={SITE_NAME[lang]}
            style={{ height: "30px", width: "auto" }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
          <span className="hdr-logo-text">{SITE_NAME[lang]}</span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hdr-nav-desktop">
          {links.map((link) => {
            const isActive = activeLink === link.base;
            return (
              <Link
                key={link.base}
                href={`${prefix}${link.base}`}
                className="hdr-pill"
                style={isActive ? {
                  background: "var(--accent-soft)",
                  borderColor: "var(--border-glow)",
                  color: "white",
                  boxShadow: "0 0 16px var(--accent-glow)",
                } : {}}
              >
                <span style={{ fontSize: "14px" }}>{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right cluster ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <LangSwitcher />

          {/* Day/Night indicator */}
          <span
            className="theme-badge"
            title={isDark ? DARK_LABEL[lang] : LIGHT_LABEL[lang]}
          >
            <span style={{
              display: "inline-block",
              animation: isDark ? "float 3s ease-in-out infinite" : "none",
              animationDelay: "0.5s",
            }}>
              {isDark ? "🌙" : "☀️"}
            </span>
            <span style={{ display: "none" }} className="badge-label">
              {isDark ? DARK_LABEL[lang] : LIGHT_LABEL[lang]}
            </span>
          </span>

          {/* Live badge */}
          <Link href={LIVE_HREF[lang]} style={{ textDecoration: "none" }}>
            <span className="live-badge">
              <span style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#fca5a5",
                display: "inline-block",
                animation: "pulse 1.4s infinite",
                flexShrink: 0,
              }} />
              {LIVE[lang]}
            </span>
          </Link>
        </div>
      </div>

      {/* ── Mobile nav row ── */}
      <div className="hdr-nav-mobile">
        {links.map((link) => {
          const isActive = activeLink === link.base;
          return (
            <Link
              key={link.base}
              href={`${prefix}${link.base}`}
              className="hdr-pill-mobile"
              style={isActive ? {
                background: "var(--accent-soft)",
                borderColor: "var(--border-glow)",
                color: "white",
              } : {}}
            >
              {link.emoji} {link.label}
            </Link>
          );
        })}
        <Link
          href={LIVE_HREF[lang]}
          className="hdr-pill-mobile"
          style={{ color: "#fca5a5", borderColor: "rgba(252,165,165,0.3)" }}
        >
          🔴 {LIVE[lang]}
        </Link>
        <span
          className="hdr-pill-mobile"
          style={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.1)", cursor: "default" }}
        >
          {isDark ? "🌙" : "☀️"}
        </span>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .badge-label { display: inline !important; }
        }
      `}</style>
    </header>
  );
}
