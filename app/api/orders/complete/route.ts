// POST /api/orders/complete — record delivery + the 20% completion payment
// (the close half of the order lifecycle). See skills/backend-orders.md,
// skills/backend-data-model.md, skills/backend-security.md.
//
// Owner-only. The completion payment insert and the stage flip to
// 'delivered' both happen inside complete_order() (migration 008) so they
// succeed or fail together — mirrors complete_rental() (migration 005).
import { z } from 'zod'

import { createUserScopedClient } from '@/lib/supabase'

const completeSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['cash', 'orange_money', 'bank', 'other']),
})

export async function POST(req: Request) {
  try {
    // 1. Parse + validate input FIRST — never trust the client
    const body = await req.json()
    const parsed = completeSchema.safeParse(body)
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

    // 3. Do the work — recorded_by is set inside complete_order() from
    // auth.uid(), never from this request body. The completion amount is
    // also computed inside complete_order() from the order's agreed_price,
    // never trusted as a client-supplied number (theft protection).
    const { data, error } = await supabase.rpc('complete_order', {
      p_order_id: input.orderId,
      p_method: input.method,
    })

    if (error) {
      console.error('POST /api/orders/complete failed', error)
      const message = error.message?.includes('not awaiting delivery')
        ? 'That order is not awaiting delivery'
        : error.message?.includes('not found')
          ? 'Order not found'
          : error.message?.includes('agreed price')
            ? 'Order has no agreed price set'
            : 'Could not record delivery'
      return Response.json({ ok: false, error: message }, { status: 400 })
    }

    // 4. Consistent success shape
    return Response.json({ ok: true, data }, { status: 200 })
  } catch (err) {
    console.error('POST /api/orders/complete failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
