# AGENTS.md

## Project: LetsVibeCodeit

Next.js 14 App Router product catalog for deciding whether SaaS products can be replaced by focused personal builds.

## Non-negotiable data boundary

- This repository is public-facing. Never commit or publish full build prompts, source research, private prompt pages, API keys, tokens, passwords, private keys, `.env` files, deployment credentials, or private exports.
- The private source of truth is `D:\Work\vibelist\apps`. It is outside this repository and must remain outside GitHub.
- `data/apps/*.json` is the public catalog. It may contain product metadata, verdict explanations, trade-offs, alternatives, categories, pricing context, and replacement counts. It must not contain `prompt` or `promptCurated` fields.
- `scripts/sync-vibelist.mjs` may read private Markdown to derive public-safe metadata and loss notes, but it must never write the prompt into `data/apps`. Treat any generated prompt text as sensitive and verify the target before publishing.
- If a prompt appears in a tracked file, stop, remove it from the public diff, scan again, and do not push until clean.

## Product interpretation contract

- `yes`: a focused personal replacement is realistic in one sitting or a similarly bounded effort; this does not mean feature parity.
- `kinda`: the core workflow is buildable, but the original has meaningful advantages in integrations, polish, scale, proprietary data, support, or ecosystem.
- `no`: the original depends heavily on network effects, proprietary data, regulated infrastructure, trust, or a mature ecosystem that a small build cannot honestly reproduce.
- Product pages must explain the verdict through price/build-time context, moat tags, tagline, what users lose, prior art, related products, vote/share actions, and FAQ. Do not expose private prompts as a substitute for this explanation.

## Ads and layout contract

- Keep the existing header and page container centered; the footer must stay inside the same bounded container and must not stretch edge to edge.
- `AdSlotHero` owns the hero L/R ad positions. They may be hidden at narrow breakpoints when the rails would obstruct content, but must remain wired into the page.
- `DetailAdBreak` owns normal-flow in-list ad anchors on product pages.
- In-list ads are represented by anchors in document flow. The sticky layer may show only one active ad at a time beneath the header, switches when another anchor crosses the boundary in either scroll direction, and uses a translucent surface plus `backdrop-blur` so content passing underneath is not visually mounted.
- Ad and sponsor content must remain visibly labeled and must not be mixed with editorial verdict copy.

## Repository rules

- Every source file must stay under 400 lines. Run `npm run check:loc` before committing.
- Use Tailwind CSS for styling. Avoid inline styles except dynamic values.
- Prefer Server Components. Use client components only for state, effects, or browser events.
- TypeScript strict mode is enabled; keep props typed.
- All public catalog data is loaded by `src/lib/apps.ts` from `data/apps/*.json`.
- Keep API handlers thin, validate input, and do not leak internal errors.
- Do not add dependencies without checking deployment impact.
- Do not change unrelated files or use destructive Git commands.

## Important paths

```text
src/app/                 App Router pages and API routes
src/app/[slug]/          Public product detail pages
src/components/          Shared UI, ad, FAQ, vote, and layout components
src/lib/apps.ts          Public catalog loader and related-app queries
src/lib/types.ts         Public data contracts
scripts/sync-vibelist.mjs Public-safe catalog importer
data/apps/               Public metadata only
docs/                    Agent-facing policies and project map
```

## Commands

- `npm run dev` — development server at `http://localhost:8095`
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run check:loc` — 400-line guard
- `\.\node_modules\.bin\tsc.cmd --noEmit` — strict typecheck
- `npm run sync:vibelist` — rebuild public-safe metadata from the private source; inspect the diff before staging

## Security validation before push

1. Verify no tracked file contains `prompt`, `promptCurated`, full prompt text, `.env` content, tokens, keys, or private credentials.
2. Verify `data/apps` still contains the expected public record count.
3. Run lint, LOC, TypeScript, build, and `git diff --check`.
4. Review the exact staged file list and remote before pushing.
5. If a credential has been pasted into chat or a terminal, recommend rotation and never place it in docs or commits.

Read `docs/PUBLIC_DATA_POLICY.md`, `PROJECT_INDEX.md`, and `CODEX_STATE.md` before large changes.