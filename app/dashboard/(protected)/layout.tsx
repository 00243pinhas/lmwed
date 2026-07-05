import { redirect } from 'next/navigation';

import { createUserScopedClient } from '@/lib/supabase';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createUserScopedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — middleware already guards /dashboard/*, but a
  // protected layout must not assume it ran (e.g. a direct server render).
  if (!user) redirect('/dashboard/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, active')
    .eq('id', user.id)
    .single();

  if (!profile?.active) {
    await supabase.auth.signOut();
    redirect('/dashboard/login');
  }

  return (
    <DashboardShell user={{ name: profile.name, role: profile.role }}>{children}</DashboardShell>
  );
}
