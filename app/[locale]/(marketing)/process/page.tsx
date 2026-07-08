import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProcessHero } from '@/components/ui/ProcessHero';
import { Timeline } from '@/components/ui/Timeline';
import { SectionMarker } from '@/components/ui/SectionMarker';
import { ProcessStep } from '@/components/ui/ProcessStep';
import { MeasurementCard } from '@/components/ui/MeasurementCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { Reveal } from '@/components/ui/Reveal';
import { StaggerReveal } from '@/components/ui/StaggerReveal';
import { Link } from '@/i18n/navigation';

import { processSteps } from '@/data/dummy/process-steps';
import { measurements } from '@/data/dummy/measurements';
import { testimonials } from '@/data/dummy/testimonials';

const remoteTestimonial = testimonials.find((t) => t.id === '6') ?? testimonials[0];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'process.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function ProcessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('process');

  const timelineStages = [
    { week: t('timeline.week0'), label: t('timeline.consultation') },
    { week: t('timeline.week1_2'), label: t('timeline.designFabric') },
    { week: t('timeline.week3'), label: t('timeline.measurements') },
    { week: t('timeline.week4_12'), label: t('timeline.creation') },
    { week: t('timeline.week13_14'), label: t('timeline.delivery') },
  ];

  return (
    <>
      <ProcessHero />

      {/* Timeline banner */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-4xl border-b-hairline border-border-l">
        <Reveal>
          <Timeline stages={timelineStages} />
        </Reveal>
      </section>

      {/* 2.1 Five Steps */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label={t('fiveSteps.marker')} />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[18ch]">
            {t('fiveSteps.headline')}
          </h2>
        </Reveal>

        <StaggerReveal className="mt-2xl md:mt-3xl">
          {processSteps.map((step, i) => (
            <ProcessStep
              key={step.number}
              number={step.number}
              title={step.title}
              eyebrow={step.eyebrow}
              description={step.description}
              detail={step.detail}
              image={step.image}
              imageAlt={step.imageAlt}
              imageLeft={i % 2 === 1}
            />
          ))}
        </StaggerReveal>
      </section>

      {/* 2.2 Measurement Guide */}
      <section className="bg-surface px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label={t('measurementGuide.marker')} />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[18ch]">
            {t('measurementGuide.headline')}
          </h2>
          <p className="font-body text-body text-muted mt-lg max-w-[52ch]">{t('measurementGuide.body')}</p>
        </Reveal>

        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-md md:gap-lg mt-2xl md:mt-3xl">
          {measurements.map((m) => (
            <MeasurementCard
              key={m.number}
              number={m.number}
              label={m.label}
              instruction={m.instruction}
            />
          ))}
        </StaggerReveal>
      </section>

      {/* 2.3 In Their Words */}
      <section className="bg-dark px-md py-3xl md:px-xl md:py-section">
        <Reveal>
          <SectionMarker label={t('inTheirWords.marker')} light />
          <div className="mt-2xl md:mt-3xl">
            <TestimonialCard
              quote={remoteTestimonial.quote}
              name={remoteTestimonial.name}
              city={remoteTestimonial.city}
              year={remoteTestimonial.year}
              dress={remoteTestimonial.dress}
              collection={remoteTestimonial.collection}
              featured
            />
          </div>
        </Reveal>
      </section>

      {/* 2.4 Begin */}
      <section className="bg-light px-md py-3xl md:px-xl md:py-section text-center">
        <Reveal className="flex flex-col items-center">
          <SectionMarker label={t('begin.marker')} />
          <h2 className="font-display font-light text-display-sm md:text-display-md text-ink mt-md max-w-[14ch]">
            {t('begin.headline')}
          </h2>
          <p className="font-body text-body text-muted mt-lg max-w-[48ch]">{t('begin.body')}</p>
          <Link href="/inquire" className="cta-link font-body text-nav uppercase text-ink mt-xl inline-block">
            {t('begin.cta')}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
