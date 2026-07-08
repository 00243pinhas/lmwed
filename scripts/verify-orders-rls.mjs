
// TEMPORARY VERIFICATION SCRIPT — delete after use.
//
// Verifies the custom-order side has the same RLS/theft-protection
// guarantees already proven for rentals (see scripts/verify-staff-rls.mjs,
// which this mirrors). Per skills/backend-orders.md, staff may VIEW orders
// but must never create, price, advance, pay, or upload media on one — this
// script proves that hold at the database wall (RLS + SECURITY INVOKER
// RPCs), not just in app code.
//
// Requires env vars:
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY   (already in .env.local)
//   STAFF_EMAIL, STAFF_PASSWORD     a real staff-role login
//   OWNER_EMAIL, OWNER_PASSWORD     a real owner-role login (needed for fixtures)
//   SITE_URL                        optional, default http://localhost:3000
//                                    (only used for test 8, the bride
//                                    magic-link isolation check — run
//                                    `npm run dev` first if you want that
//                                    test to run instead of being skipped)
//
// Run:
//   STAFF_EMAIL=you@example.com STAFF_PASSWORD=... \
//   OWNER_EMAIL=linda@example.com OWNER_PASSWORD=... \
//     node --env-file=.env.local scripts/verify-orders-rls.mjs
//
// Why OWNER creds are required (not optional, unlike the rentals script):
// every one of these 8 checks needs a real order (and, for test 5, a real
// order payment) to aim the blocked mutation at. Only the owner can create
// one (create_order is owner-gated at RLS). Fixtures are tagged
// "ORDERS-VERIFY-TEST-<timestamp>" in client_name.
//
// WARNING — fixtures are permanent: orders, payments, and order_updates
// cannot be deleted by anyone through the app (by design — append-only /
// owner-only, see skills/backend-data-model.md). The disposable order (and
// its auto-created deposit payment) this script creates will remain in the
// database. Cleanup SQL is printed at the end of the run (run it in the
// Supabase SQL Editor, which runs as an admin role and bypasses RLS).
//
// This script makes NO policy changes and only ever attempts the mutations
// it expects to be blocked — it is verification only. If it finds a real
// hole (a blocked-mutation test unexpectedly succeeds), it reports FAIL with
// the exact gap and does NOT attempt to fix or revert anything — that is a
// human decision.

import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  process.exit(1)
}

const results = []
function record(name, ok, detail) {
  results.push({ name, ok })
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`)
}
function recordInconclusive(name, detail) {
  results.push({ name, ok: null })
  console.log(`[SKIP] ${name}${detail ? ' — ' + detail : ''}`)
}

// A write is "blocked" by RLS in one of two ways: the row never matches
// USING (silently 0 rows affected, no error), or the row matches USING but
// the resulting row fails WITH CHECK (Postgres raises "new row violates
// row-level security policy"). An RPC's own internal `raise exception` on a
// role guard also surfaces as `error`. All three mean the write did not go
// through.
function writeBlocked(data, error) {
  return Boolean(error) || (data?.length ?? 0) === 0
}

async function signIn(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  })
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Sign-in failed for ${email}: ${error.message}`)
  return { client, user: data.user }
}

async function createFixtureOrder(owner, testTag) {
  const delivery = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10)
  const { data, error } = await owner.rpc('create_order', {
    p_client_name: testTag,
    p_client_phone: '0000000000',
    p_description: 'Disposable fixture order for orders-RLS verification.',
    p_agreed_price: 1000,
    p_expected_delivery: delivery,
    p_inquiry_id: null,
    p_method: 'cash',
  })
  if (error) throw new Error(`Owner could not create fixture order: ${error.message}`)
  return data
}

