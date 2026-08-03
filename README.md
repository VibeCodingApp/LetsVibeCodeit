# LetsVibeCodeit

LetsVibeCodeit is a Next.js leaderboard for answering one practical question about SaaS products: can an AI prompt replace it, or does the product still have a real moat?

The site combines a curated catalog of apps with verdicts, runnable prompts, community voting, sponsor placements, Google AdSense anchors, and a public analytics view backed by PostHog.

## What is included

- App Router site built with Next.js 14, React 18, TypeScript strict mode, and Tailwind CSS.
- Static catalog data in `data/apps/*.json`.
- Search, category pages, moat pages, app detail pages, prompt variants, voting, waitlist, and sponsor routes.
- One active in-list ad layer that stays below the sticky header, replaces itself as the user scrolls, and uses backdrop blur while content passes underneath.
- PostHog browser tracking for pageviews, autocapture, prompt copies, app selections, and successful votes.
- `/stats` and the homepage analytics strip reading aggregate values from the PostHog Query API instead of hardcoded numbers.

## Requirements

- Node.js 20 or newer.
- npm.
- A PostHog project for live browser analytics.
- A PostHog personal API key with access to the project for the server-side `/stats` query.

## Local development

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:8095](http://localhost:8095).

Available checks:

```bash
npm run lint
npm run check:loc
npm run build
```

## PostHog setup

PostHog's official wizard can be launched from the project root with:

```bash
npx -y @posthog/wizard@latest
```

The wizard uses an interactive authentication flow. The repository also keeps the resulting integration explicit and reviewable: `posthog-js` is initialized by `src/components/posthog-provider.tsx`, while aggregate metrics are queried server-side by `src/lib/posthog.ts`.

Set these variables in `.env.local` for local use and in the hosting provider for production:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Browser | Public PostHog project token used by `posthog-js`. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Browser | Ingestion host, normally `https://us.i.posthog.com`. |
| `POSTHOG_PERSONAL_API_KEY` | Server only | Bearer credential for the Query API. Never expose it to the browser. |
| `POSTHOG_PROJECT_ID` | Server only | Numeric PostHog project ID used by `/api/stats`. |
| `POSTHOG_API_HOST` | Server only | API host, normally `https://us.posthog.com`. |

The public token is intentionally the only PostHog value prefixed with `NEXT_PUBLIC_`. If the server variables are absent, `/api/stats` returns `503` and the UI shows an honest configuration state rather than fake numbers.

Tracked custom events:

- `prompt_copied`: app name and selected agent variant.
- `verdict_vote`: app slug and verdict after a successful vote request.
- `app_search_selected`: selected app slug and search query.
- Pageviews and browser autocapture are enabled by the provider.

## Repository map

```text
src/app/                 App Router pages and API routes
src/components/          Reusable UI, analytics provider, stats dashboard, ads
src/lib/apps.ts          Catalog loading and normalization
src/lib/posthog.ts       Server-only PostHog Query API adapter
data/apps/               One JSON record per catalog app
scripts/check-loc.mjs    Source-file line-count guard
```

Read `AGENTS.md`, `PROJECT_INDEX.md`, and `CODEX_STATE.md` before making larger changes.

## Security and deployment notes

- `.env`, `.env.local`, and other local environment files are ignored by Git.
- Do not commit a PostHog personal API key or a GitHub token.
- Configure all five PostHog variables in the production host before expecting live analytics.
- The public `/stats` route exposes only aggregate metrics; the personal API key remains on the server.
- Review `npm audit` findings before a production release. This project does not apply `npm audit fix --force` automatically.

## Suggested commit structure

Keep the analytics work reviewable with focused commits:

1. `feat(analytics): integrate PostHog capture and live stats` — SDK initialization, tracked events, Query API adapter, stats endpoint, and live UI.
2. `docs(project): document LetsVibeCodeit setup and PostHog operations` — README, environment contract, event names, and deployment notes.


## Public repository redaction policy

The GitHub mirror intentionally excludes the actual app-generation prompts. Public data files keep the catalog schema but replace prompt values with empty redacted values, and the UI explains that the prompt content is private. Real environment files, personal API keys, GitHub tokens, private keys, passwords, and deployment credentials are also excluded.