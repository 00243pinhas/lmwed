# SKILL: Components
## Read this before building any UI component.

---

## Rule 1 — Check Before Creating
Always check `components/` before writing a new component.
If something similar exists — extend it with props. Never duplicate.

---

## Component Inventory & Specs

### 1. SectionMarker
```tsx
// Usage: <SectionMarker label="0.1 The Atelier" />
// Renders: "0.1 THE ATELIER" in Jost 10px uppercase, accent color, top-left
type Props = { label: string; light?: boolean }
// light=true: color --accent on dark backgrounds
// light=false (default): color --accent on light backgrounds
```

### 2. Navbar
```tsx
// Fixed top, full-width
// Left: "01 Collections" "02 Process" — Jost 10px uppercase, --muted
// Center: "LM WEDDYLI" — Cormorant 16px, letter-spacing 0.08em
// Right: "03 About" "04 Inquire →" — same style, Inquire has hairline border
// Mobile: logo centered, hamburger right (opens full-screen menu)
// On scroll >20px: background rgba(248,244,239,0.92) + backdrop-blur-sm
// Height: 60px desktop / 56px mobile
```

### 3. Footer
```tsx
// Dark background --dark
// Top row: "LM Weddyli" serif left + tagline "Chaque robe, une histoire." right
// Middle row: nav links (01–04) centered, Jost 9px uppercase, --muted
// Bottom row: social handles + copyright
// All text: --white or --muted (no gold)
```

### 4. LookCard
```tsx
type Props = {
  slug: string
  name: string
  collection: 'Lumière' | 'Harmattan'
  fabric: string
  image: string
  priority?: boolean
}
// Image: 3:4 portrait ratio, next/image, full width of card
// Below image:
//   Collection label: Jost 9px uppercase, --muted, letter-spacing 0.12em
//   Dress name: Cormorant 17px, --ink
// Hover (desktop): image scales 1.03x over 700ms + dress name gets underline
// Entire card links to /collections/[slug]
// No border, no shadow, no background — sits directly on page
```

### 5. ProcessStep
```tsx
type Props = {
  number: string       // "01", "02" etc.
  title: string
  description: string
  eyebrow?: string     // "Week 1 – 2" etc.
  image?: string       // optional editorial image
  imageLeft?: boolean  // alternates on desktop
}
// Number: Cormorant 120px desktop / 80px mobile, weight 300, color #E8E2DA
// Title: Cormorant 32px desktop / 26px mobile
// Description: Jost 300, 13px, --muted, line-height 1.8
// Separated by full-width hairline border --border-light
// Desktop: number left + content right (or image on alternate steps)
// Mobile: number top, content below
```

### 6. TestimonialCard
```tsx
type Props = {
  quote: string
  name: string
  city: string
  year: string
  dress: string
  collection: string
  image?: string  // square portrait, 64×64
  featured?: boolean  // full-width dark version
}
// Standard: portrait (64×64 square) + name + location + dress worn + quote
// Featured: full-bleed dark bg + large centered italic quote
// Portrait: square crop, no border-radius
// Quote: Cormorant italic, 17px standard / 28px featured, --ink
// Attribution: Jost 9px uppercase, --muted
```

### 7. MeasurementCard
```tsx
type Props = { number: string; label: string; instruction: string }
// Number: Cormorant 36px, --accent
// Label: Jost 11px uppercase, letter-spacing 0.1em, --ink
// Instruction: Jost 300, 11px, --muted
// Background: --light, hairline border --border-light
// Grid: 2 cols mobile / 4 cols desktop
```

### 8. InquiryForm
```tsx
// 3-step form — manages its own state
// Step indicator: "01 About You — 02 Your Vision — 03 Your Plans"
//   Active: Cormorant italic 14px + hairline underline
//   Done: Jost 11px + strikethrough, color --accent
//   Upcoming: Jost 11px, color --border-light
// Step transitions: slide out left, slide in from right, 350ms
// All fields: bottom-border only (no box border), 0.5px --border-light
// On focus: border becomes --ink
// Label: Jost 9px uppercase, letter-spacing 0.14em, --muted
// Input text: Cormorant 18px, --ink
// Submit button: full-width, --dark bg, --white text, 52px tall
// On success: form fades out → confirmation screen fades in
```

### 9. StickyInquiryBar (mobile only)
```tsx
// Fixed bottom, 64px tall, --dark background
// Left: dress name + collection (if on detail page) or "LM Weddyli"
// Right: "Inquire →" in Jost 11px uppercase, --white
// Top border: 0.5px --border-dark
// Shows after 40% scroll depth
// Hides when main CTA button is in viewport
// md:hidden — never shows on desktop
```

### 10. HeroSection
```tsx
type Props = {
  eyebrow?: string
  headline: string     // rendered word-by-word
  subline?: string
  ctaText?: string
  ctaHref?: string
  mediaSrc: string
  mediaType: 'image' | 'video'
  height?: 'full' | 'half'  // full = 100vh, half = 50vh
}
// Dark overlay: gradient bottom to transparent
// Text: bottom-left positioned, z-index above overlay
// Scroll indicator: bottom-right, thin vertical line + "Scroll" rotated
// Parallax on media: 20% slower than scroll
```

---

## Shared Patterns

### Image Overlay (all hero/dark images)
```tsx
<div className="relative overflow-hidden">
  <Image src={src} ... />
  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A08]/90 via-[#0C0A08]/20 to-transparent" />
</div>
```

### Full-Bleed Section
```tsx
// Dark section
<section className="bg-[#0C0A08] px-6 py-20 md:px-20 md:py-40">

// Light section
<section className="bg-[#F8F4EF] px-6 py-16 md:px-20 md:py-32">

// Surface section
<section className="bg-[#F0EBE3] px-6 py-16 md:px-20 md:py-32">
```

### Hairline Divider
```tsx
<div className="w-full border-t border-[#DDD8D0]" style={{ borderWidth: '0.5px' }} />
// On dark: border-[#2A2420]
```
