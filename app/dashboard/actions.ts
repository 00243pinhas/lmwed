'use server';

import { redirect } from 'next/navigation';

import { createUserScopedClient } from '@/lib/supabase';

export async function logout() {
  const supabase = await createUserScopedClient();
  await supabase.auth.signOut();
  redirect('/dashboard/login');
}
