import { redirect } from 'next/navigation';

import { createUserScopedClient } from '@/lib/supabase';
import { AddStaffForm } from '@/components/dashboard/AddStaffForm';
import { StaffTable } from '@/components/dashboard/StaffTable';
import type { StaffMember } from '@/types/staff';

export default async function StaffPage() {
  const supabase = await createUserScopedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/dashboard/login');

  // Staff management is owner-only (skills/backend-auth.md,
  // skills/dashboard-design.md). The shared layout only checks that the
  // profile is active, not the role — this page must enforce owner-only
  // access itself, server-side, not just hide the nav link.
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'owner') redirect('/dashboard');

  const { data: staff } = await supabase
    .from('profiles')
    .select('id, name, email, role, active, must_change_password, created_at')
    .order('created_at', { ascending: false })
    .returns<StaffMember[]>();

  return (
    <div className="flex flex-col gap-2xl">
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">Staff</p>
        <StaffTable staff={staff ?? []} currentUserId={user.id} />
      </div>

      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.06em] text-muted mb-md">Add Staff</p>
        <AddStaffForm />
      </div>
    </div>
  );
}
