"use client";
import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

interface StaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  once?: boolean;
  className?: string;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

const containerVariants = (stagger: number, delay: number) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Stagger({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  once = true,
  className,
}: StaggerProps) {
  return (
    <motion.div
      variants={containerVariants(staggerDelay, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
