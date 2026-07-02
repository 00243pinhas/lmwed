import type { ProcessStep } from '@/types/process-step';

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Consultation',
    eyebrow: 'Week 0 — Free',
    description:
      'A conversation, not a sales pitch. We talk through your story, your silhouette, your day.',
    detail: 'Held over video or WhatsApp — wherever you are.',
    image: '/brand_assets/photography/rachel-hero.jpg',
    imageAlt: 'A bride in quiet reflection, captured in soft monochrome light',
  },
  {
    number: '02',
    title: 'Measurements',
    eyebrow: 'Week 1',
    description:
      'Guided self-measurement with Linda on the line. No showroom visit required.',
    detail: 'A written guide and video call walk you through every step.',
    image: '/brand_assets/photography/joelle-hero.jpg',
    imageAlt: 'A gown displayed on a form, catching window light as it takes shape',
  },
  {
    number: '03',
    title: 'The Atelier',
    eyebrow: 'Weeks 2 – 9',
    description:
      'Your gown is hand-cut and constructed in our Istanbul workshop, to your measurements alone.',
    detail: 'Progress photos shared at each major milestone.',
    image: '/brand_assets/photography/amara-hero.jpg',
    imageAlt: 'A beaded gown on a tailoring form, lit in dramatic chiaroscuro',
  },
  {
    number: '04',
    title: 'Fitting & Finishing',
    eyebrow: 'Week 10',
    description: 'Final adjustments confirmed with you before the gown ever leaves the atelier.',
    detail: 'Every seam checked twice.',
    image: '/brand_assets/photography/zara-hero.jpg',
    imageAlt: 'A bride on an ornate staircase, gown finished and ready to wear',
  },
  {
    number: '05',
    title: 'Delivery',
    eyebrow: 'Week 11 – 12',
    description: 'Your gown arrives, pressed and boxed, wherever home is.',
    detail: 'Tracked shipping with signature required on arrival.',
    image: '/brand_assets/photography/fleur-hero.jpg',
    imageAlt: 'A bride in her finished gown, ready for the day ahead',
  },
];
