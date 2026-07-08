'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Link } from '@/i18n/navigation';
import { FormField } from '@/components/forms/FormField';
import { OptionRow } from '@/components/forms/OptionRow';
import { StepIndicator } from '@/components/forms/StepIndicator';
import { contact } from '@/data/dummy/contact';
import type { Testimonial } from '@/types/testimonial';
import type { TrustPoint } from '@/types/trust-point';

const ease = [0.16, 1, 0.3, 1] as const;

// Maps the human-readable option labels shown in the UI to the exact enum
// slugs app/api/inquire/route.ts validates with zod.
const serviceTypeSlugs: Record<string, string> = {
  'Custom Gown': 'custom',
  Rental: 'rental',
  'Not sure yet': 'not_sure',
};

const budgetSlugs: Record<string, string> = {
  'Under $500': 'under_500',
  '$500–$1,200': '500_1200',
  '$1,200–$2,500': '1200_2500',
  '$2,500+': '2500_plus',
};

const foundUsSlugs: Record<string, string> = {
  Instagram: 'instagram',
  TikTok: 'tiktok',
  'A friend': 'friend',
  Other: 'other',
};

// Users paste bare domains ("pinterest.com/board/x") into the inspiration
// link field. The API's zod schema requires a fully-qualified URL, so add a
// protocol here rather than rejecting a real, valid link from a real user.
function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

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

type Props = {
  trustPoints: TrustPoint[];
  testimonial: Testimonial;
};

