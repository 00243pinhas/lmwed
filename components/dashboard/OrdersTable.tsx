'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { StatusPill, type PillTone } from '@/components/dashboard/StatusPill';
import { OrderProgressUpdates } from '@/components/dashboard/OrderProgressUpdates';
import { ShareLinkButton } from '@/components/dashboard/ShareLinkButton';
import type { Order, OrderStage, OrderUpdateWithSignedUrl } from '@/types/order';
import type { PaymentMethod } from '@/types/rental';

export const STAGE_CONFIG: Record<OrderStage, { label: string; tone: PillTone }> = {
  consultation: { label: 'Consultation', tone: 'neutral' },
  design: { label: 'Design', tone: 'neutral' },
  measurements: { label: 'Measurements', tone: 'neutral' },
  production: { label: 'Production', tone: 'warn' },
  arrived: { label: 'Arrived', tone: 'warn' },
  delivered: { label: 'Delivered', tone: 'ok' },
};

// Mirrors the fixed sequence enforced server-side in advance_order_stage()
// (migration 008). 'arrived' and 'delivered' have no entry here — reaching
// 'delivered' only happens through Record Delivery / complete_order().
const NEXT_STAGE: Partial<Record<OrderStage, OrderStage>> = {
  consultation: 'design',
  design: 'measurements',
  measurements: 'production',
  production: 'arrived',
};

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

const ACTION_BUTTON_CLASS =
  'min-h-[44px] px-md bg-dark text-white rounded-sm font-body text-[12px] uppercase tracking-[0.08em] disabled:opacity-50';

function formatPrice(price: number | null) {
  return price === null ? '—' : `$${Math.round(Number(price))}`;
}

function AdvanceStageAction({ order }: { order: Order }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = NEXT_STAGE[order.stage];

  if (!next) return null;

  async function handleAdvance() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/orders/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const result = await res.json();

      if (!result.ok) {
        setError(result.error ?? 'Could not advance stage');
        return;
      }

      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-xs items-start">
      <button type="button" onClick={handleAdvance} disabled={submitting} className={ACTION_BUTTON_CLASS}>
        {submitting ? 'Advancing…' : `Advance to ${STAGE_CONFIG[next].label}`}
      </button>
      {error && (
        <p className="font-body text-[12px] text-alert bg-alert-bg rounded-sm px-sm py-xs">{error}</p>
      )}
    </div>
  );
}

function RecordDeliveryAction({ order }: { order: Order }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/orders/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, method }),
      });
      const result = await res.json();

      if (!result.ok) {
        setError(result.error ?? 'Could not record delivery');
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
        Record Delivery
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

function OrderActions({ order }: { order: Order }) {
  if (order.stage === 'arrived') return <RecordDeliveryAction order={order} />;
  if (order.stage === 'delivered') return null;
  return <AdvanceStageAction order={order} />;
}

export function OrdersTable({
  orders,
  updatesByOrder,
}: {
  orders: Order[];
  updatesByOrder: Record<string, OrderUpdateWithSignedUrl[]>;
}) {
  if (orders.length === 0) {
    return (
      <p className="font-body text-[14px] text-muted">
        No orders yet. Start the first commission below.
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
                Client
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Agreed Price
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Expected Delivery
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Stage
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Action
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Progress
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Bride Link
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const config = STAGE_CONFIG[order.stage];
              return (
                <tr
                  key={order.id}
                  className="border-b-hairline border-border-l last:border-b-0 hover:bg-light transition-colors duration-ui ease-standard"
                >
                  <td className="px-lg py-md font-body text-[14px] text-ink">
                    <p>{order.client_name}</p>
                    <p className="text-[12px] text-muted">{order.client_phone}</p>
                  </td>
                  <td className="px-lg py-md font-body text-[14px] text-ink tabular-nums">
                    {formatPrice(order.agreed_price)}
                  </td>
                  <td className="px-lg py-md font-body text-[14px] text-ink tabular-nums">
                    {order.expected_delivery ?? '—'}
                  </td>
                  <td className="px-lg py-md">
                    <StatusPill label={config.label} tone={config.tone} />
                  </td>
                  <td className="px-lg py-md">
                    <OrderActions order={order} />
                  </td>
                  <td className="px-lg py-md align-top">
                    <OrderProgressUpdates order={order} updates={updatesByOrder[order.id] ?? []} />
                  </td>
                  <td className="px-lg py-md align-top">
                    <ShareLinkButton shareToken={order.share_token} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-md">
        {orders.map((order) => {
          const config = STAGE_CONFIG[order.stage];
          return (
            <div
              key={order.id}
              className="rounded-sm border-hairline border-border-l bg-white shadow-card px-lg py-md flex flex-col gap-xs"
            >
              <div className="flex items-center justify-between gap-md">
                <p className="font-body text-[14px] text-ink">{order.client_name}</p>
                <StatusPill label={config.label} tone={config.tone} />
              </div>
              <p className="font-body text-[12px] text-muted">{order.client_phone}</p>
              <p className="font-body text-[12px] text-muted">
                {formatPrice(order.agreed_price)} · Due {order.expected_delivery ?? '—'}
              </p>
              <OrderActions order={order} />
              <OrderProgressUpdates order={order} updates={updatesByOrder[order.id] ?? []} />
              <ShareLinkButton shareToken={order.share_token} />
            </div>
          );
        })}
      </div>
    </>
  );
}
