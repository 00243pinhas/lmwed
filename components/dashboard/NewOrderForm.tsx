'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import type { UnconvertedInquiry } from '@/types/order';
import type { PaymentMethod } from '@/types/rental';

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

const FIELD_CLASS =
  'min-h-[44px] font-body text-[14px] text-ink border-hairline border-border-l rounded-sm px-md bg-white';
const LABEL_CLASS = 'font-body text-[11px] uppercase tracking-[0.06em] text-muted';

function formatPrice(price: number) {
  return `$${Math.round(price)}`;
}

export function NewOrderForm({ inquiries }: { inquiries: UnconvertedInquiry[] }) {
  const router = useRouter();
  const [inquiryId, setInquiryId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [description, setDescription] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const priceValue = Number(agreedPrice);
  const depositAmount =
    agreedPrice.trim() !== '' && priceValue > 0 ? Math.round(priceValue * 0.8 * 100) / 100 : null;

  function handlePickInquiry(id: string) {
    setInquiryId(id);
    const inquiry = inquiries.find((item) => item.id === id);
    if (inquiry) {
      setClientName(inquiry.first_name);
      setClientPhone(inquiry.whatsapp);
      setDescription(inquiry.dress_description ?? '');
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (
      !clientName.trim() ||
      !clientPhone.trim() ||
      !description.trim() ||
      !expectedDelivery ||
      !(priceValue > 0)
    ) {
      setError('Please fill in every field with a valid agreed price.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          description: description.trim(),
          agreedPrice: priceValue,
          expectedDelivery,
          inquiryId: inquiryId || undefined,
          method,
        }),
      });
      const result = await res.json();

      if (!result.ok) {
        setError(result.error ?? 'Could not create order');
        return;
      }

      setSuccess(true);
      setInquiryId('');
      setClientName('');
      setClientPhone('');
      setDescription('');
      setAgreedPrice('');
      setExpectedDelivery('');
      setMethod('cash');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[420px] flex flex-col gap-lg rounded-sm border-hairline border-border-l bg-white shadow-card px-lg py-lg"
    >
      {inquiries.length > 0 && (
        <div className="flex flex-col gap-xs">
          <label htmlFor="inquiry" className={LABEL_CLASS}>
            Prefill from Inquiry (optional)
          </label>
          <select
            id="inquiry"
            value={inquiryId}
            onChange={(e) => handlePickInquiry(e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">— Blank order —</option>
            {inquiries.map((inquiry) => (
              <option key={inquiry.id} value={inquiry.id}>
                {inquiry.first_name} · {inquiry.whatsapp}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-xs">
        <label htmlFor="clientName" className={LABEL_CLASS}>
          Client Name
        </label>
        <input
          id="clientName"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="clientPhone" className={LABEL_CLASS}>
          Client Phone
        </label>
        <input
          id="clientPhone"
          type="tel"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="font-body text-[14px] text-ink border-hairline border-border-l rounded-sm px-md py-sm bg-white"
        />
      </div>

      <div className="flex gap-md">
        <div className="flex-1 flex flex-col gap-xs">
          <label htmlFor="agreedPrice" className={LABEL_CLASS}>
            Agreed Price
          </label>
          <input
            id="agreedPrice"
            type="number"
            min="0"
            step="0.01"
            value={agreedPrice}
            onChange={(e) => setAgreedPrice(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex-1 flex flex-col gap-xs">
          <label htmlFor="expectedDelivery" className={LABEL_CLASS}>
            Expected Delivery
          </label>
          <input
            id="expectedDelivery"
            type="date"
            value={expectedDelivery}
            onChange={(e) => setExpectedDelivery(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <span className={LABEL_CLASS}>Deposit (80%)</span>
        <p className="font-body text-[14px] text-ink tabular-nums min-h-[44px] flex items-center border-hairline border-border-l rounded-sm px-md bg-light">
          {depositAmount !== null ? formatPrice(depositAmount) : '—'}
        </p>
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="method" className={LABEL_CLASS}>
          Deposit Payment Method
        </label>
        <select
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className={FIELD_CLASS}
        >
          {METHOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="font-body text-[13px] text-alert bg-alert-bg rounded-sm px-md py-sm">{error}</p>
      )}
      {success && (
        <p className="font-body text-[13px] text-ok bg-ok-bg rounded-sm px-md py-sm">
          Order created — deposit recorded.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="min-h-[44px] bg-dark text-white rounded-sm font-body text-[12px] uppercase tracking-[0.08em] disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create Order'}
      </button>
    </form>
  );
}
