-- Migration 005 — complete_rental() RPC: the atomic "record a return" transaction.
-- Mirrors log_rental() (migration 004): see skills/backend-data-model.md and
-- skills/backend-security.md for the append-only / attribution rules this
-- follows.
--
-- Completing a rental touches three tables (payments, rentals, dresses) and
-- must either fully apply or not at all — a half-completed return (e.g. the
-- dress freed up with no closing payment recorded, or a payment recorded
-- but the dress left marked "rented" forever) is exactly the kind of gap
-- that enables theft or lost inventory. One Postgres function makes all
-- three writes atomic.
--
-- SECURITY INVOKER (the default — left unspecified) is deliberate, same as
-- log_rental: the function runs with the calling user's own privileges, so
-- auth.uid() resolves to the real caller and RLS is enforced exactly as if
-- the statements had been run directly. This function does not bypass RLS.

-- Existing RLS only lets the owner update a rental's state at all
-- ("owner only update rentals", migration 002). But dashboard-design.md
-- explicitly gives staff the "Record Return" action, matching the staff
-- permissions already granted for logging rentals and updating dress
-- status. Rather than widen rentals UPDATE for staff generally, this policy
-- grants exactly one transition — deposit_paid -> completed — so staff
-- still cannot rewrite client info, dates, or any other rental field.
-- The existing owner-only policy is untouched and still lets the owner
-- perform any rental update.
create policy "staff completes rentals" on rentals for update
  using (my_role() is not null and state = 'deposit_paid')
  with check (state = 'completed');

create or replace function complete_rental(
  p_rental_id uuid,
  p_method text
) returns rentals
language plpgsql
as $$
declare
  v_rental rentals;
  v_state text;
  v_dress_id uuid;
  v_price numeric;
  v_completion numeric;
begin
  select state, dress_id into v_state, v_dress_id
  from rentals
  where id = p_rental_id
  for update;

  if v_dress_id is null then
    raise exception 'Rental not found';
  end if;

  if v_state <> 'deposit_paid' then
    raise exception 'Rental is not awaiting return';
  end if;

  select rental_price into v_price
  from dresses
  where id = v_dress_id
  for update;

  -- Completion payment is always the remaining 20% of the dress's rental
  -- price — computed here, never trusted from the client, mirroring the
  -- 80% deposit computed in log_rental().
  v_completion := round(v_price * 0.2, 2);

  insert into payments (rental_id, recorded_by, amount, kind, method)
  values (p_rental_id, auth.uid(), v_completion, 'completion', p_method);

  update rentals set state = 'completed' where id = p_rental_id
  returning * into v_rental;

  update dresses set status = 'available' where id = v_dress_id;

  return v_rental;
end;
$$;

grant execute on function complete_rental(uuid, text) to authenticated;
