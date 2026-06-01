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
    { emoji: "⚽",  label: "كرة القدم", base: "/sport/football/"   },
    { emoji: "🏀",  label: "كرة السلة", base: "/sport/basketball/" },
    { emoji: "🎾",  label: "التنس",     base: "/sport/tennis/"     },
    { emoji: "🏸",  label: "البادل",    base: "/sport/padel/"      },
    { emoji: "🥅",  label: "الصالات",   base: "/sport/futsal/"     },
    { emoji: "🏎️", label: "فورمولا 1", base: "/sport/f1/"         },
    { emoji: "⛳",  label: "الغولف",    base: "/sport/golf/"       },
  ],
  fr: [
    { emoji: "⚽",  label: "Football",   base: "/sport/football/"   },
    { emoji: "🏀",  label: "Basketball", base: "/sport/basketball/" },
    { emoji: "🎾",  label: "Tennis",     base: "/sport/tennis/"     },
    { emoji: "🏸",  label: "Padel",      base: "/sport/padel/"      },
    { emoji: "🥅",  label: "Futsal",     base: "/sport/futsal/"     },
    { emoji: "🏎️", label: "Formule 1",  base: "/sport/f1/"         },
    { emoji: "⛳",  label: "Golf",       base: "/sport/golf/"       },
  ],
  en: [
    { emoji: "⚽",  label: "Football",   base: "/sport/football/"   },
    { emoji: "🏀",  label: "Basketball", base: "/sport/basketball/" },
    { emoji: "🎾",  label: "Tennis",     base: "/sport/tennis/"     },
    { emoji: "🏸",  label: "Padel",      base: "/sport/padel/"      },
    { emoji: "🥅",  label: "Futsal",     base: "/sport/futsal/"     },
    { emoji: "🏎️", label: "Formula 1",  base: "/sport/f1/"         },
    { emoji: "⛳",  label: "Golf",       base: "/sport/golf/"       },
  ],
};

