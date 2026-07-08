'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

import { SectionMarker } from '@/components/ui/SectionMarker';

const ease = [0.16, 1, 0.3, 1] as const;

const sentence = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const word = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function InquireHeader() {
  const prefersReduced = useReducedMotion();
  const t = useTranslations('inquire.header');
  const words = t('headline').split(' ');

  return (
    <section className="relative w-full bg-dark h-[50svh] min-h-[420px] flex flex-col justify-end px-md pb-3xl md:px-xl md:pb-4xl">
      <SectionMarker label={t('marker')} light />
      <motion.h1
        variants={prefersReduced ? undefined : sentence}
        initial={prefersReduced ? undefined : 'hidden'}
        animate={prefersReduced ? undefined : 'visible'}
        className="font-display italic font-light text-display-sm md:text-display-lg text-white mt-md max-w-[18ch] leading-[1.1]"
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
      <p className="font-body text-body text-white/70 mt-lg max-w-[46ch]">{t('subline')}</p>
    </section>
  );
}
