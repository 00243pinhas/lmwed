import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { cormorant, jost } from '@/lib/fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'LM Weddyli — Luxury Bridal by Linda Monga',
  description:
    'LM Weddyli — luxury bridal atelier by Linda Monga. Designed in Lubumbashi, produced in Istanbul.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Locale = (typeof routing.locales)[number];

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  // Enables static rendering for this locale — see next-intl docs.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
