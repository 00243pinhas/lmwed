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
    .select('name, role, active, must_change_password')
    .eq('id', user.id)
    .single();

  if (!profile?.active) {
    await supabase.auth.signOut();
    redirect('/dashboard/login');
  }

  // Defense in depth again — middleware already redirects to
  // /dashboard/set-password when must_change_password is true, but this
  // group's own pages must not assume it ran (e.g. a direct server render).
  // /dashboard/set-password itself lives outside this (protected) group, so
  // it never gets wrapped in DashboardShell / hits this check.
  if (profile.must_change_password) {
    redirect('/dashboard/set-password');
  }

  return (
    <DashboardShell user={{ name: profile.name, role: profile.role }}>{children}</DashboardShell>
  );
}
