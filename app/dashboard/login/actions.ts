'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

import { createUserScopedClient } from '@/lib/supabase';
import { ACCOUNT_INACTIVE_MESSAGE } from '@/lib/auth-messages';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginResult = { error: string } | undefined;

export async function login(formData: FormData): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // Never reveal which field was wrong — same generic message either way.
  if (!parsed.success) {
    return { error: 'Invalid email or password' };
  }

  const supabase = await createUserScopedClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: 'Invalid email or password' };
  }

  // Credentials were valid, but a deactivated account must still be fully
  // unable to log in (skills/backend-auth.md "Deactivation, never deletion").
  // Checked here (in addition to middleware, which also catches this for an
  // already-deactivated mid-session cookie) so this specific case — wrong
  // account state, not wrong credentials — gets its own clear message
  // immediately, without a redirect round-trip through /dashboard first.
  const { data: profile } = await supabase
    .from('profiles')
    .select('active')
    .eq('id', data.user.id)
    .single();

  if (!profile?.active) {
    await supabase.auth.signOut();
    return { error: ACCOUNT_INACTIVE_MESSAGE };
  }

  redirect('/dashboard');
}
