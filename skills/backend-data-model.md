# SKILL: Backend Data Model
## Read this before touching anything database-related. This is the source of truth for the schema.

---

## Stack
- Database: Supabase (Postgres) — project created manually by the developer
- Auth: Supabase Auth (email/password for Linda + staff; brides never log in)
- Storage: Supabase Storage, bucket `order-media` (progress photos/videos)
- Client: `@supabase/supabase-js` from Next.js API routes
- Keys live in `.env.local` — NEVER committed:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only, never exposed to browser
RESEND_API_KEY=...
```

---

## Core security principles (why the schema looks like this)
1. **Append-only ledger**: staff can INSERT rentals/payments, never UPDATE or DELETE. Enforced by RLS, not app code.
2. **Attribution everywhere**: every rental, payment, and update records WHO created it.
3. **Nobody is deleted**: staff are deactivated (`active=false`), preserving their history.
4. **Brides don't log in**: order progress pages are served via unguessable `share_token`, through an API route using the service role key.
5. **The public form inserts through the API route only** (service role) — the anon key has no table access.

---

## The Schema — run this in Supabase SQL Editor as migration 001

```sql
-- ============ PROFILES (Linda + staff) ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'staff' check (role in ('owner','staff')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ INQUIRIES (from the website form) ============
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  city text not null,
  whatsapp text not null,
  email text,
  service_type text,          -- 'custom' | 'rental' | 'not_sure'
  silhouette text,
  dress_description text,
  inspiration_link text,
  wedding_month text,
  wedding_year text,
  wedding_city text,
  budget_range text not null, -- 'under_500' | '500_1200' | '1200_2500' | '2500_plus'
  found_us text,              -- 'instagram' | 'tiktok' | 'friend' | 'other'
  status text not null default 'new' check (status in ('new','contacted','converted','closed')),
  created_at timestamptz not null default now()
);

-- ============ DRESSES (the 10 rental dresses) ============
create table dresses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  size text,
  rental_price numeric not null,
  status text not null default 'available' check (status in ('available','rented','retired')),
  created_at timestamptz not null default now()
);

-- ============ RENTALS (the append-only ledger) ============
create table rentals (
  id uuid primary key default gen_random_uuid(),
  dress_id uuid not null references dresses(id),
  entered_by uuid not null references profiles(id),
  client_name text not null,
  client_phone text not null,
  out_date date not null,
  due_date date not null,
  state text not null default 'deposit_paid'
    check (state in ('deposit_paid','returned','completed','overdue')),
  created_at timestamptz not null default now()
);

-- ============ ORDERS (custom commissions) ============
create table orders (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references inquiries(id),
  client_name text not null,
  client_phone text not null,
  description text,
  agreed_price numeric,
  stage text not null default 'consultation'
    check (stage in ('consultation','design','measurements','production','arrived','delivered')),
  expected_delivery date,
  share_token uuid not null default gen_random_uuid(),  -- the magic link
  created_at timestamptz not null default now()
);

-- ============ PAYMENTS (events, never edited) ============
create table payments (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid references rentals(id),
  order_id uuid references orders(id),
  recorded_by uuid not null references profiles(id),
  amount numeric not null check (amount > 0),
  kind text not null check (kind in ('deposit','completion')),
  method text not null check (method in ('cash','orange_money','bank','other')),
  created_at timestamptz not null default now(),
  -- a payment belongs to exactly one of: a rental OR an order
  check (
    (rental_id is not null and order_id is null) or
    (rental_id is null and order_id is not null)
  )
);

-- ============ ORDER_UPDATES (progress photos/videos) ============
create table order_updates (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  uploaded_by uuid not null references profiles(id),
  media_url text not null,
  media_type text not null check (media_type in ('image','video')),
  caption text,
  stage text,
  created_at timestamptz not null default now()
);
```

---

## Migration 002 — Row Level Security (the theft protection)

```sql
-- Enable RLS everywhere. With RLS on and no policy, access is DENIED by default.
alter table profiles enable row level security;
alter table inquiries enable row level security;
alter table dresses enable row level security;
alter table rentals enable row level security;
alter table payments enable row level security;
alter table orders enable row level security;
alter table order_updates enable row level security;

-- Helper: current user's role (returns null if not logged in)
create or replace function my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and active = true
$$;

-- ===== PROFILES =====
create policy "read own profile" on profiles for select using (id = auth.uid());
create policy "owner reads all profiles" on profiles for select using (my_role() = 'owner');
create policy "owner manages profiles" on profiles for update using (my_role() = 'owner');

-- ===== INQUIRIES ===== (owner only; the public form writes via service role)
create policy "owner full inquiries" on inquiries for all using (my_role() = 'owner');

-- ===== DRESSES ===== (staff see & update status; only owner creates/retires)
create policy "authenticated read dresses" on dresses for select using (my_role() is not null);
create policy "staff update dress status" on dresses for update using (my_role() is not null);
create policy "owner insert dresses" on dresses for insert with check (my_role() = 'owner');

