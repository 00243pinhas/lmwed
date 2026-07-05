# SKILL: Backend API
## Read this before creating or changing any API route.

---

## Where routes live
Every backend endpoint is a folder inside `app/api/` containing a `route.ts` file.
```
app/api/inquire/route.ts    → POST /api/inquire
app/api/rentals/route.ts    → POST & GET /api/rentals
app/api/orders/route.ts     → POST & GET /api/orders
```
The filename MUST be `route.ts`. Any other name is not treated as an API route by Next.js.

---

## Route handler shape
Export named async functions for each HTTP method:
```ts
export async function POST(req: Request) { ... }
export async function GET(req: Request) { ... }
```
Never a default export. Never `page.tsx`. These are handlers, not pages.

---

## Standard response shape — ALWAYS
Every route returns JSON in one of these two shapes, nothing else:
```ts
// success
return Response.json({ ok: true, data }, { status: 200 })
// failure
return Response.json({ ok: false, error: "human-readable message" }, { status: 400 })
```
Never return raw objects, raw strings, or leak internal error details to the client.

---

## The mandatory structure of every mutating route
```ts
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase'

const schema = z.object({
  firstName: z.string().min(1),
  city: z.string().min(1),
  // ... every field, validated
})

export async function POST(req: Request) {
  try {
    // 1. Parse + validate input FIRST — never trust the client
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }

    // 2. Do the work (DB call, email, etc.)
    const supabase = createServerClient()
    const { data, error } = await supabase.from('inquiries').insert({...}).select().single()
    if (error) {
      return Response.json({ ok: false, error: 'Could not save' }, { status: 500 })
    }

    // 3. Return consistent success shape
    return Response.json({ ok: true, data }, { status: 200 })

  } catch (err) {
    // 4. Never leak raw errors — log server-side, return generic message
    console.error('POST /api/inquire failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
```

---

## The four rules every route follows
1. **Validate first** — parse input with a zod schema before any database call. If invalid, return 400 immediately.
2. **Enforce permission** — public routes (the inquiry form) are documented as public. Everything else must check the caller is authenticated and has the right role. If a route mutates the ledger, confirm the user id and set entered_by/recorded_by.
3. **Wrap in try/catch** — log the real error server-side with console.error; return a generic message to the client.
4. **Consistent shape** — always `{ ok: true, data }` or `{ ok: false, error }`.

---

## Which Supabase client to use (critical — see backend-security.md)
- **Public inquiry route** → service-role client (bypasses RLS, because brides aren't logged in). This is one of only TWO allowed uses of the service role.
- **Staff/owner routes** (rentals, payments, orders) → the user-scoped client that carries the logged-in session, so RLS enforces their role automatically.
- **Bride magic-link read** → service-role client, looked up strictly by share_token. The second and last allowed service-role use.

If you are unsure which client a route should use, STOP and read backend-security.md.

---

## Input validation with zod
- Install once: zod is the validation library.
- Define a schema per route matching the exact fields.
- Use enum validation for constrained fields:
```ts
budget_range: z.enum(['under_500','500_1200','1200_2500','2500_plus'])
```
These enums must match the CHECK constraints in backend-data-model.md exactly.

---

## Calling routes from the frontend
```ts
const res = await fetch('/api/inquire', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
})
const result = await res.json()
if (result.ok) { /* show confirmation */ } else { /* show error */ }
```
The inquiry form (frontend) already exists — it just needs its submit handler wired to POST here.

---

## Never do
- ❌ No business logic in client components — it belongs in the route
- ❌ No direct database calls from the browser — always through a route
- ❌ No service-role key outside the two allowed server-side uses
- ❌ No route without input validation
- ❌ No raw error messages returned to the client
- ❌ No update/delete routes for rentals or payments (append-only — see data model)
