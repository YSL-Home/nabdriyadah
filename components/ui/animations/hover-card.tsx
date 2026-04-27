"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
}

export function HoverCard({
  children,
  className,
  lift = 6,
  scale = 1.02,
}: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift, scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
