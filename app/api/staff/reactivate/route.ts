// POST /api/staff/reactivate — undo an accidental deactivation
// (skills/backend-auth.md). Owner-only. Sets active=true via the
// user-scoped client, same RLS policy as deactivate.
import { z } from 'zod'

import { createUserScopedClient } from '@/lib/supabase'

const reactivateSchema = z.object({
  staffId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = reactivateSchema.safeParse(body)
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

    const { error } = await supabase.from('profiles').update({ active: true }).eq('id', staffId)

    if (error) {
      console.error('POST /api/staff/reactivate failed', error)
      return Response.json({ ok: false, error: 'Could not reactivate staff member' }, { status: 500 })
    }

    return Response.json({ ok: true, data: { id: staffId, active: true } }, { status: 200 })
  } catch (err) {
    console.error('POST /api/staff/reactivate failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
