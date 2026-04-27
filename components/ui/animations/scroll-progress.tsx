"use client";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressProps {
  color?: string;
  height?: number;
  position?: "top" | "bottom";
}

export function ScrollProgress({
  color = "#1d4ed8",
  height = 3,
  position = "top",
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: "left",
        background: color,
        height,
        position: "fixed",
        left: 0,
        right: 0,
        zIndex: 9999,
        ...(position === "top" ? { top: 0 } : { bottom: 0 }),
      }}
    />
  );
}
