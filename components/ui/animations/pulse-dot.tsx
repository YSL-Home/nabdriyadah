"use client";
import { motion } from "framer-motion";

interface PulseDotProps {
  color?: string;
  size?: number;
  className?: string;
}

export function PulseDot({ color = "#16a34a", size = 8, className }: PulseDotProps) {
  return (
    <span className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      <motion.span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          opacity: 0.7,
        }}
        animate={{ scale: [1, 2.5, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      />
      <span
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
    </span>
  );
}
