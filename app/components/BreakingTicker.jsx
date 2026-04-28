"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Bandeau défilant "عاجل" — direction RTL (de gauche vers droite pour l'arabe).
 * Thème-aware : couleur de fond s'adapte au thème jour/nuit.
 */
export default function BreakingTicker({ items }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Défilement continu RTL : les items vont de droite à gauche (sens naturel arabe)
    let x = 0;
    let raf;

    const step = () => {
      x += 0.55; // positif = vers la droite → mais on inverse la direction avec ltr + translateX négatif
      const half = track.scrollWidth / 2;
      if (x >= half) x = 0;
      track.style.transform = `translateX(-${x}px)`;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  if (!items || items.length === 0) return null;

  // On double la liste pour un défilement sans fin
  const doubled = [...items, ...items];

  return (
    <div style={{
      background: "#b91c1c",
      borderBottom: "2px solid #991b1b",
      overflow: "hidden",
      height: "40px",
      display: "flex",
      alignItems: "center",
      direction: "rtl",
    }}>
      {/* Badge عاجل */}
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
        borderLeft: "1px solid rgba(255,255,255,0.15)",
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
        عاجل
      </div>

      {/* Piste défilante */}
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
                href={`/articles/${item.slug}/`}
                style={{
                  textDecoration: "none",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "0 28px",
                  opacity: 0.95,
                  transition: "opacity 0.15s",
                  direction: "rtl",
                  display: "inline-block",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.95"}
              >
                {item.title}
              </Link>
              {/* Séparateur */}
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", flexShrink: 0 }}>
                ●
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Dégradé droit — fondu */}
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: "60px",
        height: "40px",
        background: "linear-gradient(to right, #b91c1c, transparent)",
        pointerEvents: "none",
        zIndex: 2,
      }} />
    </div>
  );
}
