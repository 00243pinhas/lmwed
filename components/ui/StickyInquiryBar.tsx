'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Link } from '@/i18n/navigation';

const ease = [0.16, 1, 0.3, 1] as const;

type Props = {
  dressName: string;
  collection: string;
  ctaHref: string;
  mainCtaId: string;
};

export function StickyInquiryBar({ dressName, collection, ctaHref, mainCtaId }: Props) {
  const [pastThreshold, setPastThreshold] = useState(false);
  const [mainCtaVisible, setMainCtaVisible] = useState(false);
  const prefersReduced = useReducedMotion();
  const t = useTranslations('collectionDetail.stickyBar');

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      setPastThreshold(progress > 0.4);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const target = document.getElementById(mainCtaId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setMainCtaVisible(entry.isIntersecting), {
      threshold: 0.1,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [mainCtaId]);

  const visible = pastThreshold && !mainCtaVisible;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { y: 64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { y: 64, opacity: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.3, ease }}
          className="fixed bottom-0 left-0 right-0 z-50 flex min-h-16 items-center justify-between border-t-hairline border-border-d bg-dark px-md md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <p className="font-display text-[14px] text-white truncate">
            {dressName} <span className="font-body text-[9px] uppercase tracking-[0.1em] text-muted">— {collection}</span>
          </p>
          <Link href={ctaHref} className="font-body text-nav uppercase text-white shrink-0 ml-md">
            {t('inquire')}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
