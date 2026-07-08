'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

export function StepIndicator({ current }: { current: number }) {
  const prefersReduced = useReducedMotion();
  const t = useTranslations('inquire');
  const labels = [t('steps.aboutYou'), t('steps.yourVision'), t('steps.yourPlans')];

  return (
    <div className="flex items-center flex-wrap gap-sm md:gap-md" aria-label={t('formProgressLabel')}>
      {labels.map((label, i) => {
        const num = String(i + 1).padStart(2, '0');
        const isActive = i === current;
        const isDone = i < current;

        return (
          <div key={label} className="flex items-center gap-sm md:gap-md">
            {i > 0 && <span className="h-px w-6 md:w-10 bg-border-l shrink-0" aria-hidden />}
            <span className="relative inline-block">
              <span
                className={
                  isActive
                    ? 'font-display italic text-[14px] text-ink border-b border-ink pb-[2px]'
                    : isDone
                      ? 'font-body text-[11px] uppercase tracking-[0.1em] text-accent'
                      : 'font-body text-[11px] uppercase tracking-[0.1em] text-border-l'
                }
              >
                {num} {label}
              </span>
              {isDone && (
                <motion.span
                  initial={prefersReduced ? { scaleX: 1 } : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: prefersReduced ? 0 : 0.3, ease }}
                  className="absolute left-0 top-1/2 h-px w-full bg-accent origin-left"
                  style={{ transform: 'translateY(-50%)' }}
                  aria-hidden
                />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
