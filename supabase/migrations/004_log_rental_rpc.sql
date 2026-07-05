-- Migration 004 — log_rental() RPC: the atomic "create a rental" transaction.
-- See skills/backend-data-model.md and skills/backend-security.md.
--
-- Logging a rental touches three tables (rentals, payments, dresses) and must
-- either fully apply or not at all — a half-logged rental (e.g. dress marked
-- rented with no payment recorded) is exactly the kind of gap that enables
-- theft. Postgres functions are transactional as a whole, so wrapping all
-- three writes in one function guarantees atomicity without app-level
-- transaction handling.
--
-- SECURITY INVOKER (the default — left unspecified) is deliberate: the
-- function runs with the calling user's own privileges, so auth.uid() still
-- resolves to the real caller and every RLS policy below (entered_by /
-- recorded_by must equal auth.uid(), dress read/update policies) is enforced
-- exactly as if the three statements had been run directly. This function
-- does not bypass RLS — it just makes three already-permitted writes atomic.
create or replace function log_rental(
  p_dress_id uuid,
  p_client_name text,
  p_client_phone text,
  p_out_date date,
  p_due_date date,
  p_method text
) returns rentals
language plpgsql
as $$
declare
  v_rental rentals;
  v_price numeric;
  v_status text;
  v_deposit numeric;
begin
  select rental_price, status into v_price, v_status
  from dresses
  where id = p_dress_id
  for update;

  if v_price is null then
    raise exception 'Dress not found';
  end if;

  if v_status <> 'available' then
    raise exception 'Dress is not available';
  end if;

  -- Deposit is always 80% of the dress's rental price — computed here,
  -- never trusted from the client, so it can't be tampered with in transit.
  v_deposit := round(v_price * 0.8, 2);

  insert into rentals (dress_id, entered_by, client_name, client_phone, out_date, due_date, state)
  values (p_dress_id, auth.uid(), p_client_name, p_client_phone, p_out_date, p_due_date, 'deposit_paid')
  returning * into v_rental;

  insert into payments (rental_id, recorded_by, amount, kind, method)
  values (v_rental.id, auth.uid(), v_deposit, 'deposit', p_method);

  update dresses set status = 'rented' where id = p_dress_id;

  return v_rental;
end;
$$;

grant execute on function log_rental(uuid, text, text, date, date, text) to authenticated;
