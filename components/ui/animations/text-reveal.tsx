"use client";
import { motion, type Variants } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

export function TextReveal({
  text,
  className,
  delay = 0,
  staggerDelay = 0.04,
  once = true,
}: TextRevealProps) {
  const words = text.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: staggerDelay, delayChildren: delay },
    },
  };

  const wordVariant: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap gap-[0.25em] ${className ?? ""}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={wordVariant} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
