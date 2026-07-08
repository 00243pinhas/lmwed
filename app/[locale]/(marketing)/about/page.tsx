import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { AboutHero } from '@/components/ui/AboutHero';
import { SectionMarker } from '@/components/ui/SectionMarker';
import { Reveal } from '@/components/ui/Reveal';
import { StaggerReveal } from '@/components/ui/StaggerReveal';

import {
  storyPullQuote,
  storyParagraphs,
  productionModel,
  values,
  stats,
  founderTestimonial,
} from '@/data/dummy/about-content';

export const metadata: Metadata = {
  title: 'About Linda Monga — LM Weddyli',
  description:
    'Linda Monga is the founder of LM Weddyli, a made-to-measure bridal house designed in Lubumbashi and hand-crafted in Istanbul.',
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />

      {/* 3.1 Her Story */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="3.1 Her Story" />
        </Reveal>

        <div className="mt-2xl md:mt-3xl grid grid-cols-1 md:grid-cols-2 gap-xl md:gap-4xl">
          <Reveal>
            <p className="font-display italic font-light text-display-xs md:text-display-sm text-ink leading-[1.5]">
              &ldquo;{storyPullQuote}&rdquo;
            </p>
          </Reveal>

          <Reveal className="flex flex-col gap-lg">
            {storyParagraphs.map((paragraph, i) => (
              <p key={i} className="font-body text-body text-muted max-w-[52ch]">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 3.2 Two Cities, One Dress */}
      <section className="bg-dark px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="3.2 The Atelier" light />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-white mt-md max-w-[16ch]">
            {productionModel.headline}
          </h2>
        </Reveal>

        <div className="mt-2xl md:mt-3xl flex flex-col md:flex-row md:items-start gap-lg md:gap-2xl">
          <Reveal className="flex flex-1 flex-col gap-lg">
            {productionModel.paragraphs.map((paragraph, i) => (
              <p key={i} className="font-body text-body text-white/70 max-w-[46ch]">
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal className="relative aspect-[4/3] w-full md:flex-1">
            <Image
              src={productionModel.image}
              alt={productionModel.imageAlt}
              fill
              quality={90}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Reveal>
        </div>
      </section>

      {/* 3.3 What We Stand For */}
      <section className="bg-surface px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="3.3 What We Stand For" />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[18ch]">
            The Principles Behind Every Gown
          </h2>
        </Reveal>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-2xl mt-2xl md:mt-3xl">
          {values.map((value) => (
            <div key={value.numeral} className="flex flex-col gap-sm">
              <p className="font-display font-light text-[72px] leading-none text-accent">
                {value.numeral}
              </p>
              <h3 className="font-display font-light text-display-xs text-ink mt-sm">{value.title}</h3>
              <p className="font-body text-[13px] text-muted leading-[1.7] max-w-[36ch]">
                {value.description}
              </p>
            </div>
          ))}
        </StaggerReveal>

        {/* Stats */}
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-lg md:gap-2xl mt-3xl md:mt-4xl pt-2xl md:pt-3xl border-t-hairline border-border-l text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-xs">
              <p className="font-display font-light text-display-sm md:text-display-md text-ink">
                {stat.value}
              </p>
              <p className="font-body text-[10px] uppercase tracking-[0.14em] text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </StaggerReveal>
      </section>

      {/* 3.4 In Her Words */}
      <section className="bg-dark px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label="3.4 In Her Words" light />
          <div className="mt-2xl md:mt-3xl flex flex-col items-center text-center gap-lg md:gap-xl max-w-[720px] mx-auto">
            <p className="font-display italic font-light text-display-xs md:text-display-md text-white leading-[1.5]">
              &ldquo;{founderTestimonial.quote}&rdquo;
            </p>
            <p className="font-body text-[9px] uppercase tracking-[0.14em] text-accent">
              {founderTestimonial.name} — {founderTestimonial.role}
            </p>
          </div>
        </Reveal>
      </section>

      {/* 3.5 Begin */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section text-center">
        <Reveal className="flex flex-col items-center">
          <SectionMarker label="3.5 Begin" />
          <h2 className="font-display font-light text-display-sm md:text-display-md text-ink mt-md max-w-[16ch]">
            Let&rsquo;s Design Your Story
          </h2>
          <p className="font-body text-body text-muted mt-lg max-w-[48ch]">
            Whether you&rsquo;re ready to begin or simply want to see the collection first, Linda
            would love to hear from you.
          </p>
          <div className="flex flex-col md:flex-row gap-md md:gap-2xl mt-xl items-center">
            <Link href="/inquire" className="cta-link font-body text-nav uppercase text-ink inline-block">
              Begin your journey →
            </Link>
            <Link
              href="/collections"
              className="cta-link font-body text-nav uppercase text-ink inline-block"
            >
              View the collection →
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
