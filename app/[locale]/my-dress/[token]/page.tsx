import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createServiceRoleClient } from '@/lib/supabase';
import { Reveal } from '@/components/ui/Reveal';
import { StaggerReveal } from '@/components/ui/StaggerReveal';
import { DressJourney } from '@/components/ui/DressJourney';
import { DressUpdateCard } from '@/components/ui/DressUpdateCard';
import type { BrideOrder, OrderUpdate, OrderUpdateWithSignedUrl } from '@/types/order';

// Deliberately generic — never put the bride's name in page metadata, which
// can surface in browser history, link previews, or social cards.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'myDress.meta' });
  return { title: t('title'), description: t('description') };
}

// Supabase's underlying fetch calls otherwise get swept into Next's Data
// Cache like any other fetch — without this, a bride could load this page
// once and never see a new progress photo again until an unrelated
// revalidation happened to occur. This route must always hit the database.
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
}

async function NotFound({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'myDress.notFound' });
  return (
    <main className="min-h-screen bg-dark flex flex-col items-center justify-center px-md py-3xl text-center">
      <p className="font-display text-[16px] tracking-[0.08em] text-white">LM WEDDYLI</p>
      <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent mt-2xl">{t('marker')}</p>
      <h1 className="font-display font-light text-display-sm md:text-display-md text-white mt-md max-w-[18ch]">
        {t('headline')}
      </h1>
      <p className="font-body text-body text-white/70 mt-lg max-w-[42ch]">{t('body')}</p>
    </main>
  );
}

export default async function MyDressPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('myDress');

  // Per skills/backend-security.md — one of the two allowed uses of the
  // service-role client, scoped strictly to the single order matching this
  // token. Brides never authenticate, so RLS can't scope them any other way.
  if (!UUID_RE.test(token)) {
    return <NotFound locale={locale} />;
  }

  const supabase = createServiceRoleClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id, client_name, description, stage, expected_delivery')
    .eq('share_token', token)
    .maybeSingle<BrideOrder>();

  if (!order) {
    return <NotFound locale={locale} />;
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
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">{t('header.marker')}</p>
          <h1 className="font-display font-light text-display-md md:text-display-lg text-white mt-sm leading-[1.1]">
            {t('header.greeting', { firstName })}
          </h1>
          {order.description && (
            <p className="font-body text-body text-white/70 mt-lg max-w-[56ch]">{order.description}</p>
          )}
          {order.expected_delivery && (
            <p className="font-body text-[10px] uppercase tracking-[0.14em] text-accent mt-xl">
              {t('header.expectedDelivery', { date: formatDate(order.expected_delivery, locale) })}
            </p>
          )}
        </Reveal>
      </section>

      {/* Journey */}
      <section className="px-md py-3xl md:px-2xl md:py-4xl">
        <Reveal>
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">{t('journey.marker')}</p>
          <h2 className="font-display font-light text-display-sm md:text-display-md text-ink mt-sm">
            {t('journey.headline')}
          </h2>
        </Reveal>
        <div className="mt-2xl md:mt-3xl">
          <DressJourney stage={order.stage} />
        </div>
      </section>

      {/* Progress updates */}
      <section className="bg-surface px-md py-3xl md:px-2xl md:py-4xl">
        <Reveal>
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent">{t('progress.marker')}</p>
          <h2 className="font-display font-light text-display-sm md:text-display-md text-ink mt-sm">
            {t('progress.headline')}
          </h2>
        </Reveal>

        {updates.length === 0 ? (
          <Reveal className="mt-2xl md:mt-3xl">
            <p className="font-display font-light italic text-display-xs text-ink max-w-[36ch]">
              {t('progress.emptyHeadline')}
            </p>
            <p className="font-body text-body text-muted mt-md max-w-[46ch]">{t('progress.emptyBody')}</p>
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
        <p className="font-body text-[11px] uppercase tracking-[0.1em] text-muted">{t('footerNote')}</p>
      </div>
    </main>
  );
}
