import { redirect } from 'next/navigation';

import { createUserScopedClient } from '@/lib/supabase';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttentionList } from '@/components/dashboard/AttentionList';
import { DressesOutList } from '@/components/dashboard/DressesOutList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import type { ActiveRentalSummary, ActivityItem } from '@/types/dashboard';

function formatMoney(amount: number) {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

type RentalRow = {
  id: string;
  client_name: string;
  due_date: string;
  dress: { name: string; rental_price: number } | null;
};

type OrderRow = {
  id: string;
  client_name: string;
  agreed_price: number | null;
};

type RecentRentalRow = {
  id: string;
  client_name: string;
  created_at: string;
  dress: { name: string } | null;
};

type RecentOrderRow = {
  id: string;
  client_name: string;
  created_at: string;
};

type ReturnPaymentRow = {
  id: string;
  created_at: string;
  rental: { client_name: string; dress: { name: string } | null } | null;
};

type DeliveryPaymentRow = {
  id: string;
  created_at: string;
  order: { client_name: string } | null;
};

function toSummary(rows: RentalRow[]): ActiveRentalSummary[] {
  return rows.map((r) => ({
    id: r.id,
    client_name: r.client_name,
    due_date: r.due_date,
    dress_name: r.dress?.name ?? 'Dress',
  }));
}

export default async function DashboardPage() {
  const supabase = await createUserScopedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/dashboard/login');

  // The shared layout only checks that the profile is active, not the role —
  // this page decides which data to fetch based on role, server-side, so the
  // branch below is what actually stops financial queries from ever running
  // in a staff session (see skills/backend-security.md).
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/dashboard/login');

  const today = new Date().toISOString().slice(0, 10);

  if (profile.role !== 'owner') {
    const { data: activeRentals } = await supabase
      .from('rentals')
      .select('id, client_name, due_date, dress:dresses(name)')
      .eq('state', 'deposit_paid')
      .order('due_date')
      .returns<RentalRow[]>();

    const rentals = toSummary(activeRentals ?? []);
    const overdue = rentals.filter((r) => r.due_date < today);

    return (
      <div className="flex flex-col gap-2xl">
        <div className="grid grid-cols-2 gap-md">
          <StatCard label="Dresses Out" value={String(rentals.length)} />
          <StatCard
            label="Overdue"
            value={String(overdue.length)}
            tone={overdue.length > 0 ? 'alert' : 'neutral'}
          />
        </div>

        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">
            Needs Attention
          </p>
          <AttentionList rentals={overdue} />
        </div>

        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">
            Dresses Out
          </p>
          <DressesOutList rentals={rentals} />
        </div>
      </div>
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayIndex = (now.getDay() + 6) % 7; // 0 = Monday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayIndex);
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    { data: monthPayments },
    { data: activeRentals },
    { data: openOrders },
    { data: recentRentals },
    { data: recentOrders },
    { data: recentReturns },
    { data: recentDeliveries },
  ] = await Promise.all([
    supabase
      .from('payments')
      .select('amount, created_at')
      .gte('created_at', startOfMonth.toISOString())
      .returns<{ amount: number; created_at: string }[]>(),
    supabase
      .from('rentals')
      .select('id, client_name, due_date, dress:dresses(name, rental_price)')
      .eq('state', 'deposit_paid')
      .order('due_date')
      .returns<RentalRow[]>(),
    supabase
      .from('orders')
      .select('id, client_name, agreed_price')
      .neq('stage', 'delivered')
      .returns<OrderRow[]>(),
    supabase
      .from('rentals')
      .select('id, client_name, created_at, dress:dresses(name)')
      .order('created_at', { ascending: false })
      .limit(8)
      .returns<RecentRentalRow[]>(),
    supabase
      .from('orders')
      .select('id, client_name, created_at')
      .order('created_at', { ascending: false })
      .limit(8)
      .returns<RecentOrderRow[]>(),
    supabase
      .from('payments')
      .select('id, created_at, rental:rentals(client_name, dress:dresses(name))')
      .eq('kind', 'completion')
      .not('rental_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(8)
      .returns<ReturnPaymentRow[]>(),
    supabase
      .from('payments')
      .select('id, created_at, order:orders(client_name)')
      .eq('kind', 'completion')
      .not('order_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(8)
      .returns<DeliveryPaymentRow[]>(),
  ]);

  const payments = monthPayments ?? [];
  const moneyMonth = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const moneyWeek = payments
    .filter((p) => new Date(p.created_at) >= startOfWeek)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const rentalRows = activeRentals ?? [];
  const orderRows = openOrders ?? [];
  const rentalsSummary = toSummary(rentalRows);
  const overdueRentals = rentalsSummary.filter((r) => r.due_date < today);

  const outstandingCount = rentalRows.length + orderRows.length;
  const outstandingAmount =
    rentalRows.reduce((sum, r) => sum + Number(r.dress?.rental_price ?? 0) * 0.2, 0) +
    orderRows.reduce((sum, o) => sum + Number(o.agreed_price ?? 0) * 0.2, 0);

  const activity: ActivityItem[] = [
    ...(recentRentals ?? []).map((r) => ({
      id: `rental-${r.id}`,
      timestamp: r.created_at,
      description: `Rental logged — ${r.dress?.name ?? 'Dress'} to ${r.client_name}`,
    })),
    ...(recentOrders ?? []).map((o) => ({
      id: `order-${o.id}`,
      timestamp: o.created_at,
      description: `Order created — ${o.client_name}`,
    })),
    ...(recentReturns ?? []).map((p) => ({
      id: `return-${p.id}`,
      timestamp: p.created_at,
      description: `Return recorded — ${p.rental?.dress?.name ?? 'Dress'} from ${
        p.rental?.client_name ?? 'client'
      }`,
    })),
    ...(recentDeliveries ?? []).map((p) => ({
      id: `delivery-${p.id}`,
      timestamp: p.created_at,
      description: `Order delivered — ${p.order?.client_name ?? 'client'}`,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-2xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <StatCard label="Money This Week" value={formatMoney(moneyWeek)} />
        <StatCard label="Money This Month" value={formatMoney(moneyMonth)} />
        <StatCard
          label="Outstanding"
          value={formatMoney(outstandingAmount)}
          detail={`${outstandingCount} owed`}
        />
        <StatCard
          label="Currently Active"
          value={`${rentalRows.length} · ${orderRows.length}`}
          detail="dresses out · orders in progress"
        />
      </div>

      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">
          Needs Attention
        </p>
        <AttentionList rentals={overdueRentals} />
      </div>

      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">
          Recent Activity
        </p>
        <ActivityFeed items={activity} />
      </div>
    </div>
  );
}
