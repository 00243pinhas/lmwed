# SKILL: Dummy Data
## Read this before creating any data file or hardcoding content.

---

## Core Rule
Zero hardcoded content in page or component files.
All text, images, and structured content comes from data/dummy/.
When real content arrives — swap the data files. Zero component changes.

---

## File Structure
```
data/
└── dummy/
    ├── collections.ts     ← all dress data
    ├── testimonials.ts    ← all bride testimonials
    ├── rentals.ts         ← rental pieces
    ├── process-steps.ts   ← the 5 process steps
    └── instagram.ts       ← placeholder social posts
```

---

## TypeScript Types

```ts
// types/look.ts
export type Look = {
  slug: string
  name: string
  collection: 'Lumière' | 'Harmattan'
  fabric: string[]
  silhouette: 'A-Line' | 'Ball Gown' | 'Mermaid' | 'Slip' | 'Column'
  sleeves: boolean
  description: string
  detailDescription: string
  productionWeeks: string
  startingPrice: number
  images: {
    hero: string
    gallery: string[]
    card: string
  }
  featured: boolean
}

// types/testimonial.ts
export type Testimonial = {
  id: string
  quote: string
  name: string
  city: string
  country: string
  year: string
  dress: string
  collection: 'Lumière' | 'Harmattan'
  image: string
  featured: boolean  // true = the large featured testimonial
}

// types/rental.ts
export type Rental = {
  id: string
  name: string
  collection: string
  size: string
  euSize: number
  rentalDays: number
  price: number
  currency: 'USD'
  available: boolean
  images: string[]
  fabric: string
}

// types/process-step.ts
export type ProcessStep = {
  number: string     // "01", "02"...
  title: string
  eyebrow: string    // "Week 0 — Free"
  description: string
  detail: string     // small note below
  hasImage: boolean
  imageSrc?: string
}
```

---

## Dummy Data — Collections

```ts
// data/dummy/collections.ts
import type { Look } from '@/types/look'

export const looks: Look[] = [
  {
    slug: 'solene',
    name: 'Solène',
    collection: 'Lumière',
    fabric: ['Duchess Silk Crepe', 'A-Line', 'Chapel Train', 'Corset Back'],
    silhouette: 'A-Line',
    sleeves: false,
    description: 'A fluid A-line silhouette in duchess silk crepe — understated in daylight, luminous under candlelight.',
    detailDescription: 'The draped back with hand-sewn buttons defines this piece entirely. Made to your exact measurements. Every seam placed with intention. No two are identical.',
    productionWeeks: '8 – 10 weeks',
    startingPrice: 1200,
    images: {
      hero: 'https://placehold.co/800x1067/1a1612/2a2420',
      gallery: [
        'https://placehold.co/400x533/1a1612/2a2420',
        'https://placehold.co/400x533/201510/2a2420',
        'https://placehold.co/400x533/181210/2a2420',
        'https://placehold.co/400x533/221814/2a2420',
      ],
      card: 'https://placehold.co/600x800/ede2d0/d8c4a4',
    },
    featured: true,
  },
  {
    slug: 'naomi',
    name: 'Naomi',
    collection: 'Harmattan',
    fabric: ['Tulle Overlay', 'Ball Gown', 'Cathedral Train', 'Strapless'],
    silhouette: 'Ball Gown',
    sleeves: false,
    description: 'A structured ball gown silhouette in layered tulle — presence without noise.',
    detailDescription: 'The Harmattan collection draws from structure and form. Naomi commands a room with quiet authority.',
    productionWeeks: '9 – 11 weeks',
    startingPrice: 1400,
    images: {
      hero: 'https://placehold.co/800x1067/1a1612/2a2420',
      gallery: ['https://placehold.co/400x533/1a1612/2a2420','https://placehold.co/400x533/201510/2a2420','https://placehold.co/400x533/181210/2a2420','https://placehold.co/400x533/221814/2a2420'],
      card: 'https://placehold.co/600x800/e4d8c8/cdb898',
    },
    featured: true,
  },
  { slug: 'elise', name: 'Elise', collection: 'Lumière', fabric: ['Mikado Silk'], silhouette: 'Mermaid', sleeves: false, description: 'Clean Mikado silk — architecture in fabric.', detailDescription: '', productionWeeks: '8 – 10 weeks', startingPrice: 1350, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/c4a07a/a08050' }, featured: false },
  { slug: 'diata', name: 'Diata', collection: 'Harmattan', fabric: ['Organza'], silhouette: 'A-Line', sleeves: true, description: 'Organza layers, long sleeves — an heirloom in the making.', detailDescription: '', productionWeeks: '9 – 11 weeks', startingPrice: 1500, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/ede2d0/d8c4a4' }, featured: false },
  { slug: 'clarisse', name: 'Clarisse', collection: 'Lumière', fabric: ['Chiffon'], silhouette: 'Slip', sleeves: false, description: 'Effortless. Fluid. A slip dress for the modern bride.', detailDescription: '', productionWeeks: '6 – 8 weeks', startingPrice: 950, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/e0d0bc/c8b09c' }, featured: false },
  { slug: 'margot', name: 'Margot', collection: 'Harmattan', fabric: ['Lace', 'Satin'], silhouette: 'A-Line', sleeves: true, description: 'Lace over satin — tradition reimagined.', detailDescription: '', productionWeeks: '10 – 12 weeks', startingPrice: 1600, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/e8d8c4/d4c0a0' }, featured: false },
  { slug: 'isabelle', name: 'Isabelle', collection: 'Lumière', fabric: ['Silk Organza'], silhouette: 'Ball Gown', sleeves: false, description: 'Volume through silk organza — billowing and precise.', detailDescription: '', productionWeeks: '10 – 12 weeks', startingPrice: 1800, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/ede2d0/d8c4a4' }, featured: false },
  { slug: 'rachel', name: 'Rachel', collection: 'Harmattan', fabric: ['Duchess Satin'], silhouette: 'Column', sleeves: false, description: 'Minimal. Column. Powerful.', detailDescription: '', productionWeeks: '7 – 9 weeks', startingPrice: 1100, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/e4d8c8/cdb898' }, featured: false },
  { slug: 'joelle', name: 'Joëlle', collection: 'Harmattan', fabric: ['Tulle', 'Lace'], silhouette: 'A-Line', sleeves: true, description: 'Tulle and lace — romantic and structured at once.', detailDescription: '', productionWeeks: '9 – 11 weeks', startingPrice: 1450, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/c4a07a/a08050' }, featured: false },
  { slug: 'fleur', name: 'Fleur', collection: 'Lumière', fabric: ['Crepe'], silhouette: 'Mermaid', sleeves: false, description: 'A mermaid silhouette in matte crepe — understated drama.', detailDescription: '', productionWeeks: '8 – 10 weeks', startingPrice: 1250, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/ede2d0/d8c4a4' }, featured: false },
  { slug: 'zara', name: 'Zara', collection: 'Lumière', fabric: ['Mikado', 'Tulle'], silhouette: 'Ball Gown', sleeves: false, description: 'Mikado bodice, tulle skirt — two worlds, one dress.', detailDescription: '', productionWeeks: '10 – 12 weeks', startingPrice: 1700, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/e0d0bc/c8b09c' }, featured: false },
  { slug: 'amara', name: 'Amara', collection: 'Harmattan', fabric: ['Heavy Lace'], silhouette: 'A-Line', sleeves: true, description: 'Named for Linda. Made for brides who know exactly who they are.', detailDescription: '', productionWeeks: '10 – 12 weeks', startingPrice: 2000, images: { hero: 'https://placehold.co/800x1067/1a1612/2a2420', gallery: [], card: 'https://placehold.co/600x800/e8d8c4/d4c0a0' }, featured: false },
]
```

