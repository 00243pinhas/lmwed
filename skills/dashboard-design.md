# SKILL: Dashboard Design
## Read this before building any /dashboard page or admin component.
## The dashboard is a TOOL, not a showcase. Different rules from the marketing site.

---

## Core principle
Linda checks this on a tablet, often quickly, often to answer one question:
"Where are my dresses? Who owes me money? What came in today?"
Every screen must answer its question in under 2 seconds. Clarity beats beauty.
Function over feeling. No cinematic animation, no heavy serif display, no hero images.

---

## What carries over from the marketing brand
- Same color tokens (so it still feels like LM Weddyli), but used flatter and calmer:
```
--dark:      #0C0A08   /* sidebar, top bar, primary buttons */
--light:     #F8F4EF   /* page background */
--surface:   #FFFFFF   /* cards, table backgrounds — use white here for clarity */
--ink:       #1A1612   /* primary text */
--muted:     #7A7068   /* secondary text, labels */
--accent:    #C4B8AC   /* subtle accents only */
--border:    #E0D8CC   /* borders, table rules */
```
- Status colors (NEW for dashboard — the marketing site had none):
```
--ok:      #2E6E44   /* available, paid, completed — calm green */
--ok-bg:   #E4F2EA
--warn:    #B8860B   /* pending, due soon — amber (this is the ONE place amber is allowed) */
--warn-bg: #F5EFE0
--alert:   #A03028   /* overdue, red flags, unpaid — muted red */
--alert-bg:#F5E8E4
```

## What CHANGES from the marketing site
- **Typography:** Inter or system sans for everything. NO Cormorant Garamond in the dashboard. Data needs a clean sans, not a display serif.
  - Numbers/data: tabular, medium weight, clear sizes (14–16px body, 24–32px for key figures)
  - Labels: 11px uppercase, muted, letter-spacing 0.06em
- **Border radius:** SMALL radius allowed here (4–6px) — softer, friendlier for a tool. (Marketing site was sharp 0px; dashboard can be gentle.)
- **Shadows:** subtle, allowed — cards can lift slightly for scannability.
- **Animation:** minimal and instant. No reveal-on-scroll, no parallax. Transitions only for feedback (button press, row hover, modal open) — 150ms max.
- **Density:** compact. Show more per screen. Linda wants to see her whole rental list at once, not scroll through cinematic spacing.

---

## Layout
- **Tablet-first** (Linda's primary device), works on phone, scales to desktop.
- Persistent left sidebar (collapses to bottom bar or hamburger on phone):
  - LM Weddyli wordmark (small, top)
  - Nav: Overview · Rentals · Dresses · Orders · Inquiries · Staff
  - Inquiries, Orders, Staff, financials = owner-only (hidden for staff role)
  - Logout at the bottom
- Top bar: current section title + "Logged in as [name] · [role]"
- Main area: cards and tables on --light background.

---

## Components & patterns

### Stat cards (the overview "at a glance" row)
```
[ 3 dresses out ]  [ $400 pending ]  [ 2 inquiries today ]  [ 1 overdue ⚠ ]
```
- Big number (Inter 28px semibold), small label below (11px uppercase muted)
- White card, subtle border, small radius, tiny shadow
- Overdue/alert cards get --alert-bg background to jump out

### Tables (the core of the dashboard)
- White background, hairline row separators (--border)
- Header row: 11px uppercase muted labels
- Rows: 14px, comfortable height (48px min — tablet tap targets)
- Status shown as a pill: colored text on tinted bg (--ok-bg / --warn-bg / --alert-bg)
- Row hover: very light background tint
- Primary action per row as a clear button or tap target
- On phone: tables collapse to stacked cards (each row becomes a card)

### Status pills
```
Available → green pill    Rented → neutral/dark pill
Overdue → red pill        Paid → green    Pending 20% → amber pill
```
Always text + color, never color alone (accessibility + clarity).

### Buttons
- Primary: --dark bg, white text, 6px radius, clear label ("Log Rental", "Record Return")
- Secondary: bordered, --ink text
- Destructive actions: essentially none — remember the append-only rule. No delete buttons on rentals/payments. Corrections are new entries.
- Min height 44px (tablet touch)

### Forms (log rental, record payment, add staff)
- Clean stacked fields, clear labels above
- Bigger tap targets than the marketing form (this is data entry, speed matters)
- Dropdowns ARE fine here (unlike the marketing form) — staff picking a dress from 10 is faster with a select
- Inline validation, clear success confirmation

### Empty states
- Every list has a friendly empty state: "No rentals yet. Log the first one →"
- Never a blank screen.

---

## Role-aware UI
- Staff see ONLY: Rentals, Dresses (and only the actions they're allowed — log rental, record return/payment, update dress status).
- Staff NEVER see: Inquiries, Orders, Staff management, financial totals/income.
- Owner sees everything.
- BUT: hiding in the UI is not security. Every owner-only route is ALSO enforced server-side (see backend-auth.md). The UI hiding is for clarity; the server check is for safety.

---

## Hard rules
- ❌ No Cormorant Garamond / display serif in the dashboard — clean sans only.
- ❌ No scroll animations, parallax, or cinematic spacing — this is a tool.
- ❌ No delete buttons on rentals or payments (append-only ledger).
- ❌ No color-only status indicators — always text + color.
- ❌ Never show staff the owner-only sections.
- ✅ Tablet-first, compact, scannable, fast.
- ✅ Every screen answers its main question in under 2 seconds.
- ✅ Status pills everywhere status matters (dresses, rentals, payments).
- ✅ Small radius + subtle shadow OK here (unlike the sharp marketing site).
