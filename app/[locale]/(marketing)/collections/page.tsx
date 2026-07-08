import { getTranslations, setRequestLocale } from 'next-intl/server';

import { HeroSection } from '@/components/ui/HeroSection';
import { SectionMarker } from '@/components/ui/SectionMarker';
import { CollectionsGrid } from '@/components/ui/CollectionsGrid';
import { Reveal } from '@/components/ui/Reveal';

import { looks } from '@/data/dummy/collections';
import { collectionInfo } from '@/data/dummy/collection-info';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'collections.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('collections');

  return (
    <>
      <HeroSection
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        subline={t('hero.subline')}
        mediaSrc="/brand_assets/photography/isabelle-hero.png"
        height="half"
      />

      {/* 0.1 The Two Collections */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label={t('twoCollections.marker')} />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[16ch]">
            {t('twoCollections.headline')}
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
          <SectionMarker label={t('looks.marker')} />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[16ch]">
            {t('looks.headline')}
          </h2>
        </Reveal>

        <div className="mt-2xl md:mt-3xl">
          <CollectionsGrid looks={looks} />
        </div>
      </section>
    </>
  );
}
