import type { OrderStage } from '@/types/order';

const STAGE_LABELS: Record<OrderStage, string> = {
  consultation: 'Consultation',
  design: 'Design',
  measurements: 'Measurements',
  production: 'Production',
  arrived: 'Arrived',
  delivered: 'Delivered',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Signed URLs point at a Supabase Storage host that isn't (and shouldn't be)
// registered in next.config's image remotePatterns — they're single-use,
// short-lived, and per-order, not a fixed domain worth allowlisting. Plain
// <img>/<video> avoids the Image Optimization API rejecting an unlisted host.
export function DressUpdateCard({
  signedUrl,
  mediaType,
  caption,
  stage,
  createdAt,
}: {
  signedUrl: string | null;
  mediaType: 'image' | 'video';
  caption: string | null;
  stage: OrderStage | null;
  createdAt: string;
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-dark">
      {signedUrl ? (
        mediaType === 'video' ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={signedUrl} controls className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt={caption ?? 'A progress photo of your gown'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-body text-[11px] uppercase tracking-[0.1em] text-white/60">
            Photo unavailable
          </p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/10 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 px-lg py-lg">
        <div className="flex items-center gap-md">
          {stage && (
            <p className="font-body text-[10px] uppercase tracking-[0.14em] text-accent">
              {STAGE_LABELS[stage]}
            </p>
          )}
          <p className="font-body text-[10px] uppercase tracking-[0.1em] text-white/70">
            {formatDate(createdAt)}
          </p>
        </div>
        {caption && (
          <p className="font-display font-light text-display-2xs text-white mt-xs">{caption}</p>
        )}
      </div>
    </div>
  );
}
