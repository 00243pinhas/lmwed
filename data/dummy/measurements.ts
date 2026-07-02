import type { Measurement } from '@/types/measurement';

export const measurements: Measurement[] = [
  {
    number: '01',
    label: 'Bust',
    instruction: 'Measure around the fullest part of your bust, keeping the tape level.',
  },
  {
    number: '02',
    label: 'Waist',
    instruction: 'Measure around your natural waistline, just above the belly button.',
  },
  {
    number: '03',
    label: 'Hips',
    instruction: 'Measure around the fullest part of your hips, feet together.',
  },
  {
    number: '04',
    label: 'Shoulder Width',
    instruction: 'Measure straight across the back, from shoulder point to shoulder point.',
  },
  {
    number: '05',
    label: 'Arm Length',
    instruction: 'Measure from the shoulder point to the wrist bone, arm slightly bent.',
  },
  {
    number: '06',
    label: 'Torso Length',
    instruction: 'Measure from the top of the shoulder down to the natural waistline.',
  },
  {
    number: '07',
    label: 'Height',
    instruction: 'Measure barefoot, standing straight against a flat wall.',
  },
  {
    number: '08',
    label: 'Hollow to Hem',
    instruction: 'Measure from the base of your throat to where you want the gown to end.',
  },
];
