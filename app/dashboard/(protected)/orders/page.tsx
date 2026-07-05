import { redirect } from 'next/navigation';

import { createUserScopedClient } from '@/lib/supabase';
import { NewOrderForm } from '@/components/dashboard/NewOrderForm';
import { OrdersTable } from '@/components/dashboard/OrdersTable';
import type { Order, OrderUpdate, OrderUpdateWithSignedUrl, UnconvertedInquiry } from '@/types/order';

export default async function OrdersPage() {
  const supabase = await createUserScopedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/dashboard/login');

  // Orders are owner-only (skills/backend-orders.md, skills/backend-auth.md).
  // The shared layout only checks that the profile is active, not the role —
  // this page must enforce owner-only access itself, server-side, not just
  // hide the nav link.
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'owner') redirect('/dashboard');

  const [{ data: orders }, { data: inquiries }] = await Promise.all([
    supabase
      .from('orders')
      .select(
        'id, client_name, client_phone, description, agreed_price, stage, expected_delivery, share_token, created_at'
      )
      .order('created_at', { ascending: false })
      .returns<Order[]>(),
    supabase
      .from('inquiries')
      .select('id, first_name, whatsapp, dress_description')
      .eq('service_type', 'custom')
      .in('status', ['new', 'contacted'])
      .order('created_at', { ascending: false })
      .returns<UnconvertedInquiry[]>(),
  ]);

  // Progress photos/videos (skills/backend-storage.md): fetched for all
  // orders up front, same batching pattern as inquiries above, then turned
  // into short-lived signed URLs so the private order-media bucket is never
  // exposed as a plain public link.
  let updatesByOrder: Record<string, OrderUpdateWithSignedUrl[]> = {};
  if (orders && orders.length > 0) {
    const { data: updates } = await supabase
      .from('order_updates')
      .select('id, order_id, uploaded_by, media_url, media_type, caption, stage, created_at')
      .in('order_id', orders.map((o) => o.id))
      .order('created_at', { ascending: false })
      .returns<OrderUpdate[]>();

    if (updates) {
      const withSignedUrls = await Promise.all(
        updates.map(async (update) => {
          const { data: signed } = await supabase.storage
            .from('order-media')
            .createSignedUrl(update.media_url, 60 * 60);
          return { ...update, signedUrl: signed?.signedUrl ?? null };
        })
      );

      updatesByOrder = withSignedUrls.reduce<Record<string, OrderUpdateWithSignedUrl[]>>((acc, update) => {
        (acc[update.order_id] ??= []).push(update);
        return acc;
      }, {});
    }
  }

  return (
    <div className="flex flex-col gap-2xl">
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">Orders</p>
        <OrdersTable orders={orders ?? []} updatesByOrder={updatesByOrder} />
      </div>

      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">
          New Commission
        </p>
        <NewOrderForm inquiries={inquiries ?? []} />
      </div>
    </div>
  );
}
