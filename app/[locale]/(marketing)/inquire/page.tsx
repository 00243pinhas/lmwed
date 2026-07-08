import { getTranslations, setRequestLocale } from 'next-intl/server';

import { InquiryForm } from '@/components/forms/InquiryForm';
import { InquireHeader } from '@/components/ui/InquireHeader';

import { trustPoints } from '@/data/dummy/trust-points';
import { testimonials } from '@/data/dummy/testimonials';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'inquire.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function InquirePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const testimonial = testimonials.find((t) => t.featured) ?? testimonials[0];

  return (
    <>
      <InquireHeader />
      <section className="bg-light">
        <InquiryForm trustPoints={trustPoints} testimonial={testimonial} />
      </section>
    </>
  );
}
