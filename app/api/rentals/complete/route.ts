// POST /api/rentals/complete — record a return (the close half of the
// append-only ledger). See skills/backend-data-model.md, skills/backend-security.md.
//
// Owner AND staff may complete rentals. The completion payment insert, the
// rental state flip, and the dress status flip all happen inside one
// Postgres function (complete_rental, migration 005) so they succeed or
// fail together — see that migration for why atomicity matters here.
import { z } from 'zod'

import { createUserScopedClient } from '@/lib/supabase'

const completeSchema = z.object({
  rentalId: z.string().uuid(),
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

    // 2. Require authentication — owner or staff, both may record returns.
    // The middleware only guards /dashboard/*, not /api/*, so this route
    // must check the session itself.
    const supabase = await createUserScopedClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('active')
      .eq('id', user.id)
      .single()

    if (!profile?.active) {
      return Response.json({ ok: false, error: 'Account inactive' }, { status: 403 })
    }

    // 3. Do the work — recorded_by is set inside complete_rental() from
    // auth.uid(), never from this request body (theft protection).
    const { data, error } = await supabase.rpc('complete_rental', {
      p_rental_id: input.rentalId,
      p_method: input.method,
    })

    if (error) {
      console.error('POST /api/rentals/complete failed', error)
      const message = error.message?.includes('not awaiting return')
        ? 'That rental is not awaiting a return'
        : error.message?.includes('not found')
          ? 'Rental not found'
          : 'Could not record return'
      return Response.json({ ok: false, error: message }, { status: 400 })
    }

    // 4. Consistent success shape
    return Response.json({ ok: true, data }, { status: 200 })
  } catch (err) {
    console.error('POST /api/rentals/complete failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
