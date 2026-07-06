// POST /api/staff — Linda adds a staff member herself. See
// skills/backend-auth.md ("Account creation model"), skills/backend-data-model.md
// ("Staff creation — the sanctioned third service-role use"), skills/backend-security.md.
//
// Owner-only. Creates the Supabase Auth user (temp password Linda shares via
// WhatsApp) and the matching profiles row (role='staff', active=true,
// must_change_password=true) atomically enough that a failed profile insert
// rolls back the just-created auth user.
import { z } from 'zod'

import { createServiceRoleClient, createUserScopedClient } from '@/lib/supabase'

const staffSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
})

export async function POST(req: Request) {
  try {
    // 1. Parse + validate input FIRST — never trust the client
    const body = await req.json()
    const parsed = staffSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }
    const input = parsed.data

    // 2. Require authentication AND the owner role via the user-scoped
    // client — identity/role always comes from the verified session, never
    // the request body.
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

    // 3. Only past this owner gate do we reach for the service-role client —
    // the sanctioned third exception (see backend-data-model.md): creating
    // an auth user has no user-scoped equivalent, and there is no INSERT
    // policy on profiles for anyone.
    const serviceClient = createServiceRoleClient()

    const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    })

    if (createError || !created.user) {
      const message = createError?.message?.toLowerCase().includes('already been registered')
        ? 'An account with that email already exists'
        : 'Could not create staff account'
      return Response.json({ ok: false, error: message }, { status: 400 })
    }

    const { error: profileError } = await serviceClient.from('profiles').insert({
      id: created.user.id,
      name: input.name,
      email: input.email,
      role: 'staff',
      active: true,
      must_change_password: true,
    })

    if (profileError) {
      // Roll back the orphaned auth user rather than leave an account with
      // no profile row lying around.
      await serviceClient.auth.admin.deleteUser(created.user.id)
      console.error('POST /api/staff profile insert failed', profileError)
      return Response.json({ ok: false, error: 'Could not create staff account' }, { status: 500 })
    }

    // 4. Consistent success shape — never echo the password back
    return Response.json(
      {
        ok: true,
        data: { id: created.user.id, name: input.name, email: input.email, role: 'staff', active: true },
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('POST /api/staff failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
