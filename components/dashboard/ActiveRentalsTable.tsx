'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { StatusPill } from '@/components/dashboard/StatusPill';
import type { ActiveRental, PaymentMethod } from '@/types/rental';

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

const ACTION_BUTTON_CLASS =
  'min-h-[44px] px-md bg-dark text-white rounded-sm font-body text-[12px] uppercase tracking-[0.08em] disabled:opacity-50';

function isOverdue(dueDate: string) {
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

function RecordReturnAction({ rental }: { rental: ActiveRental }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/rentals/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalId: rental.id, method }),
      });
      const result = await res.json();

      if (!result.ok) {
        setError(result.error ?? 'Could not record return');
        return;
      }

      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={ACTION_BUTTON_CLASS}>
        Record Return
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-xs items-start">
      <div className="flex flex-wrap items-center gap-xs">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className="min-h-[44px] font-body text-[13px] text-ink border-hairline border-border-l rounded-sm px-sm bg-white"
        >
          {METHOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleConfirm} disabled={submitting} className={ACTION_BUTTON_CLASS}>
          {submitting ? 'Recording…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={submitting}
          className="min-h-[44px] px-md border-hairline border-border-l text-ink rounded-sm font-body text-[12px] uppercase tracking-[0.08em] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="font-body text-[12px] text-alert bg-alert-bg rounded-sm px-sm py-xs">{error}</p>
      )}
    </div>
  );
}

export function ActiveRentalsTable({ rentals }: { rentals: ActiveRental[] }) {
  if (rentals.length === 0) {
    return (
      <p className="font-body text-[14px] text-muted">
        No active rentals. Log one below to see it here.
      </p>
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto rounded-sm border-hairline border-border-l bg-white shadow-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-hairline border-border-l">
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Dress
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Client
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Out
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Due
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Status
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => {
              const overdue = isOverdue(rental.due_date);
              return (
                <tr
                  key={rental.id}
                  className="border-b-hairline border-border-l last:border-b-0 hover:bg-light transition-colors duration-ui ease-standard"
                >
                  <td className="px-lg py-md font-body text-[14px] text-ink">
                    <p>{rental.dress?.name ?? '—'}</p>
                    {rental.dress?.size && (
                      <p className="text-[12px] text-muted">Size {rental.dress.size}</p>
                    )}
                  </td>
                  <td className="px-lg py-md font-body text-[14px] text-ink">
                    <p>{rental.client_name}</p>
                    <p className="text-[12px] text-muted">{rental.client_phone}</p>
                  </td>
                  <td className="px-lg py-md font-body text-[14px] text-ink tabular-nums">
                    {rental.out_date}
                  </td>
                  <td className="px-lg py-md font-body text-[14px] text-ink tabular-nums">
                    {rental.due_date}
                  </td>
                  <td className="px-lg py-md">
                    <StatusPill label={overdue ? 'Overdue' : 'Active'} tone={overdue ? 'alert' : 'ok'} />
                  </td>
                  <td className="px-lg py-md">
                    <RecordReturnAction rental={rental} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-md">
        {rentals.map((rental) => {
          const overdue = isOverdue(rental.due_date);
          return (
            <div
              key={rental.id}
              className="rounded-sm border-hairline border-border-l bg-white shadow-card px-lg py-md flex flex-col gap-xs"
            >
              <div className="flex items-center justify-between gap-md">
                <p className="font-body text-[14px] text-ink">
                  {rental.dress?.name ?? '—'}
                  {rental.dress?.size ? ` · Size ${rental.dress.size}` : ''}
                </p>
                <StatusPill label={overdue ? 'Overdue' : 'Active'} tone={overdue ? 'alert' : 'ok'} />
              </div>
              <p className="font-body text-[12px] text-muted">
                {rental.client_name} · {rental.client_phone}
              </p>
              <p className="font-body text-[12px] text-muted">
                Out {rental.out_date} · Due {rental.due_date}
              </p>
              <RecordReturnAction rental={rental} />
            </div>
          );
        })}
      </div>
    </>
  );
}
