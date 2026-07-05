// TEMPORARY VERIFICATION SCRIPT — delete after use.
//
// Verifies the RLS grant added in migration 005 ("staff completes rentals")
// doesn't give staff more than the exact deposit_paid -> completed
// transition, and that the pre-existing append-only policies (no delete on
// rentals/payments, no staff read on inquiries) still hold.
//
// Requires env vars:
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY   (already in .env.local)
//   STAFF_EMAIL, STAFF_PASSWORD                                a real staff-role login
//   OWNER_EMAIL, OWNER_PASSWORD                                optional — see below
//
// Run:
//   STAFF_EMAIL=you@example.com STAFF_PASSWORD=... \
//   OWNER_EMAIL=linda@example.com OWNER_PASSWORD=... \
//     node --env-file=.env.local scripts/verify-staff-rls.mjs
//
// Why OWNER credentials matter: tests 1-4 need a rental to act on. Without
// an owner session this script cannot safely create disposable fixtures (only
// the owner can insert a dress), so it would have to point staff's mutation
// attempts at a REAL rental/payment — risky if an RLS hole actually lets the
// write through, since rentals/payments have NO delete policy for anyone,
// even the owner. With owner creds, this script creates its own
// throwaway dress + rental fixtures (name/client_name prefixed
// "RLS-VERIFY-TEST-<timestamp>") and runs every mutation attempt against
// those instead. Without owner creds, only test 5 (read-only) runs.
//
// WARNING — fixtures are permanent: rentals and payments cannot be deleted
// by anyone through the app (by design — see skills/backend-data-model.md).
// The disposable dress/rental/payment rows this script creates will remain
// in the database. If you want them gone, use the Supabase SQL Editor
// (runs as a superuser, bypasses RLS) after this script has run:
//
//   delete from payments where rental_id in
//     (select id from rentals where client_name like 'RLS-VERIFY-TEST%');
//   delete from rentals where client_name like 'RLS-VERIFY-TEST%';
//   delete from dresses where name like 'RLS-VERIFY-TEST%';
//
// This script makes no policy changes — verification only.

import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  process.exit(1)
}

