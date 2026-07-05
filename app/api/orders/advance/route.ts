// POST /api/orders/advance — move a custom order to its next lifecycle
// stage. See skills/backend-orders.md, skills/backend-data-model.md,
// skills/backend-security.md.
//
// Owner-only — staff may view orders but never advance a stage. The next
// stage is computed entirely inside advance_order_stage() (migration 008),
// which enforces the fixed sequence (no skipping, no reversing) and caps
// advancement at 'arrived' — reaching 'delivered' only happens through
// /api/orders/complete, so the two actions never collide.
import { z } from 'zod'

import { createUserScopedClient } from '@/lib/supabase'

const advanceSchema = z.object({
  orderId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    // 1. Parse + validate input FIRST — never trust the client
    const body = await req.json()
    const parsed = advanceSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }
    const input = parsed.data

    // 2. Require authentication AND the owner role — the middleware only
    // guards /dashboard/*, not /api/*, so this route must check both itself.
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

    // 3. Do the work — advance_order_stage() computes the next stage itself
    // (no target stage is ever accepted from the client) and re-checks the
    // owner role server-side before writing.
    const { data, error } = await supabase.rpc('advance_order_stage', {
      p_order_id: input.orderId,
    })

    if (error) {
      console.error('POST /api/orders/advance failed', error)
      const message = error.message?.includes('not found')
        ? 'Order not found'
        : error.message?.includes('cannot be advanced')
          ? 'This order cannot be advanced further — record delivery instead'
          : 'Could not advance order'
      return Response.json({ ok: false, error: message }, { status: 400 })
    }

    // 4. Consistent success shape
    return Response.json({ ok: true, data }, { status: 200 })
  } catch (err) {
    console.error('POST /api/orders/advance failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
