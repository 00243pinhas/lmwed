-- Migration 006 — trigger to close the field-smuggling gap in the
-- "staff completes rentals" policy (migration 005).
--
-- RLS's WITH CHECK only sees the proposed NEW row — it cannot compare it to
-- OLD, so `with check (state = 'completed')` accepts an update that sets
-- state='completed' AND rewrites client_name/client_phone/out_date/due_date/
-- dress_id in the same statement, as long as the app never sends such a
-- request. That's true today (complete_rental() only ever sets `state`),
-- but it means the actual protection lives in app code, not the database
-- wall — a staff member calling the table directly (their session + the
-- anon key, bypassing the API route) could smuggle other field changes
-- through. This trigger enforces the restriction at the database level,
-- independent of what the app does.
--
-- Owner is exempt entirely (my_role() = 'owner' returns immediately) — the
-- owner retains full, unrestricted control over rentals per the data model.
-- For everyone else (i.e. staff, the only other authenticated role that can
-- reach an UPDATE on rentals at all per RLS), the ONLY change permitted is
-- state: 'deposit_paid' -> 'completed', with every other column identical
-- to its OLD value. Anything else raises and aborts the whole statement.
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