---

## Dummy Data — Testimonials

```ts
// data/dummy/testimonials.ts
import type { Testimonial } from '@/types/testimonial'

export const testimonials: Testimonial[] = [
  { id: '1', quote: 'From the first conversation to the final fitting, I felt completely seen. Linda didn\'t just make my dress — she understood what it meant.', name: 'Fatoumata D.', city: 'Brazzaville', country: 'Republic of Congo', year: '2024', dress: 'Naomi', collection: 'Harmattan', image: 'https://placehold.co/64x64/c4a882/a08060', featured: true },
  { id: '2', quote: 'I didn\'t think custom was possible at this price. I had looked everywhere. When my dress arrived, my mother cried before I even put it on.', name: 'Rachel M.', city: 'Lubumbashi', country: 'DRC', year: '2023', dress: 'Elise', collection: 'Lumière', image: 'https://placehold.co/64x64/b8a080/9c8060', featured: false },
  { id: '3', quote: 'My dress arrived and I cried. It was exactly as I had imagined — but more beautiful. Linda added details I hadn\'t even asked for. She just knew.', name: 'Priscilla N.', city: 'Kinshasa', country: 'DRC', year: '2024', dress: 'Solène', collection: 'Lumière', image: 'https://placehold.co/64x64/d0b898/b09870', featured: false },
  { id: '4', quote: 'I was nervous about the measurements process. Linda guided me through every step on WhatsApp. The fit was perfect. I still don\'t know how she did it.', name: 'Joëlle K.', city: 'Goma', country: 'DRC', year: '2023', dress: 'Diata', collection: 'Harmattan', image: 'https://placehold.co/64x64/c8a888/a88868', featured: false },
  { id: '5', quote: 'Wearing my dress felt like wearing a poem. I didn\'t know clothing could feel this personal.', name: 'Cynthia N.', city: 'Lubumbashi', country: 'DRC', year: '2024', dress: 'Margot', collection: 'Harmattan', image: 'https://placehold.co/64x64/b89878/987858', featured: false },
  { id: '6', quote: 'I am in Brazzaville. Linda is in Lubumbashi. The dress was made in Istanbul. And somehow it fit me like it was made in the same room. That is the miracle of working with her.', name: 'Amélie B.', city: 'Brazzaville', country: 'Republic of Congo', year: '2024', dress: 'Fleur', collection: 'Lumière', image: 'https://placehold.co/64x64/c4a07a/a08050', featured: false },
]
```

---

## Data Usage Pattern
```tsx
// In any page or component — always import, never hardcode
import { looks } from '@/data/dummy/collections'
import { testimonials } from '@/data/dummy/testimonials'

// Filter helpers
const featuredLooks = looks.filter(l => l.featured)
const lumiereLooks = looks.filter(l => l.collection === 'Lumière')
const featuredTestimonial = testimonials.find(t => t.featured)
```
