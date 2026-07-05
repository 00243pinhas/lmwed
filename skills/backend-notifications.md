# SKILL: Backend Notifications
## Read this before sending any email or alert to Linda.
## Phase 2 is EMAIL-FIRST. WhatsApp is a documented later step, not built now.

---

## Current scope
- ✅ Email to Linda when a new inquiry arrives — via Resend.
- ⏳ WhatsApp alert — NOT built in Phase 2. Documented at the bottom for later.

Build email now. It proves the pipeline works and gives Linda immediate value.

---

## Resend setup
- Library: `resend`
- Key: `RESEND_API_KEY` in `.env.local` (server-only, gitignored)
- Sender: during development, use Resend's test sender. For production, Linda's
  domain must be verified in Resend (a later step — note it, don't block on it).
- Recipient: Linda's email — store as `LINDA_EMAIL` in `.env.local` (not hardcoded).

---

## Where email is sent
Inside the inquiry route, AFTER the inquiry is successfully saved to the database.
Order matters: save first, then email. If the email fails, the inquiry is still
recorded — never lose a lead because an email bounced.

```ts
// app/api/inquire/route.ts — after successful insert
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

// build the qualification tag (see below), then:
try {
  await resend.emails.send({
    from: 'LM Weddyli <onboarding@resend.dev>',   // test sender in dev
    to: process.env.LINDA_EMAIL!,
    subject: `${tag} New inquiry — ${firstName}, ${weddingCity}`,
    text: emailBody,
  })
} catch (mailErr) {
  console.error('Inquiry saved but email failed', mailErr)
  // do NOT fail the request — the inquiry is safely stored
}
```

---

## The qualification tag (Linda's triage at a glance)
Compute a tag from the inquiry data and put it in the subject line so Linda can
triage from her inbox without opening anything.

```ts
function qualificationTag(budget: string, weddingYear: string, weddingMonth: string): string {
  const highBudget = budget === '1200_2500' || budget === '2500_plus'
  const lowBudget  = budget === 'under_500'
  // rough timeline check — weeks until wedding
  const rush = isWithinWeeks(weddingMonth, weddingYear, 8)

  if (lowBudget) return '🔴 LOW-BUDGET'
  if (rush)      return '🔴 RUSH'
  if (highBudget) return '🟢 HIGH-FIT'
  return '🟡 REVIEW'
}
```
Tags: 🟢 HIGH-FIT (good budget, feasible timeline) · 🔴 RUSH (wedding <8 weeks) ·
🔴 LOW-BUDGET (under $500) · 🟡 REVIEW (everything else).

---

## The email body
Plain, complete, scannable. Include everything Linda needs to decide and reply:
```
New inquiry from the website

Name:        {firstName}
City:        {city}
WhatsApp:    {whatsapp}      ← so she can reply in one tap
Email:       {email or "—"}

Service:     {custom / rental / not sure}
Silhouette:  {silhouette or "—"}
Vision:      {dress_description}
Inspiration: {inspiration_link or "—"}

Wedding:     {month} {year}, {weddingCity}
Budget:      {budget_range, human-readable}
Found us:    {found_us}

Tag:         {qualification tag}
```
Human-readable budget: map 'under_500' → "Under $500", etc. Never show raw enum values.

---

## Rules
- Save to database BEFORE sending email. Never lose an inquiry to a mail failure.
- Email failure must NOT fail the API response — log it, move on.
- Recipient and keys come from env, never hardcoded.
- Keep the email plain text for Phase 2 (reliable, simple). HTML templates later.
- Never include secrets or internal IDs the recipient doesn't need.

---

## LATER (not now) — WhatsApp alert
When Linda wants instant phone alerts, the options are:
- WhatsApp Business API (official, most reliable, requires business verification &
  a provider like Twilio or Meta Cloud API) — the proper long-term path.
- A lighter transactional provider as an interim.
Decision deferred. When built, it runs in the same place as the email — after the
inquiry is saved — as an additional notification, not a replacement. Document the
chosen provider here when the time comes.
