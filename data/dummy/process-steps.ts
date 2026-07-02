import type { ProcessStep } from '@/types/process-step';

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Consultation',
    eyebrow: 'Week 0 — Free',
    description:
      'A conversation, not a sales pitch. We talk through your story, your silhouette, your day.',
    detail: 'Held over video or WhatsApp — wherever you are.',
  },
  {
    number: '02',
    title: 'Measurements',
    eyebrow: 'Week 1',
    description:
      'Guided self-measurement with Linda on the line. No showroom visit required.',
    detail: 'A written guide and video call walk you through every step.',
  },
  {
    number: '03',
    title: 'The Atelier',
    eyebrow: 'Weeks 2 – 9',
    description:
      'Your gown is hand-cut and constructed in our Istanbul workshop, to your measurements alone.',
    detail: 'Progress photos shared at each major milestone.',
  },
  {
    number: '04',
    title: 'Fitting & Finishing',
    eyebrow: 'Week 10',
    description: 'Final adjustments confirmed with you before the gown ever leaves the atelier.',
    detail: 'Every seam checked twice.',
  },
  {
    number: '05',
    title: 'Delivery',
    eyebrow: 'Week 11 – 12',
    description: 'Your gown arrives, pressed and boxed, wherever home is.',
    detail: 'Tracked shipping with signature required on arrival.',
  },
];