export function InquiryForm({ trustPoints, testimonial }: Props) {
  const t = useTranslations('inquire');
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [data, setData] = useState<FormData>(initialData);
  const [error, setError] = useState<FieldError>(null);
  const prefersReduced = useReducedMotion();

  const serviceOptions = [t('options.service.customGown'), t('options.service.rental'), t('options.service.notSure')];
  const silhouetteOptions = [
    t('options.silhouette.aLine'),
    t('options.silhouette.ballGown'),
    t('options.silhouette.mermaid'),
    t('options.silhouette.slip'),
    t('options.silhouette.notSure'),
  ];
  const budgetOptions = [
    t('options.budget.under500'),
    t('options.budget.range500_1200'),
    t('options.budget.range1200_2500'),
    t('options.budget.over2500'),
  ];
  const foundUsOptions = [
    t('options.foundUs.instagram'),
    t('options.foundUs.tiktok'),
    t('options.foundUs.friend'),
    t('options.foundUs.other'),
  ];

  function validateStep(step: number, data: FormData): FieldError {
    if (step === 0) {
      if (!data.firstName.trim()) return { field: 'firstName', message: t('errors.firstName') };
      if (!data.city.trim()) return { field: 'city', message: t('errors.city') };
      if (!data.whatsapp.trim()) return { field: 'whatsapp', message: t('errors.whatsapp') };
    }
    if (step === 1) {
      if (!data.serviceType) return { field: 'serviceType', message: t('errors.serviceType') };
      if (!data.dreamDress.trim()) return { field: 'dreamDress', message: t('errors.dreamDress') };
    }
    if (step === 2) {
      if (!data.weddingMonth.trim()) return { field: 'weddingMonth', message: t('errors.weddingMonth') };
      if (!data.weddingYear.trim()) return { field: 'weddingYear', message: t('errors.weddingYear') };
      if (!data.weddingCity.trim()) return { field: 'weddingCity', message: t('errors.weddingCity') };
      if (!data.budget) return { field: 'budget', message: t('errors.budget') };
      if (!data.foundUs) return { field: 'foundUs', message: t('errors.foundUs') };
    }
    return null;
  }

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

  const handleSubmit = async () => {
    const err = validateStep(step, data);
    if (err) {
      setError(err);
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          city: data.city,
          whatsapp: data.whatsapp,
          email: data.email,
          serviceType: serviceTypeSlugs[data.serviceType],
          silhouette: data.silhouette,
          dreamDress: data.dreamDress,
          inspirationLink: normalizeUrl(data.inspirationLink),
          weddingMonth: data.weddingMonth,
          weddingYear: data.weddingYear,
          weddingCity: data.weddingCity,
          budget: budgetSlugs[data.budget],
          foundUs: foundUsSlugs[data.foundUs],
        }),
      });

      const result = await res.json();

      if (result.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error || t('errors.submitDefault'));
      }
    } catch {
      setSubmitError(t('errors.submitNetwork'));
    } finally {
      setSubmitting(false);
    }
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
                            label={t('fields.firstName.label')}
                            value={data.firstName}
                            onChange={(v) => update('firstName', v)}
                            placeholder={t('fields.firstName.placeholder')}
                            error={errorFor('firstName')}
                            autoComplete="given-name"
                          />
                          <FormField
                            label={t('fields.city.label')}
                            value={data.city}
                            onChange={(v) => update('city', v)}
                            placeholder={t('fields.city.placeholder')}
                            error={errorFor('city')}
                            autoComplete="address-level2"
                          />
                          <FormField
                            label={t('fields.whatsapp.label')}
                            type="tel"
                            value={data.whatsapp}
                            onChange={(v) => update('whatsapp', v)}
                            placeholder={t('fields.whatsapp.placeholder')}
                            note={t('fields.whatsapp.note')}
                            error={errorFor('whatsapp')}
                            autoComplete="tel"
                          />
                          <FormField
                            label={t('fields.email.label')}
                            type="email"
                            value={data.email}
                            onChange={(v) => update('email', v)}
                            placeholder={t('fields.email.placeholder')}
                            optional
                            optionalLabel={t('fields.optional')}
                            autoComplete="email"
                          />
                        </>
                      )}

                      {step === 1 && (
                        <>
                          <OptionRow
                            label={t('fields.serviceType.label')}
                            options={serviceOptions}
                            value={data.serviceType}
                            onChange={(v) => update('serviceType', v)}
                            error={errorFor('serviceType')}
                          />
                          <OptionRow
                            label={t('fields.silhouette.label')}
                            options={silhouetteOptions}
                            value={data.silhouette}
                            onChange={(v) => update('silhouette', v)}
                          />
                          <div>
                            <label className="font-body text-[9px] uppercase tracking-[0.14em] text-muted block">
                              {t('fields.dreamDress.label')}
                            </label>
                            <textarea
                              rows={5}
                              value={data.dreamDress}
                              onChange={(e) => update('dreamDress', e.target.value)}
                              placeholder={t('fields.dreamDress.placeholder')}
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
                            label={t('fields.inspirationLink.label')}
                            type="url"
                            value={data.inspirationLink}
                            onChange={(v) => update('inspirationLink', v)}
                            placeholder={t('fields.inspirationLink.placeholder')}
                            optional
                            optionalLabel={t('fields.optional')}
                          />
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div className="grid grid-cols-2 gap-lg">
                            <FormField
                              label={t('fields.weddingMonth.label')}
                              value={data.weddingMonth}
                              onChange={(v) => update('weddingMonth', v)}
                              placeholder={t('fields.weddingMonth.placeholder')}
                              error={errorFor('weddingMonth')}
                            />
                            <FormField
                              label={t('fields.weddingYear.label')}
                              value={data.weddingYear}
                              onChange={(v) => update('weddingYear', v)}
                              placeholder={t('fields.weddingYear.placeholder')}
                              error={errorFor('weddingYear')}
                            />
                          </div>
                          <FormField
                            label={t('fields.weddingCity.label')}
                            value={data.weddingCity}
                            onChange={(v) => update('weddingCity', v)}
                            placeholder={t('fields.weddingCity.placeholder')}
                            error={errorFor('weddingCity')}
                          />
                          <OptionRow
                            label={t('fields.budget.label')}
                            options={budgetOptions}
                            value={data.budget}
                            onChange={(v) => update('budget', v)}
                            error={errorFor('budget')}
                          />
                          <OptionRow
                            label={t('fields.foundUs.label')}
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
                    {t('privacyNoteMobile')}
                  </p>
                )}

                <div className="mt-xl flex flex-col gap-md md:flex-row md:items-center md:justify-between">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center w-fit min-h-11 order-2 md:order-1"
                    >
                      <span className="cta-link font-body text-nav uppercase text-ink">{t('actions.back')}</span>
                    </button>
                  )}
                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center w-fit min-h-11 ml-auto order-1 md:order-2"
                    >
                      <span className="cta-link font-body text-nav uppercase text-ink">{t('actions.continue')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="order-1 md:order-2 w-full md:w-auto md:min-w-[280px] h-14 bg-dark text-white font-body text-[13px] uppercase tracking-[0.14em] hover:bg-[#2A2420] transition-colors duration-200 ease-standard disabled:opacity-60"
                    >
                      {submitting ? t('actions.sending') : t('actions.send')}
                    </button>
                  )}
                </div>

                {submitError && (
                  <p className="font-body text-[10px] text-[#B91C1C] mt-md text-center md:text-left">
                    {submitError}
                  </p>
                )}

                {step === 2 && (
                  <div className="mt-lg text-center md:text-left">
                    <p className="font-body text-[10px] uppercase tracking-[0.1em] text-accent">
                      {t('responseNote')}
                    </p>
                    <p className="font-body text-[10px] text-muted mt-xs">{t('privacyNote')}</p>
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
                <p className="font-body text-[10px] uppercase tracking-[0.14em] text-accent">
                  {t('confirmation.received')}
                </p>
                <h2 className="font-display italic font-light text-[44px] text-ink mt-md leading-[1.1]">
                  {t('confirmation.thankYou', { firstName: data.firstName })}
                </h2>
                <p className="font-body text-body text-muted mt-lg">{t('confirmation.body')}</p>
                <a
                  href={contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-link font-body text-nav uppercase text-ink mt-xl inline-block"
                >
                  {t('confirmation.whatsappCta')}
                </a>
                <div className="flex items-center justify-center gap-lg mt-2xl">
                  <Link href="/collections" className="cta-link font-body text-nav uppercase text-muted">
                    {t('confirmation.viewCollection')}
                  </Link>
                  <Link href="/love-notes" className="cta-link font-body text-nav uppercase text-muted">
                    {t('confirmation.readLoveNotes')}
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="hidden md:block md:col-span-2 border-l-hairline border-border-l pl-2xl h-fit md:sticky md:top-[120px]">
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">{t('trustPanel.heading')}</p>
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
