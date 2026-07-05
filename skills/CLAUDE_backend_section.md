# ==========================================================
# APPEND EVERYTHING BELOW THIS LINE TO YOUR EXISTING CLAUDE.md
# (after the frontend rules, before or after the graphify block)
# ==========================================================

---

## BACKEND — Architecture & Rules

### Architecture
This project is **full-stack Next.js**. Backend lives in `app/api/` as route handlers (`route.ts` files). There is NO separate backend app, NO NestJS, NO Express. Frontend and backend share one codebase, one deploy (Vercel), one language (TypeScript).

- Data layer: **Supabase (Postgres)** — auth, database, storage, row-level security
- Email: **Resend**
- Backend routes: `app/api/[endpoint]/route.ts`
- DB connection helpers: `lib/supabase.ts`
- The full schema + security model is defined in `skills/backend-data-model.md` — READ IT before any database work.

### Always Do First (backend tasks)
- Read `skills/backend-data-model.md` before writing any route, query, or migration.
- Read `skills/backend-api.md` before creating any API route.
- Read `skills/backend-security.md` before anything touching auth, roles, or data access.
- Never invent table or column names — they are fixed in the data model skill.

---

## Backend Skills Table

| Task | Read this skill first |
|---|---|
| Any database query, table, or migration | `skills/backend-data-model.md` |
| Creating or changing an API route | `skills/backend-api.md` |
| Auth, roles, permissions, data access | `skills/backend-security.md` |
| Sending email to Linda | `skills/backend-notifications.md` |
| File/photo/video uploads | `skills/backend-storage.md` |

---

## Backend Hard Rules — Never Break

### Security
- ❌ NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or any client component. Server-side route handlers only.
- ❌ NEVER put secrets in code — all keys come from `.env.local` (which is gitignored).
- ❌ NEVER trust client input — validate every field on the server before it touches the database.
- ❌ NEVER let a route bypass Row Level Security by using the service role key for user actions. Service role is ONLY for: the public inquiry form insert, and the bride's magic-link read.
- ✅ Every mutating route validates input, checks the caller's role where required, and returns a clear success/error shape.

### The Append-Only Ledger (theft protection — non-negotiable)
- ❌ NEVER write a route that UPDATEs or DELETEs a `rentals` or `payments` row for staff.
- ❌ NEVER "fix" a wrong payment by editing it — corrections are NEW rows only.
- ✅ Rentals and payments are INSERT-only for everyone except owner-level rental state changes.
- ✅ Every rental and payment insert must set `entered_by` / `recorded_by` to the authenticated user's id.

### Data Integrity
- ❌ NEVER hardcode data that belongs in the database.
- ❌ NEVER create a table or column not defined in `skills/backend-data-model.md` without updating that skill first.
- ✅ Use the exact enum values from the data model (e.g. budget_range, rental state, payment kind).
- ✅ A payment belongs to EITHER a rental OR an order — never both, never neither.

### Roles
- `owner` (Linda) — full access to everything.
- `staff` — may INSERT rentals and payments, update dress status; may NOT see inquiries, financial totals, or edit history.
- Brides — never authenticate; access order progress only via `share_token` magic link.

---

## API Route Conventions
- One folder per endpoint: `app/api/inquire/route.ts`, `app/api/rentals/route.ts`
- Export named HTTP methods: `export async function POST(req: Request) {}`
- Always wrap logic in try/catch; never leak raw error details to the client.
- Return JSON with a consistent shape: `{ ok: true, data }` or `{ ok: false, error }`.
- Validate input with a schema (zod) before any database call.
- Server-only secrets accessed via `process.env` inside the route — never imported into client components.

---

## Backend Build Order (Phase 2)
Build in this sequence — smallest useful slice first:
```
1. lib/supabase.ts               — connection helpers (server + browser)
2. Supabase project + migrations — schema & RLS (manual, in Supabase dashboard)
3. app/api/inquire/route.ts      — form → database → email to Linda  [FIRST VALUE]
4. Auth setup                    — Linda + staff login
5. app/api/rentals/route.ts      — the rental ledger
6. app/api/payments/route.ts     — 80/20 payment recording
7. app/api/orders/route.ts       — custom order tracking
8. Bride magic-link page + route — order progress for clients
```

## Definition of Done (per backend route)
- [ ] Input validated on the server before any DB call
- [ ] Correct role/permission enforced (or documented why public)
- [ ] Uses exact table/column/enum names from the data model skill
- [ ] Secrets only from env, never in code, never sent to browser
- [ ] Respects the append-only rule (no update/delete on ledger tables)
- [ ] Returns consistent `{ ok, ... }` JSON shape
- [ ] try/catch with no raw error leakage
- [ ] Tested with a real request before marked complete
