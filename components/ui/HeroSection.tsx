'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

import { Link } from '@/i18n/navigation';

type Props = {
  eyebrow?: string;
  headline: string;
  subline?: string;
  ctaText?: string;
  ctaHref?: string;
  mediaSrc: string;
  height?: 'full' | 'half';
};

const ease = [0.16, 1, 0.3, 1] as const;

const sentence = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const word = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function HeroSection({ eyebrow, headline, subline, ctaText, ctaHref, mediaSrc, height = 'full' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const t = useTranslations('common');
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '20%']);

  const words = headline.split(' ');

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden bg-dark ${height === 'full' ? 'h-[100svh]' : 'h-[50svh]'}`}
    >
      <motion.div className="absolute inset-0" style={{ y, willChange: 'transform' }}>
        <Image src={mediaSrc} alt="" fill priority className="object-cover" sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end px-md pb-3xl md:px-xl md:pb-4xl">
        {eyebrow && (
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent mb-md">{eyebrow}</p>
        )}
        <motion.h1
          variants={prefersReduced ? undefined : sentence}
          initial={prefersReduced ? undefined : 'hidden'}
          animate={prefersReduced ? undefined : 'visible'}
          className="font-display font-light text-display-sm md:text-display-lg lg:text-display-xl text-white leading-[1.08] max-w-[16ch]"
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
        {subline && (
          <p className="font-body text-body text-white/80 mt-lg max-w-[42ch]">{subline}</p>
        )}
        {ctaText && ctaHref && (
          <Link
            href={ctaHref}
            className="cta-link font-body text-nav uppercase text-white mt-xl"
          >
            {ctaText}
          </Link>
        )}
      </div>

      <div className="absolute bottom-3xl right-md md:right-xl z-10 hidden md:flex flex-col items-center gap-md">
        <span
          className="font-body text-[10px] uppercase tracking-[0.16em] text-white/70"
          style={{ writingMode: 'vertical-rl' }}
        >
          {t('scroll')}
        </span>
        <span className="h-2xl w-px bg-white/40" />
      </div>
    </div>
  );
}
