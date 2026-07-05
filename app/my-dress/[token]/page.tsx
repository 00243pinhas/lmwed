import type { Metadata } from 'next';

import { createServiceRoleClient } from '@/lib/supabase';
import { Reveal } from '@/components/ui/Reveal';
import { StaggerReveal } from '@/components/ui/StaggerReveal';
import { DressJourney } from '@/components/ui/DressJourney';
import { DressUpdateCard } from '@/components/ui/DressUpdateCard';
import type { BrideOrder, OrderUpdate, OrderUpdateWithSignedUrl } from '@/types/order';

// Deliberately generic — never put the bride's name in page metadata, which
// can surface in browser history, link previews, or social cards.
export const metadata: Metadata = {
  title: "Your Gown's Journey — LM Weddyli",
  description: 'Follow the progress of your custom gown, from consultation to delivery.',
};

// Supabase's underlying fetch calls otherwise get swept into Next's Data
// Cache like any other fetch — without this, a bride could load this page
// once and never see a new progress photo again until an unrelated
// revalidation happened to occur. This route must always hit the database.
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function NotFound() {
  return (
    <main className="min-h-screen bg-dark flex flex-col items-center justify-center px-md py-3xl text-center">
      <p className="font-display text-[16px] tracking-[0.08em] text-white">LM WEDDYLI</p>
      <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent mt-2xl">0.1 Not Found</p>
      <h1 className="font-display font-light text-display-sm md:text-display-md text-white mt-md max-w-[18ch]">
        We couldn&apos;t find that gown
      </h1>
      <p className="font-body text-body text-white/70 mt-lg max-w-[42ch]">
        This link may have expired or been mistyped. If you believe this is a mistake, please reach out to
        Linda directly on WhatsApp and she&apos;ll be glad to help.
      </p>
    </main>
  );
}

export default async function MyDressPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Per skills/backend-security.md — one of the two allowed uses of the
  // service-role client, scoped strictly to the single order matching this
  // token. Brides never authenticate, so RLS can't scope them any other way.
  if (!UUID_RE.test(token)) {
    return <NotFound />;
  }

  const supabase = createServiceRoleClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id, client_name, description, stage, expected_delivery')
    .eq('share_token', token)
    .maybeSingle<BrideOrder>();

  if (!order) {
    return <NotFound />;
  }

  const firstName = order.client_name.trim().split(/\s+/)[0] ?? order.client_name;

  const { data: rawUpdates } = await supabase
    .from('order_updates')
    .select('id, order_id, uploaded_by, media_url, media_type, caption, stage, created_at')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })
    .returns<OrderUpdate[]>();

  const updates: OrderUpdateWithSignedUrl[] = await Promise.all(
    (rawUpdates ?? []).map(async (update) => {
      const { data: signed } = await supabase.storage
        .from('order-media')
        .createSignedUrl(update.media_url, 60 * 60);
      return { ...update, signedUrl: signed?.signedUrl ?? null };
    })
  );

  return (
    <main className="min-h-screen bg-light">
      {/* Header — full-bleed dark, the one hero moment on this page */}
      <section className="bg-dark px-md py-3xl md:px-2xl md:py-4xl">
        <p className="font-display text-[16px] tracking-[0.08em] text-white text-center md:text-left">
          LM WEDDYLI
        </p>

        <Reveal className="mt-2xl md:mt-3xl">
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">0.1 Your Gown</p>
          <h1 className="font-display font-light text-display-md md:text-display-lg text-white mt-sm leading-[1.1]">
            Hello, {firstName}.
          </h1>
          {order.description && (
            <p className="font-body text-body text-white/70 mt-lg max-w-[56ch]">{order.description}</p>
          )}
          {order.expected_delivery && (
            <p className="font-body text-[10px] uppercase tracking-[0.14em] text-accent mt-xl">
              Expected Delivery — {formatDate(order.expected_delivery)}
            </p>
          )}
        </Reveal>
      </section>

      {/* Journey */}
      <section className="px-md py-3xl md:px-2xl md:py-4xl">
        <Reveal>
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">0.2 The Journey</p>
          <h2 className="font-display font-light text-display-sm md:text-display-md text-ink mt-sm">
            Where Your Gown Stands
          </h2>
        </Reveal>
        <div className="mt-2xl md:mt-3xl">
          <DressJourney stage={order.stage} />
        </div>
      </section>

      {/* Progress updates */}
      <section className="bg-surface px-md py-3xl md:px-2xl md:py-4xl">
        <Reveal>
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">0.3 Progress</p>
          <h2 className="font-display font-light text-display-sm md:text-display-md text-ink mt-sm">
            From the Atelier
          </h2>
        </Reveal>

        {updates.length === 0 ? (
          <Reveal className="mt-2xl md:mt-3xl">
            <p className="font-display font-light italic text-display-xs text-ink max-w-[36ch]">
              Your gown is being brought to life.
            </p>
            <p className="font-body text-body text-muted mt-md max-w-[46ch]">
              Linda is preparing your gown — your first update will appear here soon.
            </p>
          </Reveal>
        ) : (
          <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-2xl md:mt-3xl">
            {updates.map((update) => (
              <DressUpdateCard
                key={update.id}
                signedUrl={update.signedUrl}
                mediaType={update.media_type}
                caption={update.caption}
                stage={update.stage}
                createdAt={update.created_at}
              />
            ))}
          </StaggerReveal>
        )}
      </section>

      <div className="border-t-hairline border-border-l px-md py-2xl text-center">
        <p className="font-body text-[11px] uppercase tracking-[0.1em] text-muted">
          With care, Linda Monga · LM Weddyli
        </p>
      </div>
    </main>
  );
}
