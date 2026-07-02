'use client';

import { useState } from 'react';

import { LookCard } from '@/components/ui/LookCard';
import { StaggerReveal } from '@/components/ui/StaggerReveal';
import type { Look } from '@/types/look';

type Filter = 'All' | 'Lumière' | 'Harmattan';
const filters: Filter[] = ['All', 'Lumière', 'Harmattan'];

export function CollectionsGrid({ looks }: { looks: Look[] }) {
  const [active, setActive] = useState<Filter>('All');
  const filtered = active === 'All' ? looks : looks.filter((look) => look.collection === active);

  return (
    <div>
      <div className="flex items-center gap-lg" role="tablist" aria-label="Filter by collection">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={active === filter}
            onClick={() => setActive(filter)}
            className={`font-body text-nav uppercase pb-xs border-b-hairline transition-colors duration-ui ease-standard ${
              active === filter ? 'text-ink border-ink' : 'text-muted border-transparent hover:text-ink'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <StaggerReveal
        key={active}
        className="grid grid-cols-2 md:grid-cols-3 gap-md md:gap-lg mt-2xl"
      >
        {filtered.map((look, i) => (
          <LookCard
            key={look.slug}
            slug={look.slug}
            name={look.name}
            collection={look.collection}
            fabric={look.fabric[0]}
            image={look.images.card}
            priority={i < 4}
          />
        ))}
      </StaggerReveal>
    </div>
  );
}
