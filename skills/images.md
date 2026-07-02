# SKILL: Images
## Read this before using any image, placeholder, or photography.

---

## Always Use next/image
```tsx
import Image from 'next/image'
// Never use <img> tags — always next/image
// Always provide width + height — prevents CLS
// Above fold: add priority prop
// All others: lazy loaded by default
```

---

## Aspect Ratios
| Context | Ratio | Notes |
|---|---|---|
| Dress / look card | 3:4 (portrait) | Always portrait — never landscape |
| Hero section | 16:9 or full viewport | Cover fill |
| Founder portrait | 4:5 | Slightly portrait |
| Testimonial portrait | 1:1 | Square crop, sharp corners |
| Instagram grid | 1:1 | Square |
| Gallery thumbnails | 3:4 | Same as look card |
| Process / atelier | 4:3 or 16:9 | Landscape editorial |

---

## Placeholder Images (before real photography arrives)
```tsx
// Format: placehold.co/WIDTHxHEIGHT/BACKGROUND/TEXT
// Use our dark tone for hero/editorial placeholders:
`https://placehold.co/800x1067/1a1612/2a2420`  // dress card (3:4)
`https://placehold.co/1440x900/0c0a08/2a2420`  // hero (wide dark)
`https://placehold.co/400x500/b89060/a07840`   // founder portrait (warm)
`https://placehold.co/600x800/e0d0bc/c8b09c`   // atelier/process (light warm)
`https://placehold.co/64x64/c4a882/a08060`     // testimonial portrait (square)
```

---

## Dark Overlay (required on all hero and dark-section images)
```tsx
// Always wrap image in relative container with overlay div
<div className="relative overflow-hidden">
  <Image
    src={src}
    alt={alt}
    fill
    className="object-cover"
    priority={priority}
  />
  {/* Standard dark overlay — always include */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A08]/90 via-[#0C0A08]/20 to-transparent" />
</div>
```

Overlay variants:
```
Hero (text bottom-left):    from-[#0C0A08]/90 via-[#0C0A08]/20 to-transparent
Testimonial (text centered): from-[#0C0A08]/80 to-[#0C0A08]/40
Full dark tint:             bg-[#0C0A08]/60 (flat overlay, no gradient)
```

---

## Parallax Treatment
```tsx
// Apply to hero images and key section images
// Image scrolls 20% slower than the page
// See animation.md for full Framer Motion implementation
// Add: style={{ willChange: 'transform' }} to the motion.div
```

---

## Hover Scale
```tsx
// Apply to LookCard and gallery images
// scale: 1.03, duration: 700ms, ease: luxury ease
// Wrap in overflow-hidden container
// See animation.md for Framer Motion whileHover implementation
```

---

## Real Photography Guidelines (for when Linda provides images)
- Format: WebP preferred, JPEG acceptable
- Minimum resolution: 2000px on longest side
- Naming convention: `collection-dressname-shot.webp`
  Example: `lumiere-solene-hero.webp`, `lumiere-solene-detail-1.webp`
- Store in: `public/brand_assets/photography/`
- Update dummy data imports to point to real paths — zero component changes

### Photography Art Direction for Linda
When briefing Linda or a photographer:
- **Tone:** Dark, editorial, architectural — not bright and airy
- **Background:** Near-black or very dark warm tones
- **Lighting:** Dramatic — one directional source, deep shadows
- **Model:** Serious, present, direct — not smiling or posed
- **Detail shots:** Fabric texture, back details, hand-sewn elements
- **Atelier shots:** Hands working, dress on form, Istanbul workshop

---

## Alt Text Rules
```tsx
// Always descriptive for accessibility
alt="Solène gown from the Lumière Collection — A-line duchess silk crepe"
alt="Linda Monga, founder of LM Weddyli, Lubumbashi"
alt="Detail of hand-sewn buttons on the Solène gown back"
// Never: alt="" on meaningful images
// Empty alt only on purely decorative images
```

---

## Performance Rules
- Hero images: always `priority` — preloaded before render
- Look card images: lazy loaded, but add `loading="eager"` on first 4 visible
- Sizes prop: always specify for responsive images
  ```tsx
  sizes="(max-width: 768px) 50vw, (max-width: 1440px) 33vw, 400px"
  ```
- Never use `fill` without a relative parent that has explicit dimensions
