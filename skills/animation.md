# SKILL: Animation
## Read this before writing any motion, transition, or animation code.

---

## Core Rules
- Animate ONLY `transform` and `opacity` — never width, height, padding, margin
- Never use `transition-all` — always specify the exact property
- Always wrap animations in `prefers-reduced-motion` check
- Use Framer Motion for all component animations
- Use CSS transitions only for simple hover states (underlines, color changes)

---

## Standard Easing
```ts
// Use this curve everywhere — no exceptions
const ease = [0.16, 1, 0.3, 1] // "luxury ease" — fast out, smooth settle
```

---

## Framer Motion Patterns

### Standard Section Reveal (use on every section entry)
```tsx
const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
}

// Usage
<motion.div
  variants={reveal}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-80px" }}
>
```

### Word-by-Word Hero Text (homepage and page headers)
```tsx
const sentence = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}
const word = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

// Usage — split headline by spaces
const words = headline.split(' ')
<motion.h1 variants={sentence} initial="hidden" animate="visible">
  {words.map((w, i) => (
    <motion.span key={i} variants={word} style={{ display: 'inline-block', marginRight: '0.25em' }}>
      {w}
    </motion.span>
  ))}
</motion.h1>
```

### Staggered List / Grid Items
```tsx
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}
```

### Parallax (hero images and section images)
```tsx
'use client'
import { useScroll, useTransform, motion } from 'framer-motion'
import { useRef } from 'react'

const ref = useRef(null)
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

<div ref={ref} style={{ overflow: 'hidden' }}>
  <motion.div style={{ y }}>
    <Image ... />
  </motion.div>
</div>
```

### Image Hover Scale (LookCard, gallery images)
```tsx
<motion.div
  whileHover={{ scale: 1.03 }}
  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
  style={{ overflow: 'hidden' }}
>
  <Image ... />
</motion.div>
```

### Page Transitions (App Router layout)
```tsx
// In app/(marketing)/layout.tsx
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Step Number Count-Up (Process page)
```tsx
// Animate from 0 to final number when section enters viewport
import { useInView, useMotionValue, useSpring } from 'framer-motion'

const count = useMotionValue(0)
const spring = useSpring(count, { duration: 800 })
// When inView: count.set(targetNumber)
```

### Form Step Transition
```tsx
// Slide out left, slide in from right
const stepVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 }
}
// transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
```

---

## CSS Hover Animations

### Underline Slide (all text CTAs)
```css
.cta-link {
  position: relative;
  text-decoration: none;
}
.cta-link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 0.5px;
  background: currentColor;
  transition: width 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.cta-link:hover::after { width: 100%; }
```

### Nav Background on Scroll
```ts
// Add class to nav when scrollY > 20
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const handler = () => setScrolled(window.scrollY > 20)
  window.addEventListener('scroll', handler)
  return () => window.removeEventListener('scroll', handler)
}, [])
// scrolled ? 'bg-[#F8F4EF]/92 backdrop-blur-sm' : 'bg-transparent'
```

---

## Reduced Motion — Always Required
```tsx
import { useReducedMotion } from 'framer-motion'

const prefersReduced = useReducedMotion()

// Gate all animations
const variants = prefersReduced ? {} : revealVariants
const transition = prefersReduced ? { duration: 0 } : { duration: 0.7 }
```

---

## Performance Rules
- Use `LazyMotion` with `domAnimation` bundle — reduces JS payload
- Never animate more than 12 elements simultaneously
- Parallax: use `will-change: transform` on parallax elements only
- All `whileInView` must have `once: true` — never replay on scroll back
