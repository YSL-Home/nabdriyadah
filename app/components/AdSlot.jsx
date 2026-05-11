"use client";
import { useEffect, useRef } from "react";

/* ── Publisher ID Google AdSense ─────────────────────
   ca-pub-6870790039775701
   (non-secret : visible dans le HTML de toute façon)
   ──────────────────────────────────────────────────── */
const PUB_ID = "ca-pub-6870790039775701";

export default function AdSlot({
  slot = "",
  format = "auto",
  responsive = true,
  minHeight = 90,
  style = {},
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

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