// ---- 1. Staff CANNOT create an order (owner-only) ----
async function testCannotCreateOrder(staff) {
  const delivery = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10)
  const { data, error } = await staff.rpc('create_order', {
    p_client_name: 'RLS-HACK-ATTEMPT',
    p_client_phone: '0000000000',
    p_description: 'Should never exist.',
    p_agreed_price: 500,
    p_expected_delivery: delivery,
    p_inquiry_id: null,
    p_method: 'cash',
  })
  const blocked = writeBlocked(data ? [data] : null, error)
  record(
    "1. Staff CANNOT create an order",
    blocked,
    error ? error.message : `unexpectedly created order id=${data?.id}`
  )
}

// ---- 2. Staff CANNOT advance an order's stage ----
async function testCannotAdvanceStage(staff, order) {
  const { data, error } = await staff.rpc('advance_order_stage', { p_order_id: order.id })
  const blocked = writeBlocked(data ? [data] : null, error)
  record(
    "2. Staff CANNOT advance an order's stage",
    blocked,
    error ? error.message : `unexpectedly advanced to stage=${data?.stage}`
  )
}

// ---- 3. Staff CANNOT record a delivery/completion payment ----
async function testCannotCompleteOrder(staff, order) {
  const { data, error } = await staff.rpc('complete_order', {
    p_order_id: order.id,
    p_method: 'cash',
  })
  const blocked = writeBlocked(data ? [data] : null, error)
  record(
    '3. Staff CANNOT record a delivery/completion payment',
    blocked,
    error ? error.message : `unexpectedly completed, stage=${data?.stage}`
  )
}

// ---- 4. Staff CANNOT insert an order payment directly (bypassing the RPC) ----
async function testCannotInsertOrderPaymentDirectly(staff, order, staffUserId) {
  const { data, error } = await staff
    .from('payments')
    .insert({
      order_id: order.id,
      recorded_by: staffUserId,
      amount: 1,
      kind: 'deposit',
      method: 'cash',
    })
    .select()
  const blocked = writeBlocked(data, error)
  record(
    '4. Staff CANNOT insert an order payment directly (bypassing the RPC)',
    blocked,
    error ? error.message : `rows inserted=${data?.length ?? 0}`
  )
}

// ---- 5. Staff CANNOT update or delete an order payment (append-only) ----
async function testOrderPaymentImmutability(staff, owner, orderId) {
  const { data: payments, error: readError } = await owner
    .from('payments')
    .select('id')
    .eq('order_id', orderId)
    .limit(1)

  if (readError || !payments?.length) {
    record(
      '5. Staff CANNOT update or delete an order payment',
      false,
      `Could not find the fixture deposit payment to target: ${readError?.message ?? 'none found'}`
    )
    return
  }
  const paymentId = payments[0].id

  const { data: delData, error: delError } = await staff
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .select()
  const deleteBlocked = writeBlocked(delData, delError)

  const { data: updData, error: updError } = await staff
    .from('payments')
    .update({ amount: 1 })
    .eq('id', paymentId)
    .select()
  const updateBlocked = writeBlocked(updData, updError)

  record(
    '5. Staff CANNOT update or delete an order payment',
    deleteBlocked && updateBlocked,
    `delete ${deleteBlocked ? 'blocked' : 'SUCCEEDED (hole!)'}, update ${updateBlocked ? 'blocked' : 'SUCCEEDED (hole!)'}`
  )
}

// ---- 6. Staff CANNOT update other order fields directly (field-smuggling) ----
async function testCannotSmuggleOrderFields(staff, order) {
  const { data, error } = await staff
    .from('orders')
    .update({ agreed_price: 99999, client_name: 'RLS-HACK-ATTEMPT', stage: 'delivered' })
    .eq('id', order.id)
    .select()
  const blocked = writeBlocked(data, error)
  record(
    '6. Staff CANNOT update other order fields directly (field-smuggling: agreed_price/client_name/stage)',
    blocked,
    error
      ? error.message
      : blocked
        ? 'rows updated=0 — unlike rentals, orders has NO staff update policy at all (only "owner updates orders"), so there is no partial-grant hole to smuggle through'
        : `GAP: order fields changed via direct update — resulting row: ${JSON.stringify(data[0])}`
  )
}

