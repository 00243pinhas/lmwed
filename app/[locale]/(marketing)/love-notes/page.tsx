import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SectionMarker } from '@/components/ui/SectionMarker';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { Reveal } from '@/components/ui/Reveal';
import { StaggerReveal } from '@/components/ui/StaggerReveal';
import { Link } from '@/i18n/navigation';

import { testimonials } from '@/data/dummy/testimonials';
import { loveNotesHeader, instagramSection, scarcityNote } from '@/data/dummy/love-notes-content';

const featuredTestimonial = testimonials.find((t) => t.featured) ?? testimonials[0];
const remainingTestimonials = testimonials.filter((t) => t.id !== featuredTestimonial.id);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'loveNotes.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function LoveNotesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('loveNotes');

  return (
    <>
      {/* 04 Love Notes — header */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label={t('header.marker')} />
          <h1 className="font-display font-light text-display-sm md:text-display-lg text-ink mt-md max-w-[14ch] leading-[1.1]">
            {loveNotesHeader.headline}
          </h1>
          <p className="font-body text-body text-muted mt-lg max-w-[48ch]">{loveNotesHeader.subline}</p>
        </Reveal>
      </section>

      {/* Featured testimonial — full-bleed dark */}
      <section className="relative w-full min-h-[90svh] overflow-hidden bg-dark flex items-center justify-center px-md py-4xl md:px-xl md:py-section">
        {featuredTestimonial.heroImage && (
          <>
            <Image
              src={featuredTestimonial.heroImage}
              alt={`${featuredTestimonial.name}, LM Weddyli bride`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/80 to-dark/60" />
          </>
        )}
        <Reveal className="relative z-10">
          <TestimonialCard
            quote={featuredTestimonial.quote}
            name={featuredTestimonial.name}
            city={featuredTestimonial.city}
            year={featuredTestimonial.year}
            dress={featuredTestimonial.dress}
            collection={featuredTestimonial.collection}
            featured
          />
        </Reveal>
      </section>

      {/* 4.1 More Stories */}
      <section className="bg-surface px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label={t('moreStories.marker')} />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[18ch]">
            {t('moreStories.headline')}
          </h2>
        </Reveal>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl md:gap-2xl mt-2xl md:mt-3xl">
          {remainingTestimonials.map((t) => (
            <TestimonialCard
              key={t.id}
              quote={t.quote}
              name={t.name}
              city={t.city}
              year={t.year}
              dress={t.dress}
              collection={t.collection}
              image={t.image}
            />
          ))}
        </StaggerReveal>
      </section>

      {/* 4.2 Follow Along */}
      <section className="bg-dark px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label={t('followAlong.marker')} light />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-white mt-md max-w-[16ch]">
            {instagramSection.headline}
          </h2>
        </Reveal>

        <StaggerReveal className="grid grid-cols-3 gap-[1px] mt-2xl md:mt-3xl">
          {instagramSection.images.map((img) => (
            <div key={img.src + img.alt} className="relative aspect-square overflow-hidden">
              <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) 33vw, 16vw" />
            </div>
          ))}
        </StaggerReveal>

        <Reveal className="flex gap-2xl mt-2xl md:mt-3xl">
          <Link
            href={instagramSection.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-link font-body text-nav uppercase text-white"
          >
            {t('followAlong.instagram')}
          </Link>
          <Link
            href={instagramSection.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-link font-body text-nav uppercase text-white"
          >
            {t('followAlong.tiktok')}
          </Link>
        </Reveal>
      </section>

      {/* 4.3 A note on availability */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section text-center">
        <Reveal className="flex flex-col items-center">
          <SectionMarker label={t('availability.marker')} />
          <h2 className="font-display italic font-light text-display-xs md:text-display-sm text-ink mt-md max-w-[20ch]">
            {scarcityNote.headline}
          </h2>
          <p className="font-body text-body text-muted mt-lg max-w-[52ch]">{scarcityNote.body}</p>
        </Reveal>
      </section>

      {/* 4.4 Begin */}
      <section className="bg-dark px-md py-3xl md:px-xl md:py-section text-center">
        <Reveal className="flex flex-col items-center">
          <SectionMarker label={t('begin.marker')} light />
          <h2 className="font-display font-light text-display-sm md:text-display-md text-white mt-md max-w-[16ch]">
            {t('begin.headline')}
          </h2>
          <p className="font-body text-body text-white/70 mt-lg max-w-[48ch]">{t('begin.body')}</p>
          <Link href="/inquire" className="cta-link font-body text-nav uppercase text-white mt-xl inline-block">
            {t('begin.cta')}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
