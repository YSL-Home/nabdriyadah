"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
  mode?: "fade" | "slide" | "scale";
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  },
};

export function PageTransition({ children, pageKey, mode = "fade" }: PageTransitionProps) {
  const v = variants[mode];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