const SITE_NAME  = { ar: "نبض الرياضة",        fr: "Sports Pulse",          en: "Sports Pulse"          };
const HOME       = { ar: "/",                   fr: "/fr",                   en: "/en"                   };
const LIVE       = { ar: "مباشر",              fr: "Direct",                en: "Live"                  };
const LIVE_HREF  = { ar: "/live/",              fr: "/fr/live/",             en: "/en/live/"             };
const DARK_LABEL = { ar: "ليل",                fr: "Nuit",                  en: "Night"                 };
const LIGHT_LABEL= { ar: "نهار",               fr: "Jour",                  en: "Day"                   };
const ABOUT_LABEL= { ar: "عن الموقع",          fr: "À propos",              en: "About"                 };
const ABOUT_HREF = { ar: "/about/",             fr: "/fr/about/",            en: "/en/about/"            };
/* Accessibility labels */
const NAV_ARIA   = { ar: "التنقل الرئيسي",    fr: "Navigation principale", en: "Main navigation"       };
const THEME_ARIA = {
  ar: { toLight: "التبديل إلى الوضع النهاري", toDark: "التبديل إلى الوضع الليلي" },
  fr: { toLight: "Passer en mode jour",        toDark: "Passer en mode nuit"       },
  en: { toLight: "Switch to light mode",       toDark: "Switch to dark mode"       },
};
const LIVE_ARIA  = { ar: "النتائج المباشرة",  fr: "Résultats en direct",   en: "Live scores"           };

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const lang   = detectLang(pathname);
  const prefix = lang === "ar" ? "" : `/${lang}`;
  const links  = NAV[lang] || NAV.ar;
  const isRTL  = lang === "ar";

  const [isDark,   setIsDark]   = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  useEffect(() => {
    // Appliquer le choix persisté au montage
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);

    const check = () => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  /* ── couleurs selon thème ── */
  const bg = isDark
    ? scrolled ? "rgba(13,22,42,0.96)" : "rgba(13,22,42,0.88)"
    : scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.92)";

  const shadow = isDark
    ? scrolled ? "0 2px 20px rgba(0,0,0,0.5)" : "none"
    : scrolled ? "0 1px 16px rgba(0,20,80,0.08), 0 1px 2px rgba(0,20,80,0.04)" : "none";

  const borderBtm = isDark
    ? "1px solid rgba(255,255,255,0.07)"
    : "1px solid #e4e9f0";

  const nameColor  = isDark ? "#e8edf8"  : "#0d1526";

  const themeAriaLabel = isDark
    ? (THEME_ARIA[lang] || THEME_ARIA.ar).toLight
    : (THEME_ARIA[lang] || THEME_ARIA.ar).toDark;

  return (
    <header
      role="banner"
      style={{
        background: bg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        color: isDark ? "#e8edf8" : "#0d1526",
        direction: isRTL ? "rtl" : "ltr",
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: borderBtm,
        boxShadow: shadow,
        transition: "background 0.25s ease, box-shadow 0.25s ease",
      }}>
      {/* Bande accent en haut (clair seulement) */}
      {!isDark && (
        <div aria-hidden="true" style={{
          height: "3px",
          background: "linear-gradient(90deg, #1a56db 0%, #7c3aed 50%, #0891b2 100%)",
        }} />
      )}

      {/* Ligne subtile (sombre) */}
      {isDark && scrolled && (
        <div aria-hidden="true" style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(77,139,255,0.3), transparent)",
        }} />
      )}

      {/* Rangée principale */}
      <div style={{
        maxWidth: "1450px", margin: "0 auto",
        padding: "0 18px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        minHeight: "56px", gap: "12px",
      }}>

        {/* Logo */}
        <Link href={HOME[lang]} aria-label={SITE_NAME[lang]} style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="/logo-v2.svg"
              alt=""
              aria-hidden="true"
              style={{ height: "32px", width: "auto" }}
            />
            <span style={{
              fontSize: "clamp(15px,3vw,19px)", fontWeight: 900,
              color: nameColor, letterSpacing: "-0.5px", whiteSpace: "nowrap",
            }}>
              {SITE_NAME[lang]}
            </span>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav aria-label={NAV_ARIA[lang] || NAV_ARIA.ar} className="hdr-nav-desktop">
          {links.map((link) => (
            <Link
              key={link.base}
              href={`${prefix}${link.base}`}
              className="hdr-pill"
              aria-current={pathname === `${prefix}${link.base}` || pathname.startsWith(`${prefix}${link.base}`) ? "page" : undefined}
            >
              <span aria-hidden="true">{link.emoji}</span>{" "}{link.label}
            </Link>
          ))}
        </nav>

        {/* Cluster droit */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <LangSwitcher />

          {/* Bouton thème — taille minimale 44×44px pour accessibilité tactile */}
          <button
            onClick={toggleTheme}
            className="theme-badge"
            aria-label={themeAriaLabel}
            aria-pressed={isDark}
            title={themeAriaLabel}
            style={{
              cursor: "pointer", background: "none", border: "none",
              padding: "10px 12px", minHeight: "44px", minWidth: "44px",
            }}
          >
            <span aria-hidden="true">{isDark ? `🌙 ${DARK_LABEL[lang]}` : `☀️ ${LIGHT_LABEL[lang]}`}</span>
          </button>

          {/* Lien About — requis AdSense */}
          <Link
            href={ABOUT_HREF[lang]}
            className="hdr-about-link"
            style={{
              textDecoration: "none",
              fontSize: "13px",
              color: isDark ? "rgba(200,210,240,0.7)" : "rgba(30,50,100,0.55)",
              padding: "10px 10px",
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "6px",
              transition: "color 0.15s",
            }}
          >
            {ABOUT_LABEL[lang]}
          </Link>

          {/* Badge LIVE */}
          <Link
            href={LIVE_HREF[lang]}
            aria-label={LIVE_ARIA[lang] || LIVE_ARIA.ar}
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              minHeight: "44px",
            }}
          >
            <span className="live-badge">
              <span
                aria-hidden="true"
                style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: isDark ? "#f87171" : "#c81e1e",
                  display: "inline-block",
                  animation: "pulse 1.4s ease infinite",
                }}
              />
              {LIVE[lang]}
            </span>
          </Link>
        </div>
      </div>

      {/* Nav mobile */}
      <nav aria-label={NAV_ARIA[lang] || NAV_ARIA.ar} className="hdr-nav-mobile">
        {links.map((link) => (
          <Link
            key={link.base}
            href={`${prefix}${link.base}`}
            className="hdr-pill-mobile"
            aria-current={pathname === `${prefix}${link.base}` || pathname.startsWith(`${prefix}${link.base}`) ? "page" : undefined}
          >
            <span aria-hidden="true">{link.emoji}</span>{" "}{link.label}
          </Link>
        ))}
        <Link
          href={LIVE_HREF[lang]}
          className="hdr-pill-mobile"
          aria-label={LIVE_ARIA[lang] || LIVE_ARIA.ar}
          style={{ color: isDark ? "#f87171" : "#c81e1e", borderColor: isDark ? "rgba(248,113,113,0.25)" : "#fcc", background: isDark ? "rgba(248,113,113,0.08)" : "#fff8f8" }}
        >
          <span aria-hidden="true">🔴</span>{" "}{LIVE[lang]}
        </Link>
      </nav>
    </header>
  );
}