// ---- 7. Staff CANNOT upload order progress media (owner-only) ----
async function testCannotUploadOrderMedia(staff, order, testTag) {
  const path = `${order.id}/RLS-VERIFY-TEST-${Date.now()}.txt`
  const { data, error } = await staff.storage
    .from('order-media')
    .upload(path, Buffer.from('rls verification probe'), {
      contentType: 'text/plain',
      upsert: false,
    })
  const blocked = Boolean(error)
  const bucketMissing = /bucket.*not.*found/i.test(error?.message ?? '')
  record(
    '7. Staff CANNOT upload order progress media',
    blocked,
    error
      ? error.message + (bucketMissing ? ' (NOTE: this error is about the bucket, not RLS — inconclusive if so; confirm the "order-media" bucket exists)' : '')
      : `GAP: upload SUCCEEDED at path=${data?.path}`
  )

  // Bonus: the order_updates table row itself (separate owner-only policy
  // from migration 002/009) — the app never uploads a file without also
  // recording this row, so both halves of "upload media" should be blocked.
  const { data: rowData, error: rowError } = await staff
    .from('order_updates')
    .insert({
      order_id: order.id,
      uploaded_by: order.__staffUserId,
      media_url: path,
      media_type: 'image',
      caption: testTag,
    })
    .select()
  const rowBlocked = writeBlocked(rowData, rowError)
  record(
    '[bonus] Staff CANNOT insert an order_updates row directly',
    rowBlocked,
    rowError ? rowError.message : `rows inserted=${rowData?.length ?? 0}`
  )
}

// ---- 8. A random/wrong share_token returns no order data ----
async function testShareTokenIsolation(realToken, testTag) {
  const fakeToken = '00000000-0000-4000-8000-000000000000'

  async function fetchPage(token) {
    const res = await fetch(`${SITE_URL}/my-dress/${token}`, { signal: AbortSignal.timeout(5000) })
    const html = await res.text()
    return html
  }

  let realHtml, fakeHtml
  try {
    realHtml = await fetchPage(realToken)
    fakeHtml = await fetchPage(fakeToken)
  } catch (err) {
    recordInconclusive(
      '8. A random/wrong share_token returns no order data',
      `Could not reach ${SITE_URL} (${err.message}). Run "npm run dev" in another terminal and re-run this script to exercise this check.`
    )
    return
  }

  const fakeShowsNotFound = fakeHtml.includes("We couldn't find that gown") || fakeHtml.includes('We couldn&#x27;t find that gown')
  const fakeLeaksName = fakeHtml.includes(testTag)
  const realShowsContent = realHtml.includes('Hello,') && !realHtml.includes("We couldn't find that gown")

  const blocked = fakeShowsNotFound && !fakeLeaksName
  record(
    '8. A random/wrong share_token returns no order data',
    blocked,
    !realShowsContent
      ? `INCONCLUSIVE — the real token didn't render order content either (page may not be reachable correctly): got ${realHtml.slice(0, 120)}...`
      : blocked
        ? 'fake token correctly showed the NotFound page; real token correctly showed order content'
        : `GAP: fake token did not show NotFound (leaked content: ${fakeLeaksName})`
  )
}

function printSummary() {
  console.log('\n--- Summary ---')
  for (const r of results) {
    const label = r.ok === null ? 'SKIP' : r.ok ? 'PASS' : 'FAIL'
    console.log(`${label}  ${r.name}`)
  }
  const fails = results.filter((r) => r.ok === false)
  console.log(fails.length ? `\n${fails.length} check(s) FAILED — see above.` : '\nAll checks PASSED (or were skipped/inconclusive).')
}

