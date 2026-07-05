# SKILL: Backend Auth
## Read this before anything touching login, sessions, roles, or the dashboard.

---

## What auth protects
- The public marketing site (/, /collections, /process, etc.) — NO auth, open to all.
- The dashboard (/dashboard/*) — auth REQUIRED. Linda (owner) + staff only.
- Brides NEVER authenticate. Order progress is via magic-link token only (see storage skill).

---

## Roles
- `owner` — Linda. Full access: inquiries, rentals, orders, payments, staff management, all financials.
- `staff` — boutique worker. Limited: log rentals, record payments, update dress status. CANNOT see inquiries, financial totals, edit history, or manage staff.
- Role lives in `profiles.role`. It is the single source of truth for every permission.

---

## Account creation model
- **NO public signup.** Supabase Auth signup is disabled/never exposed. Random people must never create accounts.
- **Linda's owner account**: created manually once (Supabase dashboard → Auth → Add user), then a matching `profiles` row with role='owner'. This is the only manually-created account.
- **Staff accounts**: created BY Linda from the dashboard (an owner-only "add staff" feature, built after the dashboard exists). Flow:
  1. Owner submits name + email + a temporary password.
  2. Server route (service-role, owner-only) creates the auth user AND the profile row with role='staff'.
  3. Linda gives the temp password to the staffer via WhatsApp/in person.
  4. Staffer logs in, is prompted to change password on first login.
- **Deactivation, never deletion**: sacking someone sets `profiles.active=false`. Their history stays intact and attributed. A deactivated user cannot log in or act (my_role() returns null for inactive users — see data model).

---

## Login
- Method: email + password only. No magic links for staff/owner. No social login.
- Login page: `/dashboard/login`.
- On success: redirect to `/dashboard`.
- On failure: generic "Invalid email or password" — never reveal which field was wrong.

---

## Session & route protection
- Use `@supabase/ssr` for cookie-based sessions (server-readable).
- A middleware (or protected layout) guards `/dashboard/*`:
  - No session → redirect to `/dashboard/login`.
  - Session exists but profile inactive → sign out, redirect to login with a message.
  - Session + active profile → allow. Load role for use in the UI.
- Owner-only pages/actions (inquiries, financials, staff management) additionally check role='owner' server-side. NEVER rely on hiding a button in the UI alone — enforce on the server/route too.

---

## The identity rule (theft protection foundation)
- Any action that writes `entered_by` / `recorded_by` / `uploaded_by` takes the id from the VERIFIED SESSION (`auth.getUser()`), NEVER from the request body.
- This is what makes the ledger trustworthy: staff cannot impersonate each other, because identity is proven by their login, not claimed in a form.
- If you ever find code setting entered_by from req.body — that is a security bug. Fix it.

---

## First-login password change
- New staff get a temporary password from Linda.
- On first successful login, if the account is flagged as needing a password change, redirect to a "set your password" screen before granting dashboard access.
- Track this with a `must_change_password` boolean on profiles (add to schema when building staff creation), defaulting true for staff-created accounts, false for Linda's.

---

## Checking auth in a route (pattern)
```ts
const supabase = await createUserScopedClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return Response.json({ ok:false, error:'Not authenticated' }, { status:401 })

const { data: profile } = await supabase
  .from('profiles').select('role, active').eq('id', user.id).single()
if (!profile?.active) return Response.json({ ok:false, error:'Account inactive' }, { status:403 })

// owner-only actions:
if (profile.role !== 'owner')
  return Response.json({ ok:false, error:'Not allowed' }, { status:403 })
```

---

## Hard rules
- ❌ No public signup exposed anywhere.
- ❌ No role or identity trusted from the client — always from the session + profiles table.
- ❌ No owner-only action protected by UI hiding alone — enforce server-side.
- ❌ Never delete a user to remove them — deactivate (active=false).
- ✅ Linda's account is the only manual one; all staff created through the owner feature.
- ✅ Temp password → first-login change for all staff accounts.
- ✅ Session via secure httpOnly cookies (@supabase/ssr), never localStorage.
