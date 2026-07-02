# CLAUDE.md — LM Weddyli Frontend

## Project Context
- **Brand:** LM Weddyli — luxury bridal by Linda Monga, Lubumbashi DRC, production Istanbul
- **Phase:** Frontend only. No backend. No API integrations. No auth. Dummy data throughout.
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (installed, not CDN)
- **Animation:** Framer Motion
- **Hosting:** Vercel

---

## Always Do First
- Read `brand_assets/` before writing any code. Use real assets if present — never placeholder where real assets exist.
- Read the relevant page spec from `workflows/pages/` before building any page.
- Check `components/` before creating anything new — reuse what exists.

---

## Skills Library — Read Before Every Task
Before writing any code, read the relevant skill file from `skills/`.
Never rely on general knowledge when a skill exists for the topic.

| Task | Read this skill first |
|---|---|
| Any styling, color, font, or spacing decision | `skills/design-system.md` |
| Any animation, transition, or motion | `skills/animation.md` |
| Building or modifying a component | `skills/components.md` |
| Any mobile layout or touch behavior | `skills/mobile.md` |
| The inquiry form or any input field | `skills/forms.md` |
| Any image, placeholder, or photography | `skills/images.md` |
| Creating or using data files | `skills/dummy-data.md` |
| Any design or layout question | `skills/augen-pro.md` |

If a task touches multiple areas, read all relevant skills first.
Example: building LookCard requires `components.md` + `images.md` + `animation.md` + `mobile.md`.
Full index in `skills/README.md`.

## Design System — Non-Negotiable

### Colors — use only these, no exceptions
```
--dark:      #0C0A08   /* hero backgrounds, dark sections */
--light:     #F8F4EF   /* primary page background */
--surface:   #F0EBE3   /* alternate light sections */
--ink:       #1A1612   /* primary text on light */
--muted:     #7A7068   /* secondary text, labels */
--accent:    #C4B8AC   /* subtle accent, numbers, accents — use sparingly */
--border-d:  #2A2420   /* borders on dark backgrounds */
--border-l:  #DDD8D0   /* borders on light backgrounds */
--white:     #FFFFFF   /* text on dark backgrounds */
```
**No gold. No blush. No Tailwind default palette (no indigo, blue, red, green).**

### Typography
```
Display:  Cormorant Garamond — weights 300, 400, italic
          Sizes: 100px / 64px / 48px / 36px / 28px / 22px
          Letter-spacing: 0.02em on large sizes
          Max words per hero line: 5–6

Body/UI:  Jost — weights 300, 400, 500
          Body: 14px / line-height 1.8 / weight 300
          Labels: 10px / uppercase / letter-spacing 0.14em / weight 400
          Nav: 11px / uppercase / letter-spacing 0.1em / weight 400
```

### Spacing Tokens
```
xs:   4px
sm:   8px
md:   16px
lg:   24px
xl:   40px
2xl:  64px
3xl:  80px
4xl:  120px
section-gap: 160px (desktop) / 80px (mobile)
```

### Geometry
- **No border-radius anywhere** — not on buttons, cards, inputs, images
- **No box shadows** — depth through color and layering only
- **All borders:** 0.5px hairline only — never thicker
- **No decorative elements** — no florals, patterns, ornaments, icons

---

## Visual Reference: augen.pro
Before building any section, ask: does this look like it belongs on augen.pro adapted for bridal?
- Numbered navigation: `01 Collections · 02 Process · 03 About · 04 Inquire →`
- Oversized serif headlines — large, light weight, generous space
- Section markers: `0.1 / 0.2 / 1.0 / 2.0` — Jost 10px uppercase, top-left of every section
- Full-bleed dark photography alternating with clean light sections
- Text CTAs with hairline underline animation — never heavy buttons (except the primary inquiry submit)
- Extreme negative space — if it feels too empty, it is probably right

---

## File Structure
```
app/
├── (marketing)/
│   ├── layout.tsx          ← shared nav + footer
│   ├── page.tsx            ← homepage
│   ├── collections/
│   │   ├── page.tsx        ← collections grid
│   │   └── [slug]/
│   │       └── page.tsx    ← single dress detail
│   ├── process/page.tsx
│   ├── about/page.tsx
│   ├── love-notes/page.tsx
│   ├── inquire/page.tsx
│   └── rentals/page.tsx
├── components/
│   ├── ui/                 ← LookCard, TestimonialCard, ProcessStep, etc.
│   ├── forms/              ← InquiryForm, FormStep, ProgressIndicator
│   └── layout/             ← Navbar, Footer, StickyInquiryBar
├── data/
│   └── dummy/              ← collections.ts, testimonials.ts, rentals.ts
├── lib/
│   └── hooks/              ← useMousePosition, useScrollProgress
├── public/
│   └── brand_assets/       ← logo, photography (when available)
└── styles/
    └── globals.css         ← Tailwind base + custom CSS vars
```

---

## Component Rules

### Before creating any component:
1. Check `components/` — does it already exist?
2. Check if an existing component can accept a prop variation instead
3. Only create new components when nothing reusable exists

### Every component must have:
- Mobile-first responsive behavior (390px base, 1440px desktop)
- `prefers-reduced-motion` check wrapping all Framer Motion animations
- Proper TypeScript types — no `any`
- A named export (not default export) for tree-shaking

