// POST /api/rentals — log a new rental (the create half of the append-only
// ledger). See skills/backend-data-model.md, skills/backend-security.md.
//
// Owner AND staff may log rentals. The rental insert, its deposit payment,
// and the dress status flip all happen inside one Postgres function
// (log_rental, migration 004) so they succeed or fail together — see that
// migration for why atomicity matters here.
import { z } from 'zod'

import { createUserScopedClient } from '@/lib/supabase'

const rentalSchema = z.object({
  dressId: z.string().uuid(),
  clientName: z.string().min(1).max(200),
  clientPhone: z.string().min(1).max(50),
  outDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  method: z.enum(['cash', 'orange_money', 'bank', 'other']),
})

export async function POST(req: Request) {
  try {
    // 1. Parse + validate input FIRST — never trust the client
    const body = await req.json()
    const parsed = rentalSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }
    const input = parsed.data

    if (input.dueDate < input.outDate) {
      return Response.json(
        { ok: false, error: 'Due date must be on or after the out date' },
        { status: 400 }
      )
    }

    // 2. Require authentication — owner or staff, both may log rentals.
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

    // 3. Do the work — entered_by/recorded_by are set inside log_rental()
    // from auth.uid(), never from this request body (theft protection).
    const { data, error } = await supabase.rpc('log_rental', {
      p_dress_id: input.dressId,
      p_client_name: input.clientName,
      p_client_phone: input.clientPhone,
      p_out_date: input.outDate,
      p_due_date: input.dueDate,
      p_method: input.method,
    })

    if (error) {
      console.error('POST /api/rentals log_rental failed', error)
      const message = error.message?.includes('not available')
        ? 'That dress is no longer available'
        : 'Could not log rental'
      return Response.json({ ok: false, error: message }, { status: 400 })
    }

    // 4. Consistent success shape
    return Response.json({ ok: true, data }, { status: 200 })
  } catch (err) {
    console.error('POST /api/rentals failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
