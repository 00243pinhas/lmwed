# SKILL: Forms
## Read this before building the inquiry form or any input component.

---

## The Inquiry Form — Business Context
This form qualifies leads for Linda Monga before she spends time responding.
It must feel like an invitation, not a questionnaire.
Every label sounds like Linda speaking — warm, direct, personal.

---

## Field Styling Rules
- **No box border** — only a single 0.5px bottom border
- Default border color: `#DDD8D0` (--border-light)
- Focus border color: `#1A1612` (--ink) — CSS transition 200ms
- Label: Jost 9px uppercase, letter-spacing 0.14em, color #7A7068 (--muted)
- Input text: Cormorant Garamond 18px, weight 400, color #1A1612 (--ink)
- Placeholder: same size, color #C4B8AC (--accent)
- Input height: minimum 48px (touch target)
- Font-size on inputs: minimum 16px to prevent iOS zoom
- No border-radius anywhere

```css
.field-input {
  width: 100%;
  border: none;
  border-bottom: 0.5px solid #DDD8D0;
  background: transparent;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  color: #1A1612;
  padding: 10px 0;
  outline: none;
  transition: border-color 200ms ease;
}
.field-input:focus { border-bottom-color: #1A1612; }
.field-input::placeholder { color: #C4B8AC; }
```

---

## Option Row Fields (no dropdowns ever)
Used for: service type, silhouette, budget range, how they found us
```tsx
// Display as text options in a row
// Unselected: Jost 11px uppercase, color --muted, bottom border --border-light
// Selected: color --ink, bottom border 1px solid --ink
// On mobile: wrap to 2 columns if 4+ options
// No dropdown select elements — always visible options
```

---

## Step Indicator
```
01 About You  ——  02 Your Vision  ——  03 Your Plans
```
- Active step: Cormorant italic 14px, --ink, hairline underline
- Completed: Jost 11px, --accent, strikethrough animates in
- Upcoming: Jost 11px, --border-light
- Connecting line: hairline --border-light, 40px wide
- Never collapse to dots or a progress bar

---

## Form Steps Content

### Step 01 — About You
| Field | Type | Required | Placeholder |
|---|---|---|---|
| Your first name | text | Yes | Linda, Marie, Amara... |
| Your city | text | Yes | Lubumbashi, Kinshasa... |
| WhatsApp number | tel | Yes | +243 ... |
| Email | email | No (labeled Optional) | Optional — WhatsApp is enough |

Note below WhatsApp: *"Linda will reach out here within 24 hours."*

### Step 02 — Your Vision
| Field | Type | Required |
|---|---|---|
| What are you looking for? | Option row: Custom Gown / Rental / Not sure yet | Yes |
| Silhouette | Option row: A-Line / Ball Gown / Mermaid / Slip / Not sure | No |
| Describe your dream dress | Textarea 5 rows | Yes |
| Inspiration link | url input | No |

### Step 03 — Your Plans (qualification fields)
| Field | Type | Required |
|---|---|---|
| Wedding month | text | Yes |
| Wedding year | text | Yes |
| Wedding city/country | text | Yes |
| Budget range | Option row: Under $500 / $500–$1,200 / $1,200–$2,500 / $2,500+ | Yes |
| How did you find us? | Option row: Instagram / TikTok / A friend / Other | Yes |

---

## Submit Button
```
Text: "Send My Inquiry" — never "Submit"
Background: #0C0A08 (--dark)
Color: #FFFFFF
Font: Jost 13px uppercase, letter-spacing 0.14em
Height: 56px — tallest button on the site
Width: 100% on mobile
Hover: background lightens to #2A2420, transition 200ms
```

Below the button:
- Line 1: Jost 10px uppercase, --accent: `Linda responds within 24 hours via WhatsApp`
- Line 2: Jost 10px, --muted: `Your information is private and never shared`

---

## Step Transitions
```tsx
// Slide out left, slide in from right
enter:  { x: 40, opacity: 0 }
center: { x: 0,  opacity: 1 }
exit:   { x: -40, opacity: 0 }
// duration: 350ms, ease: [0.16, 1, 0.3, 1]
```

---

## Error States
- Bottom border: thin warm red (no specific hex — use Tailwind red-700)
- Error message below field: Jost 10px, same red
- No shaking, no flashing — just quiet color change
- Never show all errors at once — only the first unfilled required field

---

## Validation Rules
- Step 01: name + city + WhatsApp required before advancing
- Step 02: service type + dress description required before advancing
- Step 03: wedding date + budget + how-they-found-us required before submitting
- Email: optional on Step 01 — never block submission for missing email

---

## Qualification Logic (internal — bride never sees this)
Tag submissions automatically based on:
| Signal | Tag |
|---|---|
| Budget: Under $500 | 🔴 low-budget |
| Wedding date < 8 weeks | 🔴 rush |
| Budget: $1,200+ | 🟢 high-fit |
| Wedding date 10+ weeks | 🟢 feasible |
| Location: DRC or diaspora | 🟢 core-market |

These tags go into the submission email subject line for Linda's triage.

---

## Confirmation Screen
Replaces form in-place after submission. Same page, no redirect.
```
Transition: form fades out 300ms → confirmation fades in 500ms

Content (centered, max-width 480px):
  ✓ Received — Jost 10px uppercase, --accent
  "Thank you, [Name]." — Cormorant italic 44px, --ink (name from Step 01)
  Body: "Linda has received your inquiry and will review it personally..."
  WhatsApp link (direct link to Linda's number)
  Navigation: "← View the collection" · "Read love notes →"
```

---

## Desktop Trust Sidebar
On desktop only — right column 40% width, static throughout all 3 steps:
- Hairline left border --border-light
- Section marker: "Why LM Weddyli"
- 3 trust points in Jost 300, 13px, --muted
- 1 mini testimonial: Cormorant italic 16px + Jost attribution
- Never moves or changes as steps advance
