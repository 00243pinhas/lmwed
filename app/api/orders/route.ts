// POST /api/orders — start a custom commission (the create half of the
// order lifecycle). See skills/backend-orders.md, skills/backend-data-model.md,
// skills/backend-security.md.
//
// Owner-only — staff may view orders but never create, price, or pay on one.
// The order insert, its 80% deposit payment, and (if converting an inquiry)
// that inquiry's status flip all happen inside one Postgres function
// (create_order, migration 007) so they succeed or fail together — see that
// migration for why atomicity matters here.
import { z } from 'zod'

import { createUserScopedClient } from '@/lib/supabase'

const orderSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientPhone: z.string().min(1).max(50),
  description: z.string().min(1).max(2000),
  agreedPrice: z.number().positive(),
  expectedDelivery: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  inquiryId: z.string().uuid().optional(),
  method: z.enum(['cash', 'orange_money', 'bank', 'other']),
})

export async function POST(req: Request) {
  try {
    // 1. Parse + validate input FIRST — never trust the client
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)
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

    // 3. Do the work — recorded_by is set inside create_order() from
    // auth.uid(), never from this request body (theft protection). The
    // deposit amount is also computed inside create_order() from
    // agreedPrice, never trusted as a client-supplied number.
    const { data, error } = await supabase.rpc('create_order', {
      p_client_name: input.clientName,
      p_client_phone: input.clientPhone,
      p_description: input.description,
      p_agreed_price: input.agreedPrice,
      p_expected_delivery: input.expectedDelivery,
      p_inquiry_id: input.inquiryId ?? null,
      p_method: input.method,
    })

    if (error) {
      console.error('POST /api/orders create_order failed', error)
      const message = error.message?.includes('Inquiry not found')
        ? 'That inquiry could not be found'
        : error.message?.includes('greater than zero')
          ? 'Agreed price must be greater than zero'
          : 'Could not create order'
      return Response.json({ ok: false, error: message }, { status: 400 })
    }

    // 4. Consistent success shape
    return Response.json({ ok: true, data }, { status: 200 })
  } catch (err) {
    console.error('POST /api/orders failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
