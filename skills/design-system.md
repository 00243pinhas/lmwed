# SKILL: Design System
## Read this before writing any CSS, Tailwind class, or styling decision.

---

## The Brand
LM Weddyli — luxury bridal by Linda Monga, Lubumbashi DRC.
Visual reference: augen.pro — study it before every session.
Tone: editorial, architectural, restrained. Luxury through absence, not excess.

---

## Color Tokens — Use Only These

| Token | Hex | When to use |
|---|---|---|
| `--dark` | `#0C0A08` | Hero backgrounds, dark sections, primary button |
| `--light` | `#F8F4EF` | Primary page background |
| `--surface` | `#F0EBE3` | Alternate light sections, measurement guide, process bg |
| `--ink` | `#1A1612` | All primary text on light backgrounds |
| `--muted` | `#7A7068` | Secondary text, labels, captions, placeholders |
| `--accent` | `#C4B8AC` | Numerals, section markers, subtle highlights — sparingly |
| `--border-dark` | `#2A2420` | Borders and dividers on dark backgrounds |
| `--border-light` | `#DDD8D0` | Borders and dividers on light backgrounds |
| `--white` | `#FFFFFF` | Text and elements on dark backgrounds |

### Absolute Rules
- ❌ No gold, bronze, champagne, or any warm yellow tone
- ❌ No blush, rose, or pastel tones
- ❌ No Tailwind default palette (no indigo, blue, red, green, purple)
- ✅ When in doubt — use `--ink` on light, `--white` on dark

---

## Typography

### Display Font — Cormorant Garamond
Used for: all headlines, pull quotes, dress names, large numbers
```css
font-family: 'Cormorant Garamond', Georgia, serif;
```
| Usage | Size | Weight | Style |
|---|---|---|---|
| Hero headline | 80–100px | 300 | Normal or Italic |
| Page headline | 56–64px | 300 | Normal |
| Section headline | 36–48px | 300 | Normal |
| Sub-headline | 28–32px | 300 | Italic |
| Dress name | 22–28px | 400 | Normal |
| Pull quote | 20–24px | 300 | Italic |
| Step numbers | 80–120px | 300 | Normal |

- Letter-spacing: `0.02em` on large sizes, `0.04em` on smaller
- Line-height: `1.05–1.15` for headlines, `1.45–1.55` for quotes
- Max words per hero line: **5–6 words only**
- Never bold (700). Never medium (500). Only 300 and 400.

### Body Font — Jost
Used for: navigation, labels, body text, buttons, captions
```css
font-family: 'Jost', 'Helvetica Neue', sans-serif;
```
| Usage | Size | Weight | Transform |
|---|---|---|---|
| Body paragraph | 13–14px | 300 | None |
| Navigation links | 11px | 400 | Uppercase |
| Section markers | 10px | 400 | Uppercase |
| Field labels | 9–10px | 400 | Uppercase |
| Captions / meta | 10px | 300 | Uppercase |
| Button text | 11–12px | 400–500 | Uppercase |

- Letter-spacing on uppercase: `0.10–0.16em`
- Line-height on body: `1.75–1.85`
- Never use Jost for display or headlines

---

## Spacing Scale
```
4px   — xs  (tight gaps, icon padding)
8px   — sm  (field internal padding, small gaps)
16px  — md  (component internal spacing)
24px  — lg  (between related elements)
40px  — xl  (between sections on mobile)
64px  — 2xl (between sections on desktop)
80px  — 3xl (section padding mobile)
120px — 4xl (section padding desktop)
160px — 5xl (major section gap desktop)
```

---

## Geometry Rules
- **Border-radius: 0** — everywhere, always, no exceptions
- **Borders: 0.5px hairline only** — never 1px or thicker
- **No box shadows** — depth through background color contrast only
- **No decorative elements** — no florals, icons, patterns, ornaments
- **Images: sharp edges** — never overflow:hidden with border-radius

---

## Section Structure
Every section follows this pattern:
```
[Section marker — top left: "0.1 Label"]
[Headline — Cormorant, large, light weight]
[Body — Jost 300, muted, generous line-height]
[CTA — text link with underline animation]
```

Section marker format: `0.1` / `0.2` / `1.0` / `2.0` / `3.0`
Written in Jost 10px uppercase, color `--accent`, letter-spacing 0.16em
Always top-left of its section. Never centered.

---

## Navigation Pattern
```
01 Collections   02 Process   [LM WEDDYLI — centered serif]   03 About   04 Inquire →
```
- Logo: Cormorant Garamond 16px, letter-spacing 0.08em, color `--ink`
- Links: Jost 10px uppercase, letter-spacing 0.10em, color `--muted`
- Active/hover: color `--ink`, hairline underline
- `Inquire →`: color `--ink`, hairline border `.5px solid --ink`, padding `5px 12px`
- On scroll: nav background becomes `rgba(248,244,239,0.92)`, backdrop-blur

---

## CTA Patterns
Primary CTA (inquiry submit only):
- Background: `--dark`, color: `--white`
- Jost 12px uppercase, letter-spacing 0.14em
- Height: 52px (mobile) / 48px (desktop)
- Full width on mobile
- No border-radius

Secondary CTA (all other CTAs):
- Text link only — no background, no border
- Jost 11px uppercase, letter-spacing 0.10em, color `--ink`
- Hairline underline that animates left to right on hover, 300ms

Tertiary CTA (nav-style):
- Jost 10px uppercase, color `--muted`
- Underline on hover only
