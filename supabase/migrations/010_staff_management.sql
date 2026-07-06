-- Migration 010 — Staff management: owner adds/deactivates staff themselves.
-- See skills/backend-auth.md ("Account creation model", "First-login password
-- change") and skills/backend-data-model.md.

-- ============ profiles.email ============
-- profiles previously had no email column — auth.users has it, but that
-- table isn't reachable through the user-scoped client/RLS. The staff list
-- (app/dashboard/staff) needs to display each staffer's email, so it's
-- denormalized onto profiles at account-creation time (set once, by the
-- owner-only create-staff route, never by the staffer themselves).
alter table profiles add column if not exists email text;

-- Backfill existing rows (Linda's manually-created owner account) from
-- auth.users — this join only works here, run as the SQL Editor's admin
-- role; the app itself never reads auth.users directly.
update profiles p set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

alter table profiles alter column email set not null;

-- ============ profiles.must_change_password ============
-- Per skills/backend-auth.md: staff get a temporary password from Linda and
-- must change it on first login before reaching any dashboard content.
-- Linda's own account never needs this.
alter table profiles add column if not exists must_change_password boolean not null default true;
update profiles set must_change_password = false where role = 'owner';

-- ============ complete_password_change() ============
-- The only RLS UPDATE policy on profiles is "owner manages profiles"
-- (my_role() = 'owner') — a staff member cannot UPDATE their own row,
-- including their own must_change_password flag. Opening a general
-- self-update policy would let a staffer rewrite their own role/active
-- columns too (privilege escalation), so instead this is a narrow
-- SECURITY DEFINER function: it takes no input besides the caller's own
-- auth.uid(), touches only that one row, and only ever sets
-- must_change_password to false. Mirrors my_role()'s use of
-- `security definer set search_path = public`.
create or replace function complete_password_change() returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles set must_change_password = false where id = auth.uid();
end;
$$;

grant execute on function complete_password_change() to authenticated;
