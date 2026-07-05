# SKILL: Backend Security
## Read this before anything touching auth, roles, keys, or data access.
## This is the most important backend skill. When unsure, default to the most restrictive option.

---

## The three Supabase keys — and the golden rule
```
NEXT_PUBLIC_SUPABASE_URL        — safe to expose (it's just the address)
NEXT_PUBLIC_SUPABASE_ANON_KEY   — safe to expose (RLS protects everything behind it)
SUPABASE_SERVICE_ROLE_KEY       — DANGEROUS. Bypasses ALL security. Server-only. NEVER to the browser.
```

**GOLDEN RULE:** The service role key may ONLY appear in server-side route handlers, and ONLY in these two situations:
1. The public inquiry form insert (brides aren't logged in, so RLS can't scope them).
2. The bride's magic-link read (lookup strictly by share_token).

Anywhere else — any staff or owner action — uses the user-scoped client so RLS enforces roles. If you find yourself reaching for the service role key for a third reason, STOP. You are about to create a security hole.

---

## Two Supabase clients — when to use which

### 1. User-scoped client (default for authenticated actions)
Carries the logged-in user's session. RLS automatically applies their role.
Use for: rentals, payments, orders, dresses, viewing inquiries — everything a logged-in Linda or staff member does.
```ts
// lib/supabase.ts — createServerComponentClient / route handler client
// reads the session from cookies, respects RLS
```

### 2. Service-role client (the two exceptions only)
Bypasses RLS entirely. Godmode. Two uses, ever.
```ts
// lib/supabase.ts — createServiceClient()
// uses SUPABASE_SERVICE_ROLE_KEY, server-only
```

---

## Why RLS is the real protection (not the app code)
The app UI hides things from staff — but a determined person could bypass the UI.
Row Level Security lives in the DATABASE. Even a direct API call with the anon key
cannot read inquiries or edit a payment if the policy forbids it. The app is the
window; RLS is the wall. Both matter, but the wall is what actually stops theft.

Full policies are in backend-data-model.md. The key ones to never violate in code:
- Staff can INSERT rentals & payments, never UPDATE or DELETE them.
- Only owner can change a rental's state or edit orders.
- Payments can NEVER be updated or deleted by anyone — corrections are new rows.
- Staff can never SELECT inquiries or financial totals.

---

## Auth model
- Linda + staff authenticate via Supabase Auth (email + password).
- On signup/creation, a matching row is created in `profiles` with their role.
- `owner` = Linda (one account). `staff` = the boutique worker(s).
- Brides NEVER authenticate. They reach order progress only via the unguessable
  `share_token` magic link, served by a service-role read scoped to that one token.

### Checking role in a route
```ts
const { data: { user } } = await supabase.auth.getUser()
if (!user) return Response.json({ ok: false, error: 'Not authenticated' }, { status: 401 })

const { data: profile } = await supabase.from('profiles')
  .select('role, active').eq('id', user.id).single()

if (!profile?.active) return Response.json({ ok: false, error: 'Account inactive' }, { status: 403 })
// owner-only actions:
if (profile.role !== 'owner') return Response.json({ ok: false, error: 'Not allowed' }, { status: 403 })
```

---

## The append-only ledger in code (theft protection)
- NEVER write a route with `.update()` or `.delete()` on `rentals` or `payments` for staff.
- Owner may update a rental's STATE (deposit_paid → returned → completed) — that's allowed and RLS permits it.
- A wrong payment is fixed by inserting a NEW correcting payment, never by editing.
- Every insert into rentals/payments MUST set entered_by / recorded_by to the authenticated user's id — never a value from the client body. Read it from the session:
```ts
entered_by: user.id   // from auth.getUser(), NOT from req body
```
This is critical: if you trust the client to say who they are, staff could impersonate. Always take identity from the verified session.

---

## Input trust
- NEVER trust anything from the client body except as data to validate.
- Identity (who is acting) always comes from the auth session, never the request body.
- Validate every field with zod before it touches the database.
- Sanitize/limit text lengths on free-text fields (descriptions, captions).

---

## Environment & secrets
- All keys in `.env.local`. Confirm `.env*` is in `.gitignore`.
- NEVER commit a key. NEVER log a key. NEVER send the service role key in a response.
- On Vercel, secrets are set in the project's Environment Variables settings — never in code.

---

## Security definition of done (every route)
- [ ] Uses the correct client (user-scoped vs service-role) per the two-exceptions rule
- [ ] Identity taken from session, never from request body
- [ ] Role checked where the action requires it
- [ ] No service-role key outside the two allowed uses
- [ ] No update/delete on ledger tables
- [ ] Input validated before any DB call
- [ ] No secret in code, logs, or response
