# LM Weddyli — Skills Library
## How Claude uses these files

Before starting any task, read the relevant skill file(s).
Do not rely on general knowledge when a skill exists for the topic.

| Task | Read this skill first |
|---|---|
| Any styling or color decision | `design-system.md` |
| Any animation or transition | `animation.md` |
| Building or modifying a component | `components.md` |
| Any mobile layout or touch behavior | `mobile.md` |
| The inquiry form or any input field | `forms.md` |
| Any image, placeholder, or photography | `images.md` |
| Creating or using data files | `dummy-data.md` |
| Any design decision or layout question | `augen-pro.md` |

## File locations
```
skills/
├── README.md          ← this file (the index)
├── design-system.md   ← colors, typography, spacing, geometry
├── animation.md       ← Framer Motion patterns, easing, performance
├── components.md      ← every reusable component spec
├── mobile.md          ← mobile-first rules, touch targets, breakpoints
├── forms.md           ← inquiry form logic, field styling, qualification
├── images.md          ← next/image rules, overlays, placeholders
├── dummy-data.md      ← TypeScript types, data files, usage patterns
└── augen-pro.md       ← the visual reference — what to copy and what to adapt
```

## Rule
If a task touches multiple areas — read all relevant skills before writing a single line of code.
Example: Building the LookCard component requires reading `components.md` + `images.md` + `animation.md` + `mobile.md`.
