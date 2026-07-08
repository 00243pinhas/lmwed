import Link from 'next/link';

import { HeroSection } from '@/components/ui/HeroSection';
import { SectionMarker } from '@/components/ui/SectionMarker';
import { LookCard } from '@/components/ui/LookCard';
import { ProcessStep } from '@/components/ui/ProcessStep';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { Reveal } from '@/components/ui/Reveal';
import { StaggerReveal } from '@/components/ui/StaggerReveal';

import { looks } from '@/data/dummy/collections';
import { testimonials } from '@/data/dummy/testimonials';
import { processSteps } from '@/data/dummy/process-steps';

// Naomi's source photo is a bouquet detail shot, not the gown — excluded from
// this curated preview until Linda provides a matching dress photograph.
const featuredSlugs = ['solene', 'elise', 'diata', 'clarisse', 'margot', 'isabelle'];
const featuredLooks = featuredSlugs
  .map((slug) => looks.find((l) => l.slug === slug))
  .filter((l): l is (typeof looks)[number] => Boolean(l));
const featuredTestimonial = testimonials.find((t) => t.featured) ?? testimonials[0];
const previewSteps = processSteps.slice(0, 3);

export default function HomePage() {
  return (
    <>
      <HeroSection
        eyebrow="LM Weddyli — Lubumbashi · Istanbul"
        headline="Where Your Dress Becomes Your Story"
        subline="Made-to-measure bridal, designed in Lubumbashi and hand-crafted in our Istanbul atelier."
        ctaText="Begin your journey →"
        ctaHref="/inquire"
        mediaSrc="/brand_assets/photography/solene-hero.jpg"
        height="full"
      />

      {/* 0.1 The Atelier */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="0.1 The Atelier" />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[14ch]">
            Every Gown Begins With A Conversation
          </h2>
          <p className="font-body text-body text-muted mt-lg max-w-[52ch]">
            LM Weddyli is a made-to-measure bridal atelier founded by Linda Monga. Each gown is
            designed in Lubumbashi and hand-constructed in our Istanbul workshop — fitted to you
            alone, and sent wherever you call home.
          </p>
          <Link href="/process" className="cta-link font-body text-nav uppercase text-ink mt-xl inline-block">
            See the full process →
          </Link>
        </Reveal>
      </section>

      {/* 0.2 The Collection */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="0.2 The Collection" />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[16ch]">
            Twelve Silhouettes, One Philosophy
          </h2>
        </Reveal>

        <StaggerReveal className="grid grid-cols-2 md:grid-cols-3 gap-md md:gap-lg mt-2xl">
          {featuredLooks.map((look, i) => (
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

        <Reveal>
          <Link
            href="/collections"
            className="cta-link font-body text-nav uppercase text-ink mt-2xl inline-block"
          >
            View all looks →
          </Link>
        </Reveal>
      </section>

      {/* 1.0 The Process */}
      <section className="bg-surface px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="1.0 The Process" />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[16ch]">
            From Conversation To Gown, Five Steps
          </h2>
        </Reveal>

        <StaggerReveal className="mt-2xl md:mt-3xl">
          {previewSteps.map((step, i) => (
            <ProcessStep
              key={step.number}
              number={step.number}
              title={step.title}
              eyebrow={step.eyebrow}
              description={step.description}
              image={step.image}
              imageAlt={step.imageAlt}
              imageLeft={i % 2 === 1}
            />
          ))}
        </StaggerReveal>

        <Reveal>
          <Link href="/process" className="cta-link font-body text-nav uppercase text-ink mt-2xl inline-block">
            See the full process →
          </Link>
        </Reveal>
      </section>

      {/* 2.0 Love Notes */}
      <section className="bg-dark px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="2.0 Love Notes" light />
          <div className="mt-2xl md:mt-3xl">
            <TestimonialCard
              quote={featuredTestimonial.quote}
              name={featuredTestimonial.name}
              city={featuredTestimonial.city}
              year={featuredTestimonial.year}
              dress={featuredTestimonial.dress}
              collection={featuredTestimonial.collection}
              featured
            />
          </div>
        </Reveal>
      </section>

      {/* 3.0 Begin */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section text-center">
        <Reveal className="flex flex-col items-center">
          <SectionMarker label="3.0 Begin" />
          <h2 className="font-display font-light text-display-sm md:text-display-md text-ink mt-md max-w-[14ch]">
            Ready To Begin Your Story?
          </h2>
          <p className="font-body text-body text-muted mt-lg max-w-[48ch]">
            A free consultation is the first step. No pressure, no obligation — just a
            conversation about the dress only you could wear.
          </p>
          <Link href="/inquire" className="cta-link font-body text-nav uppercase text-ink mt-xl inline-block">
            Begin your journey →
          </Link>
        </Reveal>
      </section>
    </>
  );
}
