import type { Metadata } from 'next';
import { cormorant, jost } from '@/lib/fonts';
import '@/styles/globals.css';

// The dashboard is a staff/owner tool, deliberately kept English-only — see
// CLAUDE.md and skills/dashboard-design.md. It sits outside the /[locale]
// segment entirely, so it owns its own root layout (html/body) rather than
// picking up next-intl's locale-aware one.
export const metadata: Metadata = {
  title: 'Dashboard — LM Weddyli',
  description: 'LM Weddyli staff dashboard.',
};

export default function DashboardRootLayout({
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
