import type { Metadata } from 'next';

import { InquiryForm } from '@/components/forms/InquiryForm';
import { InquireHeader } from '@/components/ui/InquireHeader';

import { trustPoints } from '@/data/dummy/trust-points';
import { testimonials } from '@/data/dummy/testimonials';

export const metadata: Metadata = {
  title: 'Inquire — LM Weddyli',
  description: 'Tell us about your wedding. Linda reviews every inquiry personally and responds within 24 hours.',
};

export default function InquirePage() {
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
