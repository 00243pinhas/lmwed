import type { Metadata } from 'next';
import { cormorant, jost } from '@/lib/fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'LM Weddyli — Luxury Bridal by Linda Monga',
  description:
    'LM Weddyli — luxury bridal atelier by Linda Monga. Designed in Lubumbashi, produced in Istanbul.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
