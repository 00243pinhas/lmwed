'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import type { AvailableDress, PaymentMethod } from '@/types/rental';

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
  return `$${Math.round(Number(price))}`;
}

export function LogRentalForm({ dresses }: { dresses: AvailableDress[] }) {
  const router = useRouter();
  const [dressId, setDressId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [outDate, setOutDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (dresses.length === 0) {
    return (
      <p className="font-body text-[14px] text-muted">
        No dresses available to rent right now.
      </p>
    );
  }

  const selectedDress = dresses.find((dress) => dress.id === dressId);
  const depositAmount = selectedDress ? Math.round(selectedDress.rental_price * 0.8 * 100) / 100 : null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!dressId || !clientName.trim() || !clientPhone.trim() || !outDate || !dueDate) {
      setError('Please fill in every field.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dressId,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          outDate,
          dueDate,
          method,
        }),
      });
      const result = await res.json();

      if (!result.ok) {
        setError(result.error ?? 'Could not log rental');
        return;
      }

      setSuccess(true);
      setDressId('');
      setClientName('');
      setClientPhone('');
      setOutDate('');
      setDueDate('');
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
      <div className="flex flex-col gap-xs">
        <label htmlFor="dress" className={LABEL_CLASS}>
          Dress
        </label>
        <select
          id="dress"
          value={dressId}
          onChange={(e) => setDressId(e.target.value)}
          className={FIELD_CLASS}
        >
          <option value="">Select a dress</option>
          {dresses.map((dress) => (
            <option key={dress.id} value={dress.id}>
              {dress.name} {dress.size ? `· Size ${dress.size}` : ''} · {formatPrice(dress.rental_price)}
            </option>
          ))}
        </select>
      </div>

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

      <div className="flex gap-md">
        <div className="flex-1 flex flex-col gap-xs">
          <label htmlFor="outDate" className={LABEL_CLASS}>
            Out Date
          </label>
          <input
            id="outDate"
            type="date"
            value={outDate}
            onChange={(e) => setOutDate(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex-1 flex flex-col gap-xs">
          <label htmlFor="dueDate" className={LABEL_CLASS}>
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
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
          Payment Method
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
        <p className="font-body text-[13px] text-ok bg-ok-bg rounded-sm px-md py-sm">Rental logged.</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="min-h-[44px] bg-dark text-white rounded-sm font-body text-[12px] uppercase tracking-[0.08em] disabled:opacity-50"
      >
        {submitting ? 'Logging…' : 'Log Rental'}
      </button>
    </form>
  );
}
