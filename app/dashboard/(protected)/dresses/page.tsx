import { createUserScopedClient } from '@/lib/supabase';
import { DressesTable } from '@/components/dashboard/DressesTable';

export default async function DressesPage() {
  const supabase = await createUserScopedClient();
  const { data: dresses } = await supabase
    .from('dresses')
    .select('id, name, size, rental_price, status')
    .order('name');

  if (!dresses?.length) {
    return (
      <p className="font-body text-[14px] text-muted">
        No dresses yet. Once dresses are added, they’ll show up here.
      </p>
    );
  }

  return (
    <div>
      <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">
        {dresses.length} {dresses.length === 1 ? 'dress' : 'dresses'}
      </p>
      <DressesTable dresses={dresses} />
    </div>
  );
}
