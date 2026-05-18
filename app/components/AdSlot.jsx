"use client";
import { useEffect, useRef } from "react";

/* ── Publisher ID Google AdSense ─────────────────────
   Configurable via env var NEXT_PUBLIC_ADSENSE_ID.
   Fallback sur la valeur hardcodée si la var n'est pas définie.
   Auto-ads activés via layout.jsx — ce composant gère
   les unités manuelles quand un slot ID est fourni.
   Sans slot ID : placeholder invisible (auto-ads injecte).
   ──────────────────────────────────────────────────── */
const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-6870790039775701";

// Slots AdSense — à remplacer par les IDs réels depuis AdSense Dashboard
// https://www.google.com/adsense → Annonces → Par unité d'annonce
export const AD_SLOTS = {
  leaderboard:  "auto",  // 728×90 header
  rectangle:    "auto",  // 300×250 sidebar / mid-article
  responsive:   "auto",  // responsive auto
};

export default function AdSlot({
  slot = "",
  format = "auto",
  responsive = true,
  minHeight = 90,
  label,        // utilisé uniquement comme aria-label
  style = {},
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!slot || !ref.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot]);

  // Sans slot ID : espace réservé transparent (auto-ads injecte ses propres unités)
  if (!slot) {
    return <div aria-label={label} style={{ minHeight, ...style }} />;
  }

  return (
    <div style={{ overflow: "hidden", minHeight, textAlign: "center", ...style }} aria-label={label}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUB_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
