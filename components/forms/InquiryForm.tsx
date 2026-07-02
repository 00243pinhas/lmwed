'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { FormField } from '@/components/forms/FormField';
import { OptionRow } from '@/components/forms/OptionRow';
import { StepIndicator } from '@/components/forms/StepIndicator';
import { contact } from '@/data/dummy/contact';
import type { Testimonial } from '@/types/testimonial';
import type { TrustPoint } from '@/types/trust-point';

const ease = [0.16, 1, 0.3, 1] as const;

const serviceOptions = ['Custom Gown', 'Rental', 'Not sure yet'];
const silhouetteOptions = ['A-Line', 'Ball Gown', 'Mermaid', 'Slip', 'Not sure'];
const budgetOptions = ['Under $500', '$500–$1,200', '$1,200–$2,500', '$2,500+'];
const foundUsOptions = ['Instagram', 'TikTok', 'A friend', 'Other'];

type FormData = {
  firstName: string;
  city: string;
  whatsapp: string;
  email: string;
  serviceType: string;
  silhouette: string;
  dreamDress: string;
  inspirationLink: string;
  weddingMonth: string;
  weddingYear: string;
  weddingCity: string;
  budget: string;
  foundUs: string;
};

const initialData: FormData = {
  firstName: '',
  city: '',
  whatsapp: '',
  email: '',
  serviceType: '',
  silhouette: '',
  dreamDress: '',
  inspirationLink: '',
  weddingMonth: '',
  weddingYear: '',
  weddingCity: '',
  budget: '',
  foundUs: '',
};

type FieldError = { field: keyof FormData; message: string } | null;

const stepVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

function validateStep(step: number, data: FormData): FieldError {
  if (step === 0) {
    if (!data.firstName.trim()) return { field: 'firstName', message: 'Please share your first name.' };
    if (!data.city.trim()) return { field: 'city', message: 'Please share your city.' };
    if (!data.whatsapp.trim()) return { field: 'whatsapp', message: 'A WhatsApp number is required.' };
  }
  if (step === 1) {
    if (!data.serviceType) return { field: 'serviceType', message: 'Please choose one option.' };
    if (!data.dreamDress.trim()) return { field: 'dreamDress', message: 'Tell us a little about the dress.' };
  }
  if (step === 2) {
    if (!data.weddingMonth.trim()) return { field: 'weddingMonth', message: 'Wedding month is required.' };
    if (!data.weddingYear.trim()) return { field: 'weddingYear', message: 'Wedding year is required.' };
    if (!data.weddingCity.trim()) return { field: 'weddingCity', message: 'Wedding city is required.' };
    if (!data.budget) return { field: 'budget', message: 'Please select a budget range.' };
    if (!data.foundUs) return { field: 'foundUs', message: 'Please tell us how you found us.' };
  }
  return null;
}

type Props = {
  trustPoints: TrustPoint[];
  testimonial: Testimonial;
};

