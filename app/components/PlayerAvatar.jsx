"use client";
import { useState } from "react";

function SilhouetteSVG({ size, color }) {
  return (
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7.5" r="4.5" fill={color} opacity="0.8" />
      <path d="M3.5 20.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  );
}

export default function PlayerAvatar({ src, name, size = 52, accent = "#6366f1" }) {
  const [error, setError] = useState(false);

  const wrapStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    border: `2px solid ${accent}50`,
    background: `${accent}18`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (!src || error) {
    return (
      <div style={wrapStyle}>
        <SilhouetteSVG size={size} color={accent} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || ""}
      onError={() => setError(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${accent}50` }}
    />
  );
}
