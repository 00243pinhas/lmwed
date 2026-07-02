'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

import { SectionMarker } from '@/components/ui/SectionMarker';

const ease = [0.16, 1, 0.3, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export function AboutHero() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative w-full h-[100svh] overflow-hidden bg-dark">
      <Image
        src="https://placehold.co/1600x2000/0c0a08/2a2420.png?text=Portrait+Placeholder&font=roboto"
        alt="Placeholder — Linda Monga, founder of LM Weddyli, Lubumbashi"
        fill
        priority
        quality={90}
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end px-md pb-3xl md:px-xl md:pb-4xl">
        <motion.div
          variants={prefersReduced ? undefined : fade}
          initial={prefersReduced ? undefined : 'hidden'}
          animate={prefersReduced ? undefined : 'visible'}
        >
          <SectionMarker label="03 The Maker" light />
          <h1 className="font-display italic font-light text-display-sm md:text-display-lg text-white mt-md leading-[1.1]">
            Linda Monga.
          </h1>
          <p className="font-body text-[11px] uppercase tracking-[0.1em] text-white/70 mt-md">
            Founder · LM Weddyli · Lubumbashi
          </p>
        </motion.div>
      </div>
    </section>
  );
}