### Reusable components to build first (in this order):
1. `Navbar` — numbered links, centered logo, mobile hamburger
2. `Footer` — logo, links, social handles, copyright
3. `LookCard` — dress image + collection label + name, hover state
4. `SectionMarker` — the `0.1 Label` pattern, reused on every section
5. `ProcessStep` — oversized numeral + title + description
6. `TestimonialCard` — portrait + quote + attribution
7. `InquiryForm` — 3-step form with step indicator
8. `StickyInquiryBar` — mobile only, fixed bottom

---

## Animation Rules
- Animate only `transform` and `opacity` — never layout properties
- Never use `transition-all`
- Standard easing: `cubic-bezier(0.16, 1, 0.3, 1)` — use this everywhere
- Reveal duration: 700ms
- UI transitions: 300ms
- Stagger between list items: 80ms
- Hero text: word-by-word stagger, 80ms between words
- Parallax: images scroll at 80% of page scroll speed (20% slower)
- All animations: `once: true` in whileInView — do not replay on scroll back

```tsx
// Standard reveal — use this pattern for every section entry
const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
}
```

---

## Image Rules
- All images: `next/image` with explicit `width` and `height` — no CLS
- Above-fold images: `priority` prop
- All others: lazy loaded (default)
- Placeholder: `placeholder="blur"` with dominant color base64
- Aspect ratio: dress photography always 3:4 portrait
- Hero images: always have a dark gradient overlay
  ```tsx
  // Standard hero overlay
  className="absolute inset-0 bg-gradient-to-t from-[#0C0A08]/90 via-[#0C0A08]/20 to-transparent"
  ```
- Placeholder images (before real photography): `https://placehold.co/WIDTHxHEIGHT/1a1612/f8f4ef`

---

## Dummy Data Rules
- All dummy data lives in `data/dummy/` as typed TypeScript exports
- Zero hardcoded content in page or component files — always imported from data
- Define types in `types/` before writing data files

```ts
// types/look.ts
export type Look = {
  slug: string
  name: string
  collection: 'Lumière' | 'Harmattan'
  fabric: string[]
  silhouette: string
  description: string
  productionWeeks: string
  startingPrice: number
  images: string[]
}
```

---

## Local Development
```bash
npm run dev          # starts Next.js at http://localhost:3000
npm run build        # production build — run before any deployment
npm run lint         # must pass before considering any page done
```
Never screenshot a `file:///` URL. Always verify from `http://localhost:3000`.

---

## Screenshot & Review Workflow
After building each page or component:
1. Run `npm run dev`
2. Open `http://localhost:3000/[page-route]`
3. Screenshot mobile (390px viewport) first
4. Screenshot desktop (1440px viewport)
5. Compare against the Claude Design mockup for that page
6. Fix every visible discrepancy — spacing, font size, color, alignment
7. Minimum 2 comparison rounds before marking a page complete
8. When comparing, be specific: "heading is 40px but mockup shows 48px", "section gap is 80px but should be 160px"

---

## Mobile-First Rules
- Build 390px first, always
- Desktop styles added via `md:` and `lg:` Tailwind prefixes
- Minimum touch target: 44px × 44px on all interactive elements
- Sticky inquiry bar: mobile only (`md:hidden`), fixed bottom, 64px tall
- No horizontal overflow on any mobile page
- Test every page with thumb reach in mind — primary CTAs bottom of screen

---

## Hard Rules — Never Break These
- ❌ No gold, bronze, or champagne tones anywhere
- ❌ No border-radius on any element
- ❌ No `transition-all`
- ❌ No hardcoded content in components — always from data files
- ❌ No backend code, API routes, or database calls in this phase
- ❌ No default Tailwind palette colors (indigo, blue, red, green, etc.)
- ❌ Do not add features not in the page spec
- ❌ Do not "improve" the Claude Design mockup — reproduce it exactly
- ✅ Every page must pass `npm run lint` before it is considered done
- ✅ Every page must be tested at 390px AND 1440px
- ✅ Every interactive element must have hover, focus-visible, and active states

---

## Page Build Order
Build in this sequence — the inquiry form is the most valuable page:
```
1. Design system setup (globals.css, tailwind.config, fonts)
2. Navbar + Footer (shared layout)
3. /inquire (inquiry form — most important conversion page)
4. / (homepage)
5. /collections (grid)
6. /collections/[slug] (single dress detail)
7. /process
8. /about
9. /love-notes
10. /rentals
```

---

## Brand Assets (check before every session)
```
public/brand_assets/
├── logo/          ← LM Weddyli logo files (SVG preferred)
├── photography/   ← Real dress photography when Linda provides it
└── palette.md     ← Color confirmation from Linda
```
If `brand_assets/` is empty: use placeholder images and the design system colors defined above.
When real assets arrive: swap placeholders — zero component changes required.

---

## Definition of Done (per page)
A page is complete when:
- [ ] Matches Claude Design mockup at 390px
- [ ] Matches Claude Design mockup at 1440px
- [ ] All animations implemented and gated behind prefers-reduced-motion
- [ ] All dummy data imported from `data/dummy/` — no hardcoded strings
- [ ] Passes `npm run lint` with zero errors
- [ ] No horizontal scroll on mobile
- [ ] All interactive elements have hover + focus states
- [ ] No gold, no border-radius, no transition-all anywhere on the page