async function main() {
  const staffEmail = process.env.STAFF_EMAIL
  const staffPassword = process.env.STAFF_PASSWORD
  const ownerEmail = process.env.OWNER_EMAIL
  const ownerPassword = process.env.OWNER_PASSWORD

  if (!staffEmail || !staffPassword) {
    console.error('Set STAFF_EMAIL and STAFF_PASSWORD (a real staff-role account) and re-run.')
    process.exit(1)
  }
  if (!ownerEmail || !ownerPassword) {
    console.error(
      'Set OWNER_EMAIL and OWNER_PASSWORD too. Unlike the rentals script, every check here needs a real order fixture, which only the owner can create — there is no reduced no-owner mode for orders.'
    )
    process.exit(1)
  }

  const { client: staff, user: staffUser } = await signIn(staffEmail, staffPassword)
  const { data: staffProfile, error: profileError } = await staff
    .from('profiles')
    .select('role, active')
    .eq('id', staffUser.id)
    .single()

  if (profileError || !staffProfile) {
    console.error("Could not read the signed-in user's profile row — aborting.", profileError)
    process.exit(1)
  }
  if (staffProfile.role !== 'staff') {
    console.error(`This account has role='${staffProfile.role}', not 'staff'. Use a real staff login — testing with owner proves nothing.`)
    process.exit(1)
  }
  if (!staffProfile.active) {
    console.error('This staff account is inactive. Use an active staff account.')
    process.exit(1)
  }
  console.log(`Signed in as staff: ${staffEmail} (${staffUser.id})`)

  const { client: owner, user: ownerUser } = await signIn(ownerEmail, ownerPassword)
  const { data: ownerProfile } = await owner.from('profiles').select('role').eq('id', ownerUser.id).single()
  if (ownerProfile?.role !== 'owner') {
    console.error(`OWNER_EMAIL account has role='${ownerProfile?.role}', not 'owner' — aborting.`)
    process.exit(1)
  }
  console.log(`Signed in as owner: ${ownerEmail} — will create one disposable order fixture.\n`)

  const testTag = `ORDERS-VERIFY-TEST-${Date.now()}`
  const order = await createFixtureOrder(owner, testTag)
  order.__staffUserId = staffUser.id
  console.log(`Created fixture order id=${order.id} share_token=${order.share_token} (client_name="${testTag}")\n`)

  await testCannotCreateOrder(staff)
  await testCannotAdvanceStage(staff, order)
  await testCannotCompleteOrder(staff, order)
  await testCannotInsertOrderPaymentDirectly(staff, order, staffUser.id)
  await testOrderPaymentImmutability(staff, owner, order.id)
  await testCannotSmuggleOrderFields(staff, order)
  await testCannotUploadOrderMedia(staff, order, testTag)
  await testShareTokenIsolation(order.share_token, testTag)

  printSummary()

  console.log(
    `\nFixture order (id=${order.id}, client_name="${testTag}") and its auto-created 80% deposit payment are permanent — orders/payments have no delete policy for anyone. If test 1 unexpectedly FAILED, an extra "RLS-HACK-ATTEMPT" order may also exist.`
  )
  console.log(
    `\nReminder: delete this script (scripts/verify-orders-rls.mjs) when you're done with it.`
  )
  console.log(
    `\n-- Cleanup SQL (run in the Supabase SQL Editor — admin role, bypasses RLS) --\n` +
      `delete from order_updates where order_id = '${order.id}' or caption = '${testTag}';\n` +
      `delete from payments where order_id = '${order.id}';\n` +
      `delete from orders where id = '${order.id}' or client_name in ('${testTag}', 'RLS-HACK-ATTEMPT');\n` +
      `-- If test 7 unexpectedly showed a GAP (upload succeeded), also remove the object it created:\n` +
      `-- delete from storage.objects where bucket_id = 'order-media' and name like '${order.id}/RLS-VERIFY-TEST-%';`
  )
}

main().catch((err) => {
  console.error('\nScript aborted:', err.message)
  process.exit(1)
})
