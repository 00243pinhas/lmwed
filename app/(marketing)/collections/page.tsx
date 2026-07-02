import type { Metadata } from 'next';

import { HeroSection } from '@/components/ui/HeroSection';
import { SectionMarker } from '@/components/ui/SectionMarker';
import { CollectionsGrid } from '@/components/ui/CollectionsGrid';
import { Reveal } from '@/components/ui/Reveal';

import { looks } from '@/data/dummy/collections';
import { collectionInfo } from '@/data/dummy/collection-info';

export const metadata: Metadata = {
  title: 'Collections — LM Weddyli',
  description: 'Twelve made-to-measure silhouettes across two collections — Lumière and Harmattan.',
};

export default function CollectionsPage() {
  return (
    <>
      <HeroSection
        eyebrow="The Collection"
        headline="Where Light Meets Structure"
        subline="Two collections, twelve silhouettes — Lumière and Harmattan, each gown made to your measurements alone."
        mediaSrc="/brand_assets/photography/isabelle-hero.png"
        height="half"
      />

      {/* 0.1 The Two Collections */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="0.1 The Two Collections" />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[16ch]">
            Structure And Light, Named
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl md:gap-2xl mt-2xl md:mt-3xl">
          {collectionInfo.map((collection) => (
            <Reveal key={collection.name}>
              <h3 className="font-display font-light italic text-display-xs text-ink">{collection.name}</h3>
              <p className="font-body text-[9px] uppercase tracking-[0.12em] text-muted mt-sm">
                {collection.tagline}
              </p>
              <p className="font-body text-body text-muted mt-md max-w-[46ch]">{collection.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 0.2 The Looks */}
      <section className="bg-surface px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="0.2 The Looks" />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[16ch]">
            Browse The Full Collection
          </h2>
        </Reveal>

        <div className="mt-2xl md:mt-3xl">
          <CollectionsGrid looks={looks} />
        </div>
      </section>
    </>
  );
}
