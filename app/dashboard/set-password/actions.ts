'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

import { createUserScopedClient } from '@/lib/supabase';

const setPasswordSchema = z
  .object({
    password: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SetPasswordResult = { error: string } | undefined;

export async function setPassword(formData: FormData): Promise<SetPasswordResult> {
  const parsed = setPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid password' };
  }

  const supabase = await createUserScopedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/dashboard/login');

  const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (updateError) {
    return { error: 'Could not update password' };
  }

  // Flips must_change_password to false for this caller's own row only —
  // see complete_password_change() in supabase/migrations/010_staff_management.sql
  // for why this can't just be a direct .update() on profiles.
  const { error: rpcError } = await supabase.rpc('complete_password_change');
  if (rpcError) {
    return { error: 'Could not update password' };
  }

  redirect('/dashboard');
}
