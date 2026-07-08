import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { DetailHero } from '@/components/ui/DetailHero';
import { DressDetails } from '@/components/ui/DressDetails';
import { StickyInquiryBar } from '@/components/ui/StickyInquiryBar';
import { SectionMarker } from '@/components/ui/SectionMarker';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { LookCard } from '@/components/ui/LookCard';
import { Reveal } from '@/components/ui/Reveal';
import { StaggerReveal } from '@/components/ui/StaggerReveal';

import { looks } from '@/data/dummy/collections';
import { testimonials } from '@/data/dummy/testimonials';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return looks.map((look) => ({ slug: look.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const look = looks.find((l) => l.slug === params.slug);
  if (!look) return {};

  return {
    title: `${look.name} — LM Weddyli`,
    description: look.description,
  };
}

export default function DressDetailPage({ params }: Props) {
  const look = looks.find((l) => l.slug === params.slug);
  if (!look) notFound();

  const testimonial =
    testimonials.find((t) => t.dress === look.name) ??
    testimonials.find((t) => t.collection === look.collection) ??
    testimonials.find((t) => t.featured) ??
    testimonials[0];

  const others = looks.filter((l) => l.slug !== look.slug);
  const opposite = others.filter((l) => l.collection !== look.collection);
  const same = others.filter((l) => l.collection === look.collection);
  const recommended = [...opposite, ...same].slice(0, 3);

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Collections', href: '/collections' },
          { label: look.collection },
          { label: look.name },
        ]}
      />

      <div className="md:flex md:items-start">
        <div className="md:sticky md:top-0 md:h-screen md:w-[60%] md:shrink-0">
          <DetailHero
            src={look.images.hero}
            alt={`${look.name} gown from the ${look.collection} Collection — ${look.fabric[0]}`}
          />
        </div>
        <div className="md:w-[40%]">
          <DressDetails look={look} />
        </div>
      </div>

      <StickyInquiryBar
        dressName={look.name}
        collection={look.collection}
        ctaHref="/inquire"
        mainCtaId="main-inquire-cta"
      />

      {look.images.gallery.length > 0 && (
        <section className="bg-light px-md py-3xl md:px-xl md:py-section">
          <Reveal>
            <SectionMarker label="0.1 The Detail" />
          </Reveal>
          <StaggerReveal
            className={`grid gap-md md:gap-lg mt-2xl ${
              look.images.gallery.length === 1 ? 'grid-cols-1 max-w-[600px] mx-auto' : 'grid-cols-2 md:grid-cols-4'
            }`}
          >
            {look.images.gallery.map((src, i) => (
              <div key={src} className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={src}
                  alt={`${look.name} gown detail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </StaggerReveal>
        </section>
      )}

      <section className="bg-dark px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="1.0 Love Notes" light />
          <div className="mt-2xl md:mt-3xl">
            <TestimonialCard
              quote={testimonial.quote}
              name={testimonial.name}
              city={testimonial.city}
              year={testimonial.year}
              dress={testimonial.dress}
              collection={testimonial.collection}
              featured
            />
          </div>
        </Reveal>
      </section>

      <section className="bg-surface px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="2.0 Recommended" />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[16ch]">
            You Might Also Love
          </h2>
        </Reveal>

        <StaggerReveal className="grid grid-cols-2 md:grid-cols-3 gap-md md:gap-lg mt-2xl">
          {recommended.map((rec) => (
            <LookCard
              key={rec.slug}
              slug={rec.slug}
              name={rec.name}
              collection={rec.collection}
              fabric={rec.fabric[0]}
              image={rec.images.card}
            />
          ))}
        </StaggerReveal>
      </section>
    </>
  );
}
