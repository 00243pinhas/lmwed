'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

import { SectionMarker } from '@/components/ui/SectionMarker';

const ease = [0.16, 1, 0.3, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export function AboutHero() {
  const prefersReduced = useReducedMotion();
  const t = useTranslations('about.hero');

  return (
    <section className="relative w-full h-[100svh] overflow-hidden bg-dark">
      <Image
        src="/brand_assets/photography/linda-portrait.jpg"
        alt="Linda Monga, founder of LM Weddyli, Lubumbashi"
        fill
        priority
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
          <SectionMarker label={t('marker')} light />
          <h1 className="font-display italic font-light text-display-sm md:text-display-lg text-white mt-md leading-[1.1]">
            {t('headline')}
          </h1>
          <p className="font-body text-[11px] uppercase tracking-[0.1em] text-white/70 mt-md">{t('subline')}</p>
        </motion.div>
      </div>
    </section>
  );
}
