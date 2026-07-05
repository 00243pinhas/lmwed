// lib/supabase.ts — Supabase connection helpers.
//
// Per skills/backend-security.md ("golden rule"): the service-role key bypasses
// Row Level Security entirely and may ONLY be used server-side, and ONLY for:
//   1. The public inquiry form insert (brides aren't logged in, RLS can't scope them).
//   2. The bride's magic-link read (lookup strictly by share_token).
// Every other authenticated action (staff/owner) MUST use the user-scoped
// client below so RLS enforces roles. Reaching for the service-role client
// for a third reason is a security hole — don't.
//
// This file imports `server-only`, so any accidental import from a
// 'use client' component fails the build instead of leaking secrets.
import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * User-scoped server client — DEFAULT for all authenticated staff/owner actions.
 * Reads the logged-in user's session from cookies and respects Row Level
 * Security, so Postgres itself enforces who can see/write what.
 * Use for: rentals, payments, orders, dresses, inquiries, profiles — anything
 * a logged-in Linda or staff member does.
 */
export async function createUserScopedClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll called from a Server Component — safe to ignore when
          // middleware is refreshing the session.
        }
      },
    },
  })
}

/**
 * ⚠️ SERVICE-ROLE CLIENT — GODMODE. BYPASSES ROW LEVEL SECURITY ENTIRELY. ⚠️
 *
 * Server-only. Only ever call this for the two exceptions in
 * skills/backend-security.md:
 *   1. app/api/inquire/route.ts   — public inquiry form insert
 *   2. app/api/my-dress/[token]   — bride's magic-link read by share_token
 *
 * Do NOT use this for any staff or owner action. Do NOT import it into a
 * client component (the `server-only` import above will fail the build if
 * you try). If you're reaching for this a third time, stop and use
 * createUserScopedClient() instead.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
