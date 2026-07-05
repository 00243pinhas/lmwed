-- Migration 007 — create_order() RPC: the atomic "start a commission" transaction.
-- Mirrors log_rental() (migration 004): SECURITY INVOKER (the default, left
-- unspecified) is deliberate — the function runs with the calling user's own
-- privileges, so auth.uid() resolves to the real caller and every RLS policy
-- below is enforced exactly as if the statements had been run directly. This
-- function does not bypass RLS, it just makes three already-permitted writes
-- atomic: a half-created commission (an order with no deposit recorded, or
-- an inquiry silently left 'new' after being converted) is the same kind of
-- gap that atomicity closes for log_rental/complete_rental.

-- Payments RLS (migration 002) predates orders and is too permissive: the
-- existing "staff+owner insert payments" policy lets ANY authenticated user
-- insert a payment with order_id set, as long as recorded_by is themselves.
-- Per skills/backend-orders.md, order payments (deposit/completion) are
-- owner-only — staff must never record a payment on a commission. Split the
-- single policy into two, scoped by which ledger the payment belongs to, so
-- rental payments keep working for staff+owner while order payments become
-- owner-only.
drop policy if exists "staff+owner insert payments" on payments;

create policy "staff+owner insert rental payments" on payments for insert
  with check (my_role() is not null and recorded_by = auth.uid() and rental_id is not null);

create policy "owner insert order payments" on payments for insert
  with check (my_role() = 'owner' and recorded_by = auth.uid() and order_id is not null);

-- NOTE: "owner writes orders" (migration 002) already restricts order INSERTs
-- to the owner — confirmed here, no change needed for that policy.

create or replace function create_order(
  p_client_name text,
  p_client_phone text,
  p_description text,
  p_agreed_price numeric,
  p_expected_delivery date,
  p_inquiry_id uuid,
  p_method text
) returns orders
language plpgsql
as $$
declare
  v_order orders;
  v_deposit numeric;
begin
  if p_agreed_price is null or p_agreed_price <= 0 then
    raise exception 'Agreed price must be greater than zero';
  end if;

  if p_inquiry_id is not null and not exists (select 1 from inquiries where id = p_inquiry_id) then
    raise exception 'Inquiry not found';
  end if;

  -- Deposit is always 80% of the price Linda quoted — computed here, never
  -- trusted from the client, mirroring the 80% deposit in log_rental().
  v_deposit := round(p_agreed_price * 0.8, 2);

  insert into orders (inquiry_id, client_name, client_phone, description, agreed_price, expected_delivery, stage)
  values (p_inquiry_id, p_client_name, p_client_phone, p_description, p_agreed_price, p_expected_delivery, 'consultation')
  returning * into v_order;

  insert into payments (order_id, recorded_by, amount, kind, method)
  values (v_order.id, auth.uid(), v_deposit, 'deposit', p_method);

  if p_inquiry_id is not null then
    update inquiries set status = 'converted' where id = p_inquiry_id;
  end if;

  return v_order;
end;
$$;

grant execute on function create_order(text, text, text, numeric, date, uuid, text) to authenticated;
