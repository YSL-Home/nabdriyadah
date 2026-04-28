"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function BreakingTicker({ items }) {
  const [pos, setPos] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const width = ref.current.scrollWidth / 2;
    let frame;
    let x = 0;
    const animate = () => {
      x -= 0.5;
      if (Math.abs(x) >= width) x = 0;
      setPos(x);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const doubled = [...items, ...items];

  return (
    <div style={{ background: "#dc2626", color: "white", overflow: "hidden", height: "38px", display: "flex", alignItems: "center", direction: "ltr" }}>
      <div style={{ background: "#991b1b", padding: "0 16px", height: "100%", display: "flex", alignItems: "center", flexShrink: 0, fontWeight: 800, fontSize: "13px", whiteSpace: "nowrap", zIndex: 1 }}>
        🔴 عاجل
      </div>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div ref={ref} style={{ display: "flex", gap: "60px", transform: `translateX(${pos}px)`, willChange: "transform", whiteSpace: "nowrap" }}>
          {doubled.map((item, i) => (
            <Link key={i} href={`/articles/${item.slug}/`} style={{ textDecoration: "none", color: "white", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
