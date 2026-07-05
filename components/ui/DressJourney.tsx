'use client';

import { motion, useReducedMotion } from 'framer-motion';

import type { OrderStage } from '@/types/order';

const ease = [0.16, 1, 0.3, 1] as const;

const STAGES: { key: OrderStage; label: string }[] = [
  { key: 'consultation', label: 'Consultation' },
  { key: 'design', label: 'Design' },
  { key: 'measurements', label: 'Measurements' },
  { key: 'production', label: 'Production' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'delivered', label: 'Delivered' },
];

export function DressJourney({ stage }: { stage: OrderStage }) {
  const prefersReduced = useReducedMotion();
  const currentIndex = STAGES.findIndex((s) => s.key === stage);
  const filledRatio = currentIndex / (STAGES.length - 1);

  return (
    <div className="w-full">
      {/* Desktop — horizontal */}
      <div className="hidden md:block relative pt-lg">
        <div className="absolute top-[calc(1.5rem+5px)] left-0 right-0 h-px bg-border-l" />
        <div
          className="absolute top-[calc(1.5rem+5px)] left-0 h-px bg-ink overflow-hidden"
          style={{ width: `${filledRatio * 100}%` }}
        >
          <motion.div
            className="h-full w-full bg-ink origin-left"
            initial={prefersReduced ? undefined : { scaleX: 0 }}
            whileInView={prefersReduced ? undefined : { scaleX: 1 }}
            animate={prefersReduced ? { scaleX: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease }}
          />
        </div>
        <div className="relative grid grid-cols-6">
          {STAGES.map((s, i) => {
            const reached = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={s.key} className="flex flex-col items-start gap-md">
                <span
                  className={
                    isCurrent
                      ? 'h-[9px] w-[9px] bg-ink'
                      : reached
                        ? 'h-[5px] w-[5px] bg-ink'
                        : 'h-[5px] w-[5px] border-hairline border-border-l bg-light'
                  }
                />
                <p
                  className={`font-body text-[10px] uppercase tracking-[0.14em] ${
                    isCurrent ? 'text-ink' : reached ? 'text-muted' : 'text-muted/60'
                  }`}
                >
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile — vertical */}
      <div className="md:hidden relative pl-lg">
        <div className="absolute left-[3px] top-[6px] bottom-[6px] w-px bg-border-l" />
        <div
          className="absolute left-[3px] top-[6px] w-px bg-ink overflow-hidden"
          style={{ height: `${filledRatio * 100}%` }}
        >
          <motion.div
            className="w-full h-full bg-ink origin-top"
            initial={prefersReduced ? undefined : { scaleY: 0 }}
            whileInView={prefersReduced ? undefined : { scaleY: 1 }}
            animate={prefersReduced ? { scaleY: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease }}
          />
        </div>
        <div className="flex flex-col gap-lg">
          {STAGES.map((s, i) => {
            const reached = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={s.key} className="relative flex items-center">
                <span
                  className={`absolute -left-lg ${
                    isCurrent
                      ? 'h-[9px] w-[9px] -translate-x-[2px] bg-ink'
                      : reached
                        ? 'h-[5px] w-[5px] bg-ink'
                        : 'h-[5px] w-[5px] border-hairline border-border-l bg-light'
                  }`}
                />
                <p
                  className={`font-body text-[11px] uppercase tracking-[0.14em] ${
                    isCurrent ? 'text-ink' : reached ? 'text-muted' : 'text-muted/60'
                  }`}
                >
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