-- ===== RENTALS ===== THE APPEND-ONLY LEDGER
create policy "authenticated read rentals" on rentals for select using (my_role() is not null);
create policy "staff+owner insert rentals" on rentals for insert
  with check (my_role() is not null and entered_by = auth.uid());
create policy "owner only update rentals" on rentals for update using (my_role() = 'owner');
-- Staff may also complete a rental (the return flow), but ONLY the exact
-- deposit_paid -> completed transition — added in migration 005 alongside
-- complete_rental(). They cannot rewrite any other rental field.
create policy "staff completes rentals" on rentals for update
  using (my_role() is not null and state = 'deposit_paid')
  with check (state = 'completed');
-- NOTE: no DELETE policy exists for anyone. Rentals are permanent.
-- NOTE: RLS's WITH CHECK can't compare OLD vs NEW columns, so the policy
-- above only constrains the resulting `state` — it does NOT stop staff from
-- also rewriting client_name/client_phone/out_date/due_date/dress_id in the
-- same update. Migration 006 adds a BEFORE UPDATE trigger
-- (enforce_rentals_staff_transition) that closes this: for any non-owner,
-- the ONLY permitted change is state deposit_paid -> completed, with every
-- other column identical to OLD, or the update is rejected. Owner is exempt.

-- ===== PAYMENTS ===== same append-only pattern
create policy "authenticated read payments" on payments for select using (my_role() is not null);
create policy "staff+owner insert payments" on payments for insert
  with check (my_role() is not null and recorded_by = auth.uid());
-- NOTE: no UPDATE and no DELETE for anyone — not even owner.
-- A wrong payment is corrected by a new adjusting entry, never by editing history.

-- ===== ORDERS ===== (owner manages; staff can view)
create policy "authenticated read orders" on orders for select using (my_role() is not null);
create policy "owner writes orders" on orders for insert with check (my_role() = 'owner');
create policy "owner updates orders" on orders for update using (my_role() = 'owner');

-- ===== ORDER_UPDATES ===== (owner uploads for now; atelier later = policy flip)
create policy "authenticated read updates" on order_updates for select using (my_role() is not null);
create policy "owner insert updates" on order_updates for insert
  with check (my_role() = 'owner' and uploaded_by = auth.uid());
```

---

## Migration 006 — the rentals field-smuggling guard (a trigger, not a policy)
RLS `with check` only sees the proposed NEW row; it cannot reference OLD. That means
the `staff completes rentals` policy above can only constrain the resulting `state`
column — it cannot stop a staff member from *also* rewriting `client_name`,
`client_phone`, `out_date`, `due_date`, or `dress_id` in the same UPDATE statement.
The app never does this (`complete_rental()` only ever sets `state`), but that means
the real protection was living in app code, not the database wall — a staff session
calling the `rentals` table directly (anon key + their cookie, bypassing the API
route entirely) could smuggle other field changes through.

```sql
create or replace function enforce_rentals_staff_transition() returns trigger
language plpgsql
as $$
begin
  if my_role() = 'owner' then
    return new;
  end if;

  if old.state = 'deposit_paid'
     and new.state = 'completed'
     and new.id = old.id
     and new.dress_id = old.dress_id
     and new.entered_by = old.entered_by
     and new.client_name = old.client_name
     and new.client_phone = old.client_phone
     and new.out_date = old.out_date
     and new.due_date = old.due_date
     and new.created_at = old.created_at
  then
    return new;
  end if;

  raise exception 'Only the owner may modify a rental beyond completing it — staff may only transition deposit_paid to completed, with no other field changes';
end;
$$;

create trigger rentals_staff_transition_guard
  before update on rentals
  for each row
  execute function enforce_rentals_staff_transition();
```

A BEFORE UPDATE trigger runs after RLS has already allowed the row through, and can
compare OLD to NEW — closing exactly the gap RLS structurally can't. Owner is
exempt (`my_role() = 'owner'` returns immediately, no restriction). Any other
caller that reaches this trigger must be transitioning `deposit_paid -> completed`
with every other column byte-identical to OLD, or the whole statement is rejected.

## Why payments have NO update policy even for the owner
Accounting integrity. If a payment was entered wrong, the correction is a NEW row
(negative adjustment or replacement entry). History is never rewritten — this is
what makes the ledger trustworthy and what would have exposed the previous theft.

## The bride's magic-link page
`/my-dress/[token]` is a public Next.js page. Its API route uses the SERVICE ROLE key
server-side: looks up the order by share_token, returns order + its updates.
No RLS policy needed for brides because they never touch the database directly.
Tokens are UUIDs — unguessable. Linda shares the link once via WhatsApp.

## Storage bucket
Bucket: `order-media`, private. Uploads via owner session. The magic-link API returns
signed URLs (1h expiry) for the bride's page. Keep videos short (<60s).

## Seed data (migration 003) — after Linda provides real info
- Insert her ~10 dresses with names, sizes, rental prices
- Create Linda's auth user, set role='owner' in profiles
- Create staff auth user(s), role='staff'
