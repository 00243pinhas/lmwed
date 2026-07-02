'use client';

import { motion, useReducedMotion } from 'framer-motion';

type Stage = {
  week: string;
  label: string;
};

type Props = {
  stages: Stage[];
};

const ease = [0.16, 1, 0.3, 1] as const;

export function Timeline({ stages }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="w-full">
      {/* Desktop — horizontal */}
      <div className="hidden md:block relative">
        <div className="absolute top-[5px] left-0 right-0 h-px bg-border-l" />
        <motion.div
          className="absolute top-[5px] left-0 h-px bg-ink origin-left"
          initial={prefersReduced ? undefined : { scaleX: 0 }}
          whileInView={prefersReduced ? undefined : { scaleX: 1 }}
          animate={prefersReduced ? { scaleX: 1 } : undefined}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.2, ease }}
          style={{ width: '100%' }}
        />
        <div className="relative grid grid-cols-5">
          {stages.map((stage) => (
            <div key={stage.label} className="flex flex-col items-start gap-md pt-lg">
              <span className="h-[3px] w-[3px] bg-ink" />
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">
                  {stage.week}
                </p>
                <p className="font-display font-light text-display-2xs text-ink mt-xs">
                  {stage.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile — vertical */}
      <div className="md:hidden relative pl-lg">
        <div className="absolute left-[3px] top-[6px] bottom-[6px] w-px bg-border-l" />
        <div className="flex flex-col gap-xl">
          {stages.map((stage) => (
            <div key={stage.label} className="relative">
              <span className="absolute -left-lg top-[6px] h-[3px] w-[3px] bg-ink" />
              <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">
                {stage.week}
              </p>
              <p className="font-display font-light text-display-2xs text-ink mt-xs">
                {stage.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
