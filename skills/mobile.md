# SKILL: Mobile
## Read this before building any page or component. Mobile is primary.

---

## The Reality
Most LM Weddyli clients are on their phones — Instagram and TikTok users.
390px is the primary viewport. Everything else is progressive enhancement.

---

## Breakpoints
```
Base (default): 390px   — iPhone 14, most Android phones
sm:             640px   — large phones / small tablets
md:             768px   — tablets
lg:             1024px  — small desktop
xl:             1280px  — standard desktop
2xl:            1440px  — wide desktop (our design target)
```
Always build base styles first. Add `md:` and `lg:` prefixes for larger screens.

---

## Touch Targets
- Every tappable element: **minimum 44×44px**
- Navigation links: minimum 44px height
- Form fields: minimum 48px height
- Primary submit button: 52px height, full width
- Back links in forms: minimum 44px tap area (add padding if needed)
- The sticky inquiry bar: exactly 64px tall

---

## Typography on Mobile
```
Hero headline:      36px (desktop: 80–100px)
Page headline:      32–36px (desktop: 56–64px)
Section headline:   26–28px (desktop: 36–48px)
Dress name:         18–20px (desktop: 22–28px)
Body:               13px (same on all sizes)
Labels:             9–10px (same on all sizes)
Step numbers:       80px (desktop: 120px)
```

---

## Layout on Mobile

### Navigation
- Logo centered
- Hamburger icon right (min 44×44px tap target)
- Full-screen overlay menu on open:
  - Dark background --dark
  - Links centered, Cormorant 32px, stacked vertically
  - Close button top-right
  - Animate: slide down from top, 350ms

### Grids
- Look grid: always 2 columns, 1px gap
- Testimonial grid: single column
- Measurement cards: 2 columns
- Value cards: single column stacked
- Stats row: 2×2 grid
- Instagram grid: 3 columns (keeps square ratio)

### Process Steps
- Step number: 80px, above content
- No alternating image/text layout — always stacked
- Images: full width, below description

### Timeline (Process page)
- Desktop: horizontal
- Mobile: vertical — stages stacked, connecting line on left side

### Detail Page Split Layout
- Desktop: image fixed left 60% / details scroll right 40%
- Mobile: image full width at top, details below in normal flow

### Horizontal Scrolls
- Gallery thumbnail row: horizontal scroll, each thumb 80vw (peek at next)
- Collection filter: horizontal scroll, no visible scrollbar
- `scrollbar-width: none` + `-webkit-scrollbar: display:none`

---

## Mobile-Specific Components

### Sticky Inquiry Bar
```
Position: fixed bottom-0 left-0 right-0
Height: 64px
Background: #0C0A08
Border-top: 0.5px solid #2A2420
Padding: 0 20px
Display: flex, align-items center, justify-content space-between
Left text: Cormorant 14px, white
Right CTA: Jost 11px uppercase, white, letter-spacing 0.1em
z-index: 50
```
- Show after 40% scroll depth (use IntersectionObserver)
- Hide when main CTA button enters viewport
- Only on mobile: `md:hidden`

### Mobile Menu (Hamburger)
```
Trigger: 3 lines → X animation, 300ms
Overlay: fixed inset-0, bg #0C0A08, z-index 100
Links: Cormorant 32px, weight 300, white, stacked with 40px gap
Sub-links: Jost 11px uppercase, --muted, 24px gap
Close: top-right, 44×44px tap target
```

---

## Testing Checklist (mobile)
Before marking any page done on mobile:
- [ ] No horizontal overflow (test with overflow-x: hidden on body)
- [ ] All touch targets minimum 44px
- [ ] Text readable without zooming
- [ ] Images not cropped unexpectedly
- [ ] Sticky inquiry bar visible and functional
- [ ] Form fields don't cause zoom on iOS (font-size must be ≥16px on inputs to prevent iOS zoom)
- [ ] Navigation hamburger opens and closes correctly
- [ ] Horizontal scroll sections work with touch swipe
- [ ] No content hidden behind sticky nav or sticky bar

---

## iOS-Specific Rules
- Input font-size must be **minimum 16px** to prevent auto-zoom on focus
- Safe area insets for sticky bar: `padding-bottom: env(safe-area-inset-bottom)`
- `-webkit-overflow-scrolling: touch` on horizontal scroll containers
