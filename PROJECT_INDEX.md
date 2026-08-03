# LetsVibeCodeit — Project Index

## What this project is

A static Next.js leaderboard of SaaS apps that can be replaced with AI-generated alternatives. Each app has a verdict, runnable prompt, and list of what users lose by leaving the original service.

## Current stack

- Next.js 14 App Router, React 18, TypeScript strict mode, Tailwind CSS 3.
- Static app data in data/apps/*.json; no database or server state.
- Client-side filtering in src/components/app-table.tsx.
- PostHog browser analytics via posthog-js.
- Server-side aggregate analytics through the PostHog Query API.
- Optional Google AdSense placeholders and sponsor placements.

## Key modules

| Module | Path | Purpose |
| --- | --- | --- |
| App data | data/apps/*.json | One JSON file per app |
| App lib | src/lib/apps.ts | Load and cache app data |
| Filtering | src/lib/filter-apps.ts | Category, verdict, search, and sorting |
| Layout | src/app/layout.tsx | Root layout, fonts, metadata, providers |
| PostHog provider | src/components/posthog-provider.tsx | Browser initialization and pageview/autocapture |
| Stats adapter | src/lib/posthog.ts | Server-only HogQL queries and aggregate metric mapping |
| Stats API | src/app/api/stats/route.ts | Public aggregate endpoint with safe 503/502 states |
| Stats UI | src/components/stats-dashboard.tsx | Live /stats dashboard, refreshed every 60 seconds |
| Homepage stats | src/components/stats-strip.tsx | Live aggregate strip on the homepage |
| Death list | src/components/app-table.tsx | Filters, chunked tables, and in-list ad anchors |
| Ad layer | src/components/ad-slot.tsx | Single active sticky layer |
| Header | src/components/header.tsx | Sticky 54px navigation header |
| Shared styles | src/app/globals.css | Tailwind layers and CSS custom properties |

## PostHog data contract

Browser variables:

- NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
- NEXT_PUBLIC_POSTHOG_HOST

Server-only variables:

- POSTHOG_PERSONAL_API_KEY
- POSTHOG_PROJECT_ID
- POSTHOG_API_HOST

The browser sends pageviews/autocapture plus prompt_copied, verdict_vote, and app_search_selected. The /api/stats route queries pageview and prompt_copied events and returns peak daily views, 24-hour views, seven-day views, seven-day visitors, and seven-day prompt copies. It never returns credentials.

## In-list ad behavior

Ads remain in normal document flow at each interval, but their active visual is rendered through one fixed layer at the header boundary. useStickyAdIndex selects the last ad anchor that has crossed that boundary, regardless of scroll direction. The active layer disappears outside the death-list section and uses a translucent background plus backdrop blur.

## Validation commands

- npm run dev — development server at localhost:8095
- npm run build — production build
- npm run lint — ESLint
- npm run check:loc — enforce 400-line limit
- .\node_modules\.bin\tsc.cmd --noEmit — strict typecheck

## Known risks

- This checkout started without .git metadata; GitHub publication requires initializing Git locally.
- PostHog live values remain unavailable until the five environment variables are configured in local/production hosting.
- npm install reports five high-severity dependency advisories; no forced audit fix was applied.
- The published PostHog wizard needs an interactive authenticated terminal; its command is documented in README and the integration is kept explicit in source.
- Visual report upload to external Lazyweb was skipped because the local screenshot payload was not approved for external transmission.