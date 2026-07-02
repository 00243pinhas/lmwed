'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Children, type ReactNode } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function StaggerReveal({ children, className }: { children: ReactNode; className?: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={prefersReduced ? undefined : container}
      initial={prefersReduced ? undefined : 'hidden'}
      whileInView={prefersReduced ? undefined : 'visible'}
      viewport={{ once: true, margin: '-80px' }}
    >
      {Children.map(children, (child) => (
        <motion.div variants={prefersReduced ? undefined : item}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
