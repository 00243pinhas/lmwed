import { createUserScopedClient } from '@/lib/supabase';
import { LogRentalForm } from '@/components/dashboard/LogRentalForm';
import { ActiveRentalsTable } from '@/components/dashboard/ActiveRentalsTable';
import type { ActiveRental } from '@/types/rental';

export default async function RentalsPage() {
  const supabase = await createUserScopedClient();
  const [{ data: dresses }, { data: activeRentals }] = await Promise.all([
    supabase
      .from('dresses')
      .select('id, name, size, rental_price')
      .eq('status', 'available')
      .order('name'),
    supabase
      .from('rentals')
      .select('id, client_name, client_phone, out_date, due_date, dress:dresses(name, size)')
      .eq('state', 'deposit_paid')
      .order('due_date')
      .returns<ActiveRental[]>(),
  ]);

  return (
    <div className="flex flex-col gap-2xl">
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">
          Active Rentals
        </p>
        <ActiveRentalsTable rentals={activeRentals ?? []} />
      </div>

      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">
          Log Rental
        </p>
        <LogRentalForm dresses={dresses ?? []} />
      </div>
    </div>
  );
}
