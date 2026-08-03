# LetsVibeCodeit — Project Index

## Product

LetsVibeCodeit is a public, user-facing catalog for deciding whether a SaaS product can be replaced by a focused personal build. It explains the verdict and trade-offs; it does not publish the private build prompts.

## Stack and runtime

- Next.js 14 App Router, React 18, TypeScript strict mode, Tailwind CSS 3.
- Static public catalog in `data/apps/*.json`; 948 records are generated from the private source at `D:\Work\vibelist\apps`.
- No catalog database. `src/lib/apps.ts` reads and caches the JSON records.
- Optional PostHog pageview/search/vote analytics and Google AdSense/sponsor placeholders.

## Public/private boundary

| Boundary | Location | Contract |
| --- | --- | --- |
| Public metadata | `data/apps/*.json` | Names, pricing context, verdicts, trade-offs, alternatives, categories, and counts only. No `prompt` or `promptCurated`. |
| Private source | `D:\Work\vibelist\apps` | Markdown app pages and full prompts. Never commit or push this directory. |
| Importer | `scripts/sync-vibelist.mjs` | Reads private Markdown, writes public-safe metadata, and derives loss notes without storing prompts. |
| Privacy policy | `docs/PUBLIC_DATA_POLICY.md` | Release boundary and required checks. |

## Data flow

```text
D:\Work\vibelist\apps
  -> scripts/sync-vibelist.mjs
  -> data/apps/*.json (public metadata only)
  -> src/lib/apps.ts
  -> homepage, category pages, moat pages, search, and /[slug] detail pages
```

## Page contract

Each `/[slug]` page includes:

1. centered breadcrumb and real domain favicon;
2. title, price, savings context, build time, category, replacement count, verdict badge, moat tags, and tagline;
3. hero ad anchors plus three normal-flow in-list ad breaks;
4. a protected-build-prompt notice with no prompt text or copy/open action;
5. what users lose, prior art, moat explanation, related apps, vote/share actions, and five FAQ entries;
6. a bounded footer aligned to the main page container.

## Verdict semantics

- `yes`: focused personal replacement is realistic; not feature parity.
- `kinda`: core workflow is buildable, but the original has meaningful advantages.
- `no`: the original depends on hard-to-recreate data, network, regulation, trust, infrastructure, or ecosystem.

## Ad behavior

- Hero L/R slots are wired through `src/components/ad-hero.tsx` and remain responsive to viewport width.
- In-list anchors use `src/components/detail-ad-break.tsx` and the existing list ad system.
- Only one in-list ad becomes sticky below the header at a time. The active anchor changes when scrolling in either direction, and the sticky surface uses blur/translucency to prevent visual overlap.
- Ads and sponsor slots stay labeled and separate from verdict copy.

## Key modules

| Module | Path | Purpose |
| --- | --- | --- |
| Public catalog | `data/apps/*.json` | Public-safe product records |
| Catalog sync | `scripts/sync-vibelist.mjs` | Private-source to public-metadata importer |
| Catalog loader | `src/lib/apps.ts` | Load, cache, filter, and relate apps |
| Detail route | `src/app/[slug]/page.tsx` | Product page rendering and metadata |
| FAQ | `src/lib/app-faq.ts`, `src/components/faq.tsx` | App-specific visitor questions |
| Ads | `src/components/ad-hero.tsx`, `src/components/detail-ad-break.tsx`, `src/components/ad-slot.tsx` | Hero and in-list placements |
| Vote/share | `src/components/replace-button.tsx` | Replacement count and sharing |
| Public analytics | `src/lib/posthog.ts`, `src/app/api/stats/route.ts` | Aggregate pageview metrics only |

## Validation

- `npm run dev`
- `npm run lint`
- `npm run check:loc`
- `\.\node_modules\.bin\tsc.cmd --noEmit`
- `npm run build`
- `git diff --check`

## Known risks and next inspection targets

- Full prompts are intentionally unavailable to public builds; do not reintroduce them for visual similarity.
- A public build can describe protected content, but must never embed it in HTML, JSON, client props, analytics, or static assets.
- GitHub publication requires a valid authorized account for the configured remote. Never paste credentials into docs, source, or commit messages.
- When catalog source changes, run the importer, inspect the public-safe diff, run the full validation suite, and update `CODEX_STATE.md`.