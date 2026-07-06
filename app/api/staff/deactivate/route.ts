// POST /api/staff/deactivate — Linda's "sack" button (skills/backend-auth.md
// "Deactivation, never deletion"). Owner-only. Sets active=false — never
// deletes — so history stays attributed. Uses the user-scoped client: the
// existing "owner manages profiles" RLS policy already permits this UPDATE,
// no service role needed. A deactivated user's session dies on their next
// request (middleware re-checks profiles.active on every /dashboard/*
// request; my_role() returns null for inactive users, which blocks every
// RLS-guarded write everywhere else).
import { z } from 'zod'

import { createUserScopedClient } from '@/lib/supabase'

const deactivateSchema = z.object({
  staffId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = deactivateSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }
    const { staffId } = parsed.data

    const supabase = await createUserScopedClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, active')
      .eq('id', user.id)
      .single()

    if (!profile?.active) {
      return Response.json({ ok: false, error: 'Account inactive' }, { status: 403 })
    }

    if (profile.role !== 'owner') {
      return Response.json({ ok: false, error: 'Not allowed' }, { status: 403 })
    }

    if (staffId === user.id) {
      return Response.json({ ok: false, error: 'You cannot deactivate your own account' }, { status: 400 })
    }

    const { data: target } = await supabase.from('profiles').select('role').eq('id', staffId).single()

    if (!target) {
      return Response.json({ ok: false, error: 'Staff member not found' }, { status: 404 })
    }

    if (target.role === 'owner') {
      return Response.json({ ok: false, error: 'Cannot deactivate an owner account' }, { status: 400 })
    }

    const { error } = await supabase.from('profiles').update({ active: false }).eq('id', staffId)

    if (error) {
      console.error('POST /api/staff/deactivate failed', error)
      return Response.json({ ok: false, error: 'Could not deactivate staff member' }, { status: 500 })
    }

    return Response.json({ ok: true, data: { id: staffId, active: false } }, { status: 200 })
  } catch (err) {
    console.error('POST /api/staff/deactivate failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
