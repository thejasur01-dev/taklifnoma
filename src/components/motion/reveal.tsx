"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Animate on mount (above the fold) instead of when scrolled into view. */
  immediate?: boolean;
  y?: number;
};

/** Fade-and-rise entrance. Communicates reading order; static under reduced motion. */
export function Reveal({ children, className, delay = 0, immediate = false, y = 18 }: Props) {
  const reduce = useReducedMotion();
  const target = { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={immediate ? target : undefined}
      whileInView={immediate ? undefined : target}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
