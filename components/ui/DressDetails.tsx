'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

import { Link } from '@/i18n/navigation';
import type { Look } from '@/types/look';

const ease = [0.16, 1, 0.3, 1] as const;

const sentence = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const word = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function DressDetails({ look }: { look: Look }) {
  const prefersReduced = useReducedMotion();
  const words = look.name.split(' ');
  const t = useTranslations('collectionDetail.details');

  return (
    <div className="px-md py-2xl md:px-2xl md:py-4xl">
      <p className="font-body text-[9px] uppercase tracking-[0.12em] text-muted">{look.collection}</p>

      <motion.h1
        variants={prefersReduced ? undefined : sentence}
        initial={prefersReduced ? undefined : 'hidden'}
        animate={prefersReduced ? undefined : 'visible'}
        className="font-display font-light text-display-md md:text-display-lg text-ink mt-sm leading-[1.1]"
      >
        {words.map((w, i) => (
          <motion.span
            key={i}
            variants={prefersReduced ? undefined : word}
            style={{ display: 'inline-block', marginRight: '0.2em' }}
          >
            {w}
          </motion.span>
        ))}
      </motion.h1>

      <p className="font-body text-body text-muted mt-lg max-w-[46ch]">{look.description}</p>
      {look.detailDescription && (
        <p className="font-body text-body text-muted mt-md max-w-[46ch]">{look.detailDescription}</p>
      )}

      <div className="flex flex-wrap items-center gap-md mt-lg">
        {look.fabric.map((item, i) => (
          <span key={item} className="flex items-center gap-md">
            {i > 0 && <span className="h-3 w-px bg-border-l" aria-hidden />}
            <span className="font-body text-[11px] uppercase tracking-[0.08em] text-muted">{item}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 mt-xl">
        <div>
          <p className="font-body text-[9px] uppercase tracking-[0.14em] text-muted">{t('productionTime')}</p>
          <p className="font-display text-display-2xs text-ink mt-xs">{look.productionWeeks}</p>
        </div>
        <div className="border-l-hairline border-border-l pl-lg">
          <p className="font-body text-[9px] uppercase tracking-[0.14em] text-muted">{t('startingAt')}</p>
          <p className="font-display text-display-2xs text-ink mt-xs">${look.startingPrice.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-2xl">
        <Link
          id="main-inquire-cta"
          href="/inquire"
          className="flex w-full items-center justify-center bg-dark text-white font-body text-[12px] uppercase tracking-[0.14em] h-[52px] md:h-12 hover:bg-[#2A2420] transition-colors duration-ui ease-standard"
        >
          {t('inquireAbout', { name: look.name })}
        </Link>
        <p className="font-body text-[10px] text-muted mt-md">{t('whatsappNote')}</p>
        <Link href="/collections" className="cta-link font-body text-nav uppercase text-ink mt-lg inline-block">
          {t('differentLook')}
        </Link>
      </div>
    </div>
  );
}
