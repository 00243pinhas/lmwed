'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

type Props = {
  src: string;
  alt: string;
};

export function DetailHero({ src, alt }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '20%']);

  return (
    <div ref={ref} className="relative h-[85vh] w-full overflow-hidden md:h-screen">
      <motion.div className="absolute inset-0" style={{ y, willChange: 'transform' }}>
        <Image src={src} alt={alt} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" />
      </motion.div>
    </div>
  );
}
