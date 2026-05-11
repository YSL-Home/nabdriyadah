"use client";
import { useEffect, useRef } from "react";

/* ── Config ─────────────────────────────────────────────
   Ajoutez NEXT_PUBLIC_ADSENSE_PUB_ID dans Cloudflare env vars
   (ex: ca-pub-1234567890123456) pour activer les annonces.
   Sans cette variable, le composant est invisible (pas de layout shift).
   ──────────────────────────────────────────────────────── */
const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "";
const ADS_ENABLED = !!PUB_ID;

export default function AdSlot({
  slot = "",
  format = "auto",
  responsive = true,
  minHeight = 90,
  style = {},
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ADS_ENABLED || !ref.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  if (!ADS_ENABLED) return null;

  return (
    <div style={{ overflow: "hidden", minHeight, textAlign: "center", ...style }}>
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
