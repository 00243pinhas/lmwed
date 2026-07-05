-- Migration 008 — advance_order_stage() and complete_order() RPCs: the rest
-- of the custom order lifecycle after create_order() (migration 007).
-- See skills/backend-orders.md, skills/backend-data-model.md,
-- skills/backend-security.md.
--
-- SECURITY INVOKER (the default, left unspecified) is deliberate, same as
-- log_rental/complete_rental/create_order: each function runs with the
-- calling user's own privileges, so auth.uid()/my_role() resolve to the real
-- caller and RLS is enforced exactly as if the statements had been run
-- directly. Neither function bypasses RLS.
--
-- Both actions are owner-only (skills/backend-orders.md: "staff can VIEW
-- order status... but CANNOT... advance stages, or record any order
-- payment"). The existing "owner updates orders" and "owner insert order
-- payments" policies (migrations 002/007) already restrict the UPDATE/INSERT
-- these functions perform. But those are USING-clause restrictions on an
-- UPDATE — if a non-owner's UPDATE simply matches zero rows under RLS,
-- Postgres does not raise an error, it just silently updates nothing (unlike
-- an INSERT's WITH CHECK failure, which does raise). That would let a staff
-- session calling these RPCs directly (bypassing the owner-only API route)
-- get back a hollow "success" with a null/unchanged row instead of a clear
-- rejection. Each function below adds an explicit my_role() = 'owner' guard
-- up front so the failure is loud and unambiguous — the same instinct as the
-- migration 006 trigger, applied here as a guard instead of a trigger since
-- the write path is a single RPC rather than an arbitrary UPDATE statement.

create or replace function advance_order_stage(
  p_order_id uuid
) returns orders
language plpgsql
as $$
declare
  v_order orders;
  v_current text;
  v_next text;
begin
  if my_role() <> 'owner' then
    raise exception 'Only the owner may advance an order''s stage';
  end if;

  select stage into v_current
  from orders
  where id = p_order_id
  for update;

  if v_current is null then
    raise exception 'Order not found';
  end if;

  -- The sequence lives entirely in this CASE, and the function takes no
  -- target-stage parameter — the caller can only ever ask to move to
  -- whatever the fixed sequence says comes next, never an arbitrary stage.
  -- That rules out skipping forward and going backward structurally, not
  -- just by validation. Advancement is capped at 'arrived': there is no
  -- mapping from 'arrived' or 'delivered' to a next stage, because reaching
  -- 'delivered' only happens through complete_order() below — the two
  -- actions never collide.
  v_next := case v_current
    when 'consultation' then 'design'
    when 'design' then 'measurements'
    when 'measurements' then 'production'
    when 'production' then 'arrived'
    else null
  end;

  if v_next is null then
    raise exception 'Order at stage % cannot be advanced further — delivery is recorded separately', v_current;
  end if;

  update orders set stage = v_next where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function advance_order_stage(uuid) to authenticated;

-- Mirrors complete_rental() (migration 005): recording delivery touches two
-- tables (payments, orders) and must either fully apply or not at all — a
-- half-completed delivery (dress marked delivered with no completion
-- payment, or a payment recorded but the order left at 'arrived' forever)
-- is exactly the kind of gap that atomicity closes elsewhere in this
-- codebase.
create or replace function complete_order(
  p_order_id uuid,
  p_method text
) returns orders
language plpgsql
as $$
declare
  v_order orders;
  v_stage text;
  v_price numeric;
  v_completion numeric;
begin
  if my_role() <> 'owner' then
    raise exception 'Only the owner may record an order delivery';
  end if;

  select stage, agreed_price into v_stage, v_price
  from orders
  where id = p_order_id
  for update;

  if v_stage is null then
    raise exception 'Order not found';
  end if;

  -- Guards both "not ready yet" (anything before 'arrived') and "already
  -- delivered" (stage = 'delivered') in one check, so a second call after
  -- delivery cannot record a duplicate completion payment.
  if v_stage <> 'arrived' then
    raise exception 'Order is not awaiting delivery';
  end if;

  if v_price is null then
    raise exception 'Order has no agreed price set';
  end if;

  -- Completion payment is always 20% of the agreed price Linda quoted —
  -- computed here, never trusted from the client, mirroring the 80%/20%
  -- splits in create_order()/complete_rental().
  v_completion := round(v_price * 0.2, 2);

  insert into payments (order_id, recorded_by, amount, kind, method)
  values (p_order_id, auth.uid(), v_completion, 'completion', p_method);

  update orders set stage = 'delivered' where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function complete_order(uuid, text) to authenticated;
