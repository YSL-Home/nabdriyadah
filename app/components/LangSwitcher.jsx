"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LANGS = [
  { lang: "ar", label: "ع", full: "العربية",  flag: "🇸🇦" },
  { lang: "fr", label: "fr", full: "Français", flag: "🇫🇷" },
  { lang: "en", label: "en", full: "English",  flag: "🇬🇧" },
];

function getEquivalentPath(currentPath, targetLang) {
  // Strip any existing lang prefix
  let base = currentPath;
  if (base.startsWith("/en")) base = base.slice(3) || "/";
  if (base.startsWith("/fr")) base = base.slice(3) || "/";

  if (targetLang === "ar") return base || "/";
  return `/${targetLang}${base === "/" ? "" : base}`;
}

function detectCurrentLang(pathname) {
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/fr")) return "fr";
  return "ar";
}

export default function LangSwitcher() {
  const pathname = usePathname() || "/";
  const currentLang = detectCurrentLang(pathname);
  const [open, setOpen] = useState(false);

  const current = LANGS.find(l => l.lang === currentLang);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "rgba(255,255,255,0.14)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          borderRadius: "10px",
          padding: "5px 12px",
          color: "white",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          whiteSpace: "nowrap",
          transition: "background 0.15s"
        }}
        aria-label="Language / Langue / اللغة"
      >
        <span>{current?.flag}</span>
        <span>{current?.label?.toUpperCase()}</span>
        <span style={{ fontSize: "9px", opacity: 0.7 }}>▼</span>
      </button>

      {open && (
        <>
          {/* Overlay to close */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 199 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "white",
            borderRadius: "14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            overflow: "hidden",
            zIndex: 200,
            minWidth: "140px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}>
            {LANGS.map(l => {
              const href = getEquivalentPath(pathname, l.lang);
              const isActive = l.lang === currentLang;
              return (
                <Link
                  key={l.lang}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "11px 16px",
                    textDecoration: "none",
                    color: isActive ? "#1d3a8a" : "#374151",
                    background: isActive ? "#eff6ff" : "transparent",
                    fontWeight: isActive ? 800 : 600,
                    fontSize: "14px",
                    transition: "background 0.1s",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{l.flag}</span>
                  <span>{l.full}</span>
                  {isActive && <span style={{ marginRight: "auto", color: "#1d3a8a", fontSize: "16px" }}>✓</span>}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
