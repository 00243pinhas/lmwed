import type { ProcessStep } from '@/types/process-step';

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Consultation',
    eyebrow: 'Week 0',
    description:
      'A conversation, not a sales pitch. We talk through your story, your silhouette, your day.',
    detail: 'Held over video or WhatsApp — wherever you are, free of charge.',
    image: '/brand_assets/photography/naomi-hero.jpg.jpg',
    imageAlt: 'A bride in conversation during an initial consultation',
  },
  {
    number: '02',
    title: 'Design & Fabric',
    eyebrow: 'Week 1 – 2',
    description:
      'Your silhouette is finalized and fabric selected. Sketches and swatches are shared for your approval.',
    detail: 'Nothing is cut until you sign off on every detail.',
    image: '/brand_assets/photography/fleur-hero.jpg',
    imageAlt: 'Fabric swatches and a sketch laid out on a dark studio table',
  },
  {
    number: '03',
    title: 'Measurements',
    eyebrow: 'Week 3',
    description:
      'Guided self-measurement with Linda on the line. No showroom visit required.',
    detail: 'A written guide and video call walk you through every step.',
    image: '/brand_assets/photography/rachel-hero.jpg',
    imageAlt: 'A guided measurement session captured over video call',
  },
  {
    number: '04',
    title: 'Creation in Istanbul',
    eyebrow: 'Week 4 – 12',
    description:
      'Your gown is hand-cut and constructed in our Istanbul workshop, to your measurements alone.',
    detail: 'Progress photos shared at each major milestone.',
    image: '/brand_assets/photography/zara-hero.jpg',
    imageAlt: 'A gown taking shape on a tailoring form in the Istanbul workshop',
  },
  {
    number: '05',
    title: 'Delivery & Final Fitting',
    eyebrow: 'Week 13 – 14',
    description:
      'Final adjustments confirmed with you, then your gown arrives pressed, boxed, and ready.',
    detail: 'Tracked shipping with signature required on arrival.',
    image: '/brand_assets/photography/joelle-hero.jpg',
    imageAlt: 'The finished gown, pressed and ready for delivery',
  },
];
