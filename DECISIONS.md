# DECISIONS.md

## Architectural decisions

### 1. Next.js App Router vs Pages Router
**Decision:** App Router
**Reason:** Modern standard, Server Components, better data fetching patterns.

### 2. Static JSON files vs database
**Decision:** Static JSON files in `data/apps/`
**Reason:** No server needed. Data changes via PRs (like the original repo). Simple, fast, verifiable.

### 3. Tailwind CSS vs CSS Modules
**Decision:** Tailwind CSS
**Reason:** Faster development, smaller component files, consistent design tokens. Custom properties for theming.

### 4. Client vs Server Components
**Decision:** Server by default, `"use client"` only for interactive components.
**Reason:** Better performance, smaller JS bundle. Only search, filters, theme toggle, and form need client interactivity.

### 5. Ad placement strategy
**Decision:** Dedicated `<AdSlot />` and `<SponsorBanner />` components placed at strategic breakpoints (every 8th table row, sidebar on desktop, below hero).
**Reason:** Unobtrusive, configurable, matches site aesthetic.

### 6. Theme system
**Decision:** CSS custom properties on `:root` (dark) / `.light` class, toggled via a `"use client"` ThemeToggle.
**Reason:** Pure CSS theming, no runtime cost for 99% of components, works with Tailwind's `dark:` variant.
### 7. Single active sticky in-list ad layer
Decision: Keep each ad anchor in document flow and render one fixed active layer below the header.
Reason: Native per-slot position sticky did not hold reliably in the current scroll container. A shared layer guarantees one visible slot, handles both scroll directions, preserves list geometry, and lets the active surface use backdrop blur without stacking multiple ads.