'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  slug: string;
  name: string;
  collection: 'Lumière' | 'Harmattan';
  fabric: string;
  image: string;
  priority?: boolean;
};

const ease = [0.16, 1, 0.3, 1] as const;

export function LookCard({ slug, name, collection, fabric, image, priority = false }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <Link href={`/collections/${slug}`} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <motion.div
          className="relative h-full w-full"
          whileHover={prefersReduced ? undefined : { scale: 1.03 }}
          transition={{ duration: 0.7, ease }}
          style={{ willChange: 'transform' }}
        >
          <Image
            src={image}
            alt={`${name} gown from the ${collection} Collection — ${fabric}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1440px) 33vw, 400px"
            priority={priority}
          />
        </motion.div>
      </div>
      <p className="font-body text-[9px] uppercase tracking-[0.12em] text-muted mt-md">{collection}</p>
      <p className="font-display text-[17px] text-ink mt-xs w-fit group-hover:underline underline-offset-4 decoration-[0.5px]">
        {name}
      </p>
    </Link>
  );
}
