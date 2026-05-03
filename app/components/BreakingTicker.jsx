"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

const BADGE_LABEL = { ar: "عاجل", fr: "Flash", en: "Breaking" };

function getTitle(item, lang) {
  if (lang === "en") return item.en_title || item.sourceTitle || item.title;
  if (lang === "fr") return item.fr_title || item.sourceTitle || item.title;
  return item.title;
}

export default function BreakingTicker({ items, lang = "ar", prefix = "" }) {
  const trackRef = useRef(null);
  const isRTL = lang === "ar";

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let x = 0;
    let raf;
    const step = () => {
      x += 0.55;
      const half = track.scrollWidth / 2;
      if (x >= half) x = 0;
      track.style.transform = `translateX(-${x}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  if (!items || items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div style={{
      background: "linear-gradient(90deg, #991b1b 0%, #b91c1c 50%, #991b1b 100%)",
      borderBottom: "1px solid rgba(255,255,255,0.15)",
      overflow: "hidden",
      height: "40px",
      display: "flex",
      alignItems: "center",
      direction: isRTL ? "rtl" : "ltr",
      position: "relative",
    }}>
      {/* Badge */}
      <div style={{
        background: "#7f1d1d",
        padding: "0 18px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
        fontWeight: 900,
        fontSize: "13px",
        color: "white",
        letterSpacing: "0.5px",
        borderInlineEnd: "1px solid rgba(255,255,255,0.15)",
        zIndex: 1,
        position: "relative",
      }}>
        <span style={{
          width: "8px", height: "8px",
          borderRadius: "50%",
          background: "#fca5a5",
          display: "inline-block",
          animation: "pulse 1.2s ease-in-out infinite",
          flexShrink: 0,
        }} />
        {BADGE_LABEL[lang] || BADGE_LABEL.ar}
      </div>

      {/* Scrolling track */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", direction: "ltr" }}>
        <div
          ref={trackRef}
          style={{
            display: "inline-flex",
            gap: "0",
            whiteSpace: "nowrap",
            willChange: "transform",
          }}
        >
          {doubled.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              <Link
                href={`${prefix}/articles/${item.slug}/`}
                style={{
                  textDecoration: "none",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "0 28px",
                  opacity: 0.95,
                  transition: "opacity 0.15s",
                  direction: isRTL ? "rtl" : "ltr",
                  display: "inline-block",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "0.95"; }}
              >
                {getTitle(item, lang)}
              </Link>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", flexShrink: 0 }}>●</span>
            </span>
          ))}
        </div>
      </div>

      {/* Fade edges */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "60px", height: "100%", background: "linear-gradient(to right, #991b1b, transparent)", pointerEvents: "none", zIndex: 2 }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: "60px", height: "100%", background: "linear-gradient(to left, #991b1b, transparent)", pointerEvents: "none", zIndex: 2 }} />
    </div>
  );
}
