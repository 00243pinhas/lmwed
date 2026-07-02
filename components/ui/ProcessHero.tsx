'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { SectionMarker } from '@/components/ui/SectionMarker';

const ease = [0.16, 1, 0.3, 1] as const;
const headline = 'From first conversation to final stitch.';

const sentence = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const word = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function ProcessHero() {
  const prefersReduced = useReducedMotion();
  const words = headline.split(' ');

  return (
    <section className="relative w-full bg-dark h-[50svh] min-h-[420px] flex flex-col justify-end px-md pb-3xl md:px-xl md:pb-4xl">
      <SectionMarker label="02 The Process" light />
      <motion.h1
        variants={prefersReduced ? undefined : sentence}
        initial={prefersReduced ? undefined : 'hidden'}
        animate={prefersReduced ? undefined : 'visible'}
        className="font-display font-light text-display-sm md:text-display-lg text-white mt-md max-w-[16ch] leading-[1.1]"
      >
        {words.map((w, i) => (
          <motion.span
            key={i}
            variants={prefersReduced ? undefined : word}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
          >
            {w}
          </motion.span>
        ))}
      </motion.h1>
    </section>
  );
}
