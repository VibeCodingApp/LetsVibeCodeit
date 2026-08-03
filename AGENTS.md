# AGENTS.md

## Project: Can I Vibecode It v2

Next.js 14 App Router rebuild of canivibecodeit.com with improved UX, AdSense, and sponsor placements.

## Rules

- Every source file must stay under 400 lines. Run `npm run check:loc` before committing.
- Use Tailwind CSS for all styling; no inline styles except dynamic values.
- Prefer Server Components. Only add `"use client"` when interactivity (state, effects, events) is needed.
- All app data lives in `data/apps/*.json`. The lib in `src/lib/apps.ts` loads and filters it.
- Ad slots use `src/components/ad-slot.tsx` with `data-ad-slot` attributes for Google AdSense.
- Sponsor banners use `src/components/sponsor-banner.tsx` with configurable placement.
- Theme (dark/light) is handled via CSS custom properties on `:root` / `.light`, toggled by a `"use client"` component that sets `document.documentElement.className`.
- TypeScript strict mode is on. All props must be typed.

## File Structure

```
src/
  app/            # App Router pages & layouts
  components/     # Reusable UI components
  lib/            # Types, data loading, constants
  hooks/          # Client hooks (useTheme, useSearch)
data/
  apps/           # One JSON file per app (28 fields per schema)
```

## Commands

- `npm run dev` — dev server at localhost:8095
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run check:loc` — enforce 400-line limit
## Codex local skills

This repository keeps a small, project-scoped skill set in .agents/skills/.
Read the relevant SKILL.md before acting:

- token-efficient-codex-run for bounded repository work orders.
- frontend-production-ui for React, Tailwind, responsive, and accessibility changes.
- pixel-perfect-qa for final visual and responsive checks.
- verification-before-completion before claiming a fix is complete.
- autoreview before handoff after non-trivial code edits.

Keep this set curated and reversible. Do not copy an entire external skill library
or overwrite existing project-adapted instructions without checking the current files.