import Link from 'next/link';
import type { Metadata } from 'next';

import { ProcessHero } from '@/components/ui/ProcessHero';
import { Timeline } from '@/components/ui/Timeline';
import { SectionMarker } from '@/components/ui/SectionMarker';
import { ProcessStep } from '@/components/ui/ProcessStep';
import { MeasurementCard } from '@/components/ui/MeasurementCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { Reveal } from '@/components/ui/Reveal';
import { StaggerReveal } from '@/components/ui/StaggerReveal';

import { processSteps } from '@/data/dummy/process-steps';
import { measurements } from '@/data/dummy/measurements';
import { testimonials } from '@/data/dummy/testimonials';

export const metadata: Metadata = {
  title: 'The Process — LM Weddyli',
  description:
    'From first conversation to final stitch — how a made-to-measure LM Weddyli gown comes to life, from Lubumbashi to Istanbul.',
};

const timelineStages = [
  { week: 'Week 0', label: 'Consultation' },
  { week: 'Week 1 – 2', label: 'Design & Fabric' },
  { week: 'Week 3', label: 'Measurements' },
  { week: 'Week 4 – 12', label: 'Creation' },
  { week: 'Week 13 – 14', label: 'Delivery' },
];

const remoteTestimonial = testimonials.find((t) => t.id === '6') ?? testimonials[0];

export default function ProcessPage() {
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
          <SectionMarker label="2.1 Five Steps" />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[18ch]">
            Every Detail, Considered
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
          <SectionMarker label="2.2 Measurement Guide" />
          <h2 className="font-display font-light text-display-xs md:text-display-md text-ink mt-md max-w-[18ch]">
            Eight Measurements, Taken At Home
          </h2>
          <p className="font-body text-body text-muted mt-lg max-w-[52ch]">
            No showroom visit required. A written guide and a video call with Linda walk you
            through each of these, step by step.
          </p>
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
          <SectionMarker label="2.3 In Their Words" light />
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
          <SectionMarker label="2.4 Begin" />
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
