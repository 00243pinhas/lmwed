# SKILL: Backend Orders (Custom Commissions)
## Read this before building anything related to custom orders.
## Custom orders are ~half of Linda's income — the other half of the business alongside rentals.

---

## What a custom order IS
A bespoke gown commission. Unlike a rental (quick, weeks, standard price), a custom order
is a months-long relationship with stages, progress updates, and a case-by-case price.

Lifecycle:
```
Inquiry (custom) → Linda converts to Order → 80% deposit → work begins
  → stages: consultation → design → measurements → production → arrived → delivered
  → on delivery: 20% completion → order complete
```

---

## The key difference from rentals: PRICE IS SET BY LINDA
- Rentals have a standard price; the 80% was computed from the dress's fixed rental_price.
- Custom orders have NO standard price — each gown is quoted individually.
- So Linda enters the agreed total price when she creates the order.
- THEN the 80% deposit and 20% completion are computed SERVER-SIDE from that agreed price.
- Security principle still holds: once the agreed_price is set, the split amounts are
  computed in the database (like rentals), so the amounts can't be fudged. Only the
  starting price is Linda's input — because only she knows what she quoted this bride.

---

## Permissions (owner-centric — this is Linda's domain)
- **Owner (Linda):** creates orders, sets the price, advances stages, records deposit &
  completion payments. Full control.
- **Staff:** can VIEW order status (so they can answer "is my dress ready?" at the boutique)
  but CANNOT create orders, set/change price, advance stages, or record any order payment.
- Enforce at BOTH layers: RLS policies (owner-only writes on orders) AND server-side role
  checks in the routes. UI hiding alone is never sufficient.

---

## Data model (orders table already exists — see backend-data-model.md)
Relevant fields: id, inquiry_id (nullable link to originating inquiry), client_name,
client_phone, description, agreed_price, stage, expected_delivery, share_token, created_at.
Payments reuse the SAME payments table (kind='deposit' | 'completion', order_id set,
rental_id null). The either-rental-or-order CHECK constraint already enforces exclusivity.

---

## Order creation flow
1. Owner opens a custom inquiry (or starts a blank order).
2. Enters/confirms: client_name, client_phone, description, agreed_price, expected_delivery.
3. On create: order is inserted with stage='consultation', and the 80% deposit payment is
   recorded (kind='deposit', amount = round(agreed_price * 0.8, 2), recorded_by=auth.uid()).
4. If created from an inquiry, set inquiry_id and mark that inquiry status='converted'.
5. Atomic: order insert + deposit payment together (RPC, like log_rental).

## Stage advancement
- Owner-only. Advances stage through the fixed sequence. Never skips backward
  (consultation→design→...→delivered). A guard should prevent illegal jumps.
- Each advancement is a simple owner update to the stage column.

## Delivery / completion
- When the order reaches 'delivered', the 20% completion payment is recorded
  (kind='completion', amount = round(agreed_price * 0.2, 2), recorded_by=auth.uid()).
- Atomic: record completion payment + set stage='delivered' together (RPC).
- Append-only: payments never edited/deleted; corrections are new rows.

---

## Append-only & attribution (same theft protection as rentals)
- All payments INSERT-only. No update/delete, not even for owner.
- recorded_by ALWAYS from auth.uid(), never the request body.
- Order price changes: if Linda must correct an agreed_price, think carefully — for now,
  allow owner to update agreed_price (she sets it), but log/consider whether a correction
  should be visible. Staff can NEVER change price.

---

## The bride's progress page (separate feature — see backend-storage.md)
- Each order has a share_token (magic link). The bride views her order's progress and
  photos at /my-dress/[token] — no login. Served via service-role read by token only.
- Progress photos live in order_updates (owner uploads; see backend-storage.md).
- This is built as its own piece AFTER core order tracking works.

---

## Hard rules
- ❌ Staff never create, price, advance, or pay on orders — view only.
- ❌ No payment edits/deletes (append-only).
- ❌ recorded_by never from the client body.
- ❌ Stages never skip or reverse (guard the sequence).
- ✅ agreed_price is Linda's input; 80/20 splits computed server-side from it.
- ✅ Order creation from an inquiry marks that inquiry 'converted'.
- ✅ Owner-only writes enforced at RLS AND route level.
