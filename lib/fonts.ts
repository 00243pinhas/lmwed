import { Cormorant_Garamond, Jost } from 'next/font/google';

// Display — Cormorant Garamond, weights 300/400 + italic
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

// Body / UI — Jost, weights 300/400/500
export const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
});
