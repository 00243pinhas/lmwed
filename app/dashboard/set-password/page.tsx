import { redirect } from 'next/navigation';

import { createUserScopedClient } from '@/lib/supabase';
import { SetPasswordForm } from '@/components/forms/SetPasswordForm';

export default async function SetPasswordPage() {
  const supabase = await createUserScopedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/dashboard/login');

  // Defense in depth — middleware already redirects here only when
  // must_change_password is true (and away again once it's false), but this
  // page must not assume it ran (e.g. a direct server render).
  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password')
    .eq('id', user.id)
    .single();
  if (!profile?.must_change_password) redirect('/dashboard');

  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-lg">
      <div className="w-full max-w-[360px]">
        <p className="font-display text-[28px] font-light text-ink text-center">LM Weddyli</p>
        <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent text-center mt-xs">
          Set Your Password
        </p>
        <p className="font-body text-[12px] text-muted text-center mt-md">
          Choose a new password before continuing to the dashboard.
        </p>

        <SetPasswordForm />
      </div>
    </div>
  );
}
