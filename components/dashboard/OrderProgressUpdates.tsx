'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { StatusPill } from '@/components/dashboard/StatusPill';
import { STAGE_CONFIG } from '@/components/dashboard/OrdersTable';
import type { Order, OrderStage, OrderUpdateWithSignedUrl } from '@/types/order';

// Mirrors skills/backend-storage.md's validation (images: jpg/png/webp,
// video: mp4, 25MB cap) — checked client-side for a fast error, re-checked
// server-side in /api/order-updates since client checks are never trusted.
const ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4';
const MAX_BYTES = 25 * 1024 * 1024;

const FIELD_CLASS =
  'min-h-[44px] font-body text-[13px] text-ink border-hairline border-border-l rounded-sm px-sm bg-white';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function OrderProgressUpdates({
  order,
  updates,
}: {
  order: Order;
  updates: OrderUpdateWithSignedUrl[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [stage, setStage] = useState<OrderStage>(order.stage);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Choose a photo or video first.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File is too large — 25MB max.');
      return;
    }

    const formData = new FormData();
    formData.append('orderId', order.id);
    formData.append('file', file);
    formData.append('stage', stage);
    if (caption.trim()) formData.append('caption', caption.trim());

    setSubmitting(true);
    try {
      const res = await fetch('/api/order-updates', { method: 'POST', body: formData });
      const result = await res.json();

      if (!result.ok) {
        setError(result.error ?? 'Could not upload');
        return;
      }

      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-xs items-start">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-body text-[12px] uppercase tracking-[0.08em] text-ink underline decoration-border-l underline-offset-4"
      >
        {open ? 'Hide' : `Progress Updates (${updates.length})`}
      </button>

      {open && (
        <div className="w-full min-w-[260px] flex flex-col gap-md border-hairline border-border-l rounded-sm bg-light px-md py-md">
          {updates.length === 0 ? (
            <p className="font-body text-[12px] text-muted">No progress updates yet.</p>
          ) : (
            <ul className="flex flex-col gap-sm">
              {updates.map((update) => (
                <li key={update.id} className="flex items-start gap-sm">
                  {update.signedUrl ? (
                    update.media_type === 'video' ? (
                      <video src={update.signedUrl} controls className="w-[96px] h-[72px] bg-dark shrink-0" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={update.signedUrl}
                        alt={update.caption ?? 'Progress update'}
                        className="w-[96px] h-[72px] object-cover bg-dark shrink-0"
                      />
                    )
                  ) : (
                    <div className="w-[96px] h-[72px] bg-dark shrink-0 flex items-center justify-center">
                      <span className="font-body text-[10px] text-white">Unavailable</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center gap-xs">
                      {update.stage && (
                        <StatusPill label={STAGE_CONFIG[update.stage].label} tone={STAGE_CONFIG[update.stage].tone} />
                      )}
                      <span className="font-body text-[11px] text-muted">{formatDate(update.created_at)}</span>
                    </div>
                    {update.caption && <p className="font-body text-[12px] text-ink">{update.caption}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleUpload} className="flex flex-col gap-xs">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="font-body text-[12px] text-ink"
            />
            <input
              type="text"
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={FIELD_CLASS}
            />
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as OrderStage)}
              className={FIELD_CLASS}
            >
              {(Object.keys(STAGE_CONFIG) as OrderStage[]).map((s) => (
                <option key={s} value={s}>
                  {STAGE_CONFIG[s].label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-md bg-dark text-white rounded-sm font-body text-[12px] uppercase tracking-[0.08em] disabled:opacity-50"
            >
              {submitting ? 'Uploading…' : 'Add Progress Update'}
            </button>
            {error && (
              <p className="font-body text-[12px] text-alert bg-alert-bg rounded-sm px-sm py-xs">{error}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