export function InquiryForm({ trustPoints, testimonial }: Props) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<FormData>(initialData);
  const [error, setError] = useState<FieldError>(null);
  const prefersReduced = useReducedMotion();

  const update = (field: keyof FormData, value: string) => {
    setData((d) => ({ ...d, [field]: value }));
    if (error?.field === field) setError(null);
  };

  const errorFor = (field: keyof FormData) => (error?.field === field ? error.message : undefined);

  useEffect(() => {
    if (submitted) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [submitted]);

  const handleNext = () => {
    const err = validateStep(step, data);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    const err = validateStep(step, data);
    if (err) {
      setError(err);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-md py-3xl md:px-xl md:py-4xl">
      <div className="md:grid md:grid-cols-5 md:gap-2xl">
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.3, ease }}
              >
                <StepIndicator current={step} />

                <div className="mt-2xl md:mt-3xl overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      variants={prefersReduced ? undefined : stepVariants}
                      initial={prefersReduced ? 'center' : 'enter'}
                      animate="center"
                      exit={prefersReduced ? 'center' : 'exit'}
                      transition={{ duration: prefersReduced ? 0 : 0.35, ease }}
                      className="flex flex-col gap-xl"
                    >
                      {step === 0 && (
                        <>
                          <FormField
                            label="Your first name"
                            value={data.firstName}
                            onChange={(v) => update('firstName', v)}
                            placeholder="Linda, Marie, Amara..."
                            error={errorFor('firstName')}
                            autoComplete="given-name"
                          />
                          <FormField
                            label="Your city"
                            value={data.city}
                            onChange={(v) => update('city', v)}
                            placeholder="Lubumbashi, Kinshasa..."
                            error={errorFor('city')}
                            autoComplete="address-level2"
                          />
                          <FormField
                            label="WhatsApp number"
                            type="tel"
                            value={data.whatsapp}
                            onChange={(v) => update('whatsapp', v)}
                            placeholder="+243 ..."
                            note="Linda will reach out here within 24 hours."
                            error={errorFor('whatsapp')}
                            autoComplete="tel"
                          />
                          <FormField
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(v) => update('email', v)}
                            placeholder="Optional — WhatsApp is enough"
                            optional
                            autoComplete="email"
                          />
                        </>
                      )}

                      {step === 1 && (
                        <>
                          <OptionRow
                            label="What are you looking for?"
                            options={serviceOptions}
                            value={data.serviceType}
                            onChange={(v) => update('serviceType', v)}
                            error={errorFor('serviceType')}
                          />
                          <OptionRow
                            label="Silhouette"
                            options={silhouetteOptions}
                            value={data.silhouette}
                            onChange={(v) => update('silhouette', v)}
                          />
                          <div>
                            <label className="font-body text-[9px] uppercase tracking-[0.14em] text-muted block">
                              Describe your dream dress
                            </label>
                            <textarea
                              rows={5}
                              value={data.dreamDress}
                              onChange={(e) => update('dreamDress', e.target.value)}
                              placeholder="Tell Linda about the silhouette, fabric, or feeling you're imagining..."
                              className={`mt-sm block w-full resize-none border-0 border-b-hairline bg-transparent font-display text-[18px] text-ink outline-none transition-colors duration-200 ease-standard placeholder:text-accent ${
                                errorFor('dreamDress')
                                  ? 'border-b-[1px] border-[#B91C1C]'
                                  : 'border-border-l focus:border-ink'
                              }`}
                            />
                            {errorFor('dreamDress') && (
                              <p className="font-body text-[10px] text-[#B91C1C] mt-xs">{errorFor('dreamDress')}</p>
                            )}
                          </div>
                          <FormField
                            label="Inspiration link"
                            type="url"
                            value={data.inspirationLink}
                            onChange={(v) => update('inspirationLink', v)}
                            placeholder="A Pinterest board, Instagram post..."
                            optional
                          />
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div className="grid grid-cols-2 gap-lg">
                            <FormField
                              label="Wedding month"
                              value={data.weddingMonth}
                              onChange={(v) => update('weddingMonth', v)}
                              placeholder="June"
                              error={errorFor('weddingMonth')}
                            />
                            <FormField
                              label="Wedding year"
                              value={data.weddingYear}
                              onChange={(v) => update('weddingYear', v)}
                              placeholder="2027"
                              error={errorFor('weddingYear')}
                            />
                          </div>
                          <FormField
                            label="Wedding city/country"
                            value={data.weddingCity}
                            onChange={(v) => update('weddingCity', v)}
                            placeholder="Lubumbashi, DRC..."
                            error={errorFor('weddingCity')}
                          />
                          <OptionRow
                            label="Budget range"
                            options={budgetOptions}
                            value={data.budget}
                            onChange={(v) => update('budget', v)}
                            error={errorFor('budget')}
                          />
                          <OptionRow
                            label="How did you find us?"
                            options={foundUsOptions}
                            value={data.foundUs}
                            onChange={(v) => update('foundUs', v)}
                            error={errorFor('foundUs')}
                          />
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {step === 2 && (
                  <p className="md:hidden font-body text-[10px] uppercase tracking-[0.1em] text-accent text-center mt-xl">
                    Linda reviews every inquiry personally — private, WhatsApp only.
                  </p>
                )}

                <div className="mt-xl flex flex-col gap-md md:flex-row md:items-center md:justify-between">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center w-fit min-h-11 order-2 md:order-1"
                    >
                      <span className="cta-link font-body text-nav uppercase text-ink">← Back</span>
                    </button>
                  )}
                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center w-fit min-h-11 ml-auto order-1 md:order-2"
                    >
                      <span className="cta-link font-body text-nav uppercase text-ink">Continue →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="order-1 md:order-2 w-full md:w-auto md:min-w-[280px] h-14 bg-dark text-white font-body text-[13px] uppercase tracking-[0.14em] hover:bg-[#2A2420] transition-colors duration-200 ease-standard"
                    >
                      Send My Inquiry
                    </button>
                  )}
                </div>

                {step === 2 && (
                  <div className="mt-lg text-center md:text-left">
                    <p className="font-body text-[10px] uppercase tracking-[0.1em] text-accent">
                      Linda responds within 24 hours via WhatsApp
                    </p>
                    <p className="font-body text-[10px] text-muted mt-xs">
                      Your information is private and never shared
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReduced ? 0 : 0.5, ease }}
                className="max-w-[480px] mx-auto text-center py-2xl"
              >
                <p className="font-body text-[10px] uppercase tracking-[0.14em] text-accent">✓ Received</p>
                <h2 className="font-display italic font-light text-[44px] text-ink mt-md leading-[1.1]">
                  Thank you, {data.firstName}.
                </h2>
                <p className="font-body text-body text-muted mt-lg">
                  Linda has received your inquiry and will review it personally. She&rsquo;ll reach out to you on
                  WhatsApp within 24 hours to begin the conversation about your dress.
                </p>
                <a
                  href={contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-link font-body text-nav uppercase text-ink mt-xl inline-block"
                >
                  Message Linda on WhatsApp →
                </a>
                <div className="flex items-center justify-center gap-lg mt-2xl">
                  <Link href="/collections" className="cta-link font-body text-nav uppercase text-muted">
                    ← View the collection
                  </Link>
                  <Link href="/love-notes" className="cta-link font-body text-nav uppercase text-muted">
                    Read love notes →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="hidden md:block md:col-span-2 border-l-hairline border-border-l pl-2xl h-fit md:sticky md:top-[120px]">
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">Why LM Weddyli</p>
          <div className="flex flex-col gap-lg mt-lg">
            {trustPoints.map((point) => (
              <div key={point.title}>
                <p className="font-body font-light text-[13px] text-ink">{point.title}</p>
                <p className="font-body font-light text-[13px] text-muted mt-xs leading-[1.7]">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2xl pt-xl border-t-hairline border-border-l">
            <p className="font-display italic text-[16px] text-ink leading-[1.5]">&ldquo;{testimonial.quote}&rdquo;</p>
            <p className="font-body text-[9px] uppercase tracking-[0.1em] text-muted mt-md">
              {testimonial.name} — {testimonial.city}, {testimonial.year}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
