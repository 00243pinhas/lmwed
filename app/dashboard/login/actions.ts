'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

import { createUserScopedClient } from '@/lib/supabase';

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
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: 'Invalid email or password' };
  }

  redirect('/dashboard');
}
