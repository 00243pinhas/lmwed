'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from 'framer-motion';

type Props = {
  number: string;
  title: string;
  description: string;
  eyebrow?: string;
  detail?: string;
  image?: string;
  imageAlt?: string;
  imageLeft?: boolean;
};

export function ProcessStep({
  number,
  title,
  description,
  eyebrow,
  detail,
  image,
  imageAlt,
  imageLeft = false,
}: Props) {
  const prefersReduced = useReducedMotion();
  const numberRef = useRef<HTMLParagraphElement>(null);
  const inView = useInView(numberRef, { once: true, margin: '-80px' });
  const target = parseInt(number, 10);
  const count = useMotionValue(prefersReduced ? target : 0);
  const spring = useSpring(count, { duration: 800 });
  const [display, setDisplay] = useState(number);

  useMotionValueEvent(spring, 'change', (v) => {
    setDisplay(Math.round(v).toString().padStart(2, '0'));
  });

  useEffect(() => {
    if (inView && !prefersReduced) count.set(target);
  }, [inView, prefersReduced, target, count]);

  return (
    <div className="border-t-hairline border-border-l py-2xl md:py-3xl">
      <div className="flex flex-col md:flex-row md:items-center md:gap-2xl">
        <p
          ref={numberRef}
          className="font-display font-light text-[80px] md:text-[120px] leading-none text-[#E8E2DA] md:w-[180px] md:shrink-0"
        >
          {prefersReduced ? number : display}
        </p>

        <div
          className={`mt-md flex flex-1 flex-col gap-lg md:mt-0 md:flex-row md:items-center md:gap-2xl ${
            imageLeft ? 'md:flex-row-reverse' : ''
          }`}
        >
          <div className="md:flex-1">
            {eyebrow && (
              <p className="font-body text-[9px] uppercase tracking-[0.14em] text-muted">{eyebrow}</p>
            )}
            <h3 className="font-display font-light text-display-sm md:text-display-xs text-ink mt-xs">
              {title}
            </h3>
            <p className="font-body text-body text-muted mt-sm max-w-[42ch]">{description}</p>
            {detail && (
              <p className="font-body text-[11px] text-muted/80 italic mt-md max-w-[42ch]">{detail}</p>
            )}
          </div>

          {image && (
            <div className="relative aspect-[4/3] w-full md:flex-1">
              <Image
                src={image}
                alt={imageAlt ?? title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