const results = []
function record(name, ok, detail) {
  results.push({ name, ok })
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`)
}

// A write is "blocked" by RLS in one of two ways: the row never matches
// USING (silently 0 rows affected, no error), or the row matches USING but
// the resulting row fails WITH CHECK (Postgres raises "new row violates
// row-level security policy"). Both mean the write did not go through.
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

async function createFixtures(owner, testTag) {
  const today = new Date().toISOString().slice(0, 10)
  const due = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  async function makeDress(suffix) {
    const { data, error } = await owner
      .from('dresses')
      .insert({ name: `${testTag}-DRESS-${suffix}`, rental_price: 100 })
      .select()
      .single()
    if (error) throw new Error(`Owner could not create fixture dress: ${error.message}`)
    return data
  }

  async function makeRental(dress) {
    const { data, error } = await owner.rpc('log_rental', {
      p_dress_id: dress.id,
      p_client_name: testTag,
      p_client_phone: '0000000000',
      p_out_date: today,
      p_due_date: due,
      p_method: 'cash',
    })
    if (error) throw new Error(`Owner could not create fixture rental: ${error.message}`)
    return data
  }

  return {
    rentalToComplete: await makeRental(await makeDress('COMPLETE')),
    rentalToEditOnly: await makeRental(await makeDress('EDITONLY')),
    rentalToSmuggle: await makeRental(await makeDress('SMUGGLE')),
  }
}

async function testStaffCompletesReturn(staff, rental) {
  const { data, error } = await staff.rpc('complete_rental', {
    p_rental_id: rental.id,
    p_method: 'cash',
  })
  const ok = !error && data?.state === 'completed'
  record(
    '1. Staff CAN complete a return (deposit_paid -> completed)',
    ok,
    error ? error.message : `resulting state=${data?.state}`
  )
}

async function testStaffCannotDeleteRental(staff, rentalId) {
  const { data, error } = await staff.from('rentals').delete().eq('id', rentalId).select()
  const blocked = writeBlocked(data, error)
  record(
    '2. Staff CANNOT delete a rental row',
    blocked,
    error ? error.message : `rows deleted=${data?.length ?? 0}`
  )
}

async function testStaffCannotEditRentalFields(staff, rental) {
  const { data, error } = await staff
    .from('rentals')
    .update({ client_name: 'RLS-HACK-ATTEMPT' })
    .eq('id', rental.id)
    .select()
  const blocked = writeBlocked(data, error)
  record(
    "3a. Staff CANNOT edit a rental's other fields (client_name) without completing it",
    blocked,
    error ? error.message : `rows updated=${data?.length ?? 0}`
  )
}

async function testStaffCannotRevertCompleted(staff, completedRentalId) {
  const { data, error } = await staff
    .from('rentals')
    .update({ state: 'deposit_paid' })
    .eq('id', completedRentalId)
    .select()
  const blocked = writeBlocked(data, error)
  record(
    '3b. Staff CANNOT flip a completed rental back to deposit_paid',
    blocked,
    error ? error.message : `rows updated=${data?.length ?? 0}`
  )
}

async function testSmuggledFieldChange(staff, rental) {
  const { data, error } = await staff
    .from('rentals')
    .update({ client_name: 'RLS-HACK-ATTEMPT', state: 'completed' })
    .eq('id', rental.id)
    .select()
  const smuggled = !error && (data?.length ?? 0) > 0
  record(
    '[bonus, not one of your 5] Staff cannot smuggle other field edits into a legit deposit_paid->completed update',
    !smuggled,
    smuggled
      ? `GAP: client_name changed to "${data[0].client_name}" while transitioning state — the "staff completes rentals" policy's WITH CHECK only constrains the resulting state column, not other columns. This only matters if staff bypass complete_rental() and call the table directly (e.g. via curl with their session), since the app's own route only ever sets state.`
      : error
        ? error.message
        : 'blocked'
  )
}

async function testPaymentImmutability(staff, owner, rentalId) {
  const { data: payments, error: readError } = await owner
    .from('payments')
    .select('id')
    .eq('rental_id', rentalId)
    .limit(1)

  if (readError || !payments?.length) {
    record(
      '4. Staff CANNOT delete or update a payment row',
      false,
      `Could not find a fixture payment to target: ${readError?.message ?? 'none found'}`
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
    '4. Staff CANNOT delete or update a payment row',
    deleteBlocked && updateBlocked,
    `delete ${deleteBlocked ? 'blocked' : 'SUCCEEDED (hole!)'}, update ${updateBlocked ? 'blocked' : 'SUCCEEDED (hole!)'}`
  )
}

async function testInquiries(staff, owner, testTag) {
  let seeded = false
  if (owner) {
    const { count } = await owner.from('inquiries').select('id', { count: 'exact', head: true })
    if (!count) {
      const { error } = await owner.from('inquiries').insert({
        first_name: testTag,
        city: 'Test',
        whatsapp: '0000000000',
        budget_range: 'under_500',
      })
      if (error) console.warn('Could not seed a disposable inquiry row:', error.message)
      else seeded = true
    }
  }

  const { data, error } = await staff.from('inquiries').select('*').limit(1)
  const blocked = !error && (data?.length ?? 0) === 0
  const caveat = owner
    ? seeded
      ? ' (a disposable inquiry row was seeded to make this conclusive)'
      : ''
    : ' — INCONCLUSIVE if the table happens to be empty; no OWNER creds to guarantee a row exists'
  record(
    '5. Staff CANNOT read the inquiries table',
    blocked,
    (error ? error.message : `rows visible=${data?.length ?? 0}`) + caveat
  )
}

function printSummary() {
  console.log('\n--- Summary ---')
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`)
  const fails = results.filter((r) => !r.ok)
  console.log(fails.length ? `\n${fails.length} check(s) FAILED — see above.` : '\nAll checks PASSED.')
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
  console.log(`Signed in as staff: ${staffEmail} (${staffUser.id})\n`)

  let owner = null
  if (ownerEmail && ownerPassword) {
    const { client, user } = await signIn(ownerEmail, ownerPassword)
    const { data: ownerProfile } = await client.from('profiles').select('role').eq('id', user.id).single()
    if (ownerProfile?.role !== 'owner') {
      console.error(`OWNER_EMAIL account has role='${ownerProfile?.role}', not 'owner' — ignoring it.`)
    } else {
      owner = client
      console.log(`Signed in as owner: ${ownerEmail} — will create disposable test fixtures.\n`)
    }
  } else {
    console.log(
      'No OWNER_EMAIL/OWNER_PASSWORD provided — skipping tests 1-4 (they need disposable fixtures to avoid risking real client data). Only test 5 will run.\n'
    )
  }

  const testTag = `RLS-VERIFY-TEST-${Date.now()}`

  await testInquiries(staff, owner, testTag)

  if (!owner) {
    printSummary()
    return
  }

  const fixtures = await createFixtures(owner, testTag)

  await testStaffCompletesReturn(staff, fixtures.rentalToComplete)
  await testStaffCannotDeleteRental(staff, fixtures.rentalToComplete.id)
  await testStaffCannotEditRentalFields(staff, fixtures.rentalToEditOnly)
  await testStaffCannotRevertCompleted(staff, fixtures.rentalToComplete.id)
  await testSmuggledFieldChange(staff, fixtures.rentalToSmuggle)
  await testPaymentImmutability(staff, owner, fixtures.rentalToComplete.id)

  printSummary()

  console.log(
    `\nFixtures tagged "${testTag}" are permanent (no delete policy on rentals/payments/dresses). See this script's header comment for cleanup SQL to run manually in the Supabase SQL Editor if you want them gone.`
  )
}

main().catch((err) => {
  console.error('\nScript aborted:', err.message)
  process.exit(1)
})
