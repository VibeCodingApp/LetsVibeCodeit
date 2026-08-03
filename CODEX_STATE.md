# CODEX_STATE

## Current session

- Date: 2026-08-03
- Status: Public-data sanitization in progress; local pre-sanitization commit `55ce8b3` was not pushed.
- Repository: `D:\Work\vebecoder`
- Private source: `D:\Work\vibelist\apps`
- Intended GitHub repository: `letsvibecodeit`

## Completed before sanitization

- Connected all 948 product records and added `linktree`, `getwaitlist`, `qr`, `shots`, `testimonial-to`, and `uptime`.
- Added product detail routes with real favicons, metadata, verdicts, what-you-lose, prior art, related apps, FAQ, vote/share actions, hero ads, in-list ads, and centered footer.
- Added `scripts/sync-vibelist.mjs` and `npm run sync:vibelist`.
- Verified desktop/mobile pages locally and generated 1,061 routes in the production build.

## Security decision now in force

- Full prompts are private source material and must not be committed, pushed, served, embedded, copied into analytics, or hidden in public HTML/JSON-LD/build artifacts.
- `data/apps/*.json` has been sanitized to public metadata only; 948 records remain.
- Product pages now show a protected-content notice instead of prompt text or agent/copy actions.
- Prompt-copy analytics and agent-variant UI were removed from the public app.
- README is user-facing and intentionally avoids internal implementation detail.
- `AGENTS.md`, `PROJECT_INDEX.md`, and `docs/PUBLIC_DATA_POLICY.md` contain the detailed agent contract.

## Validation already known

- Before this sanitization: `npm run lint`, `npm run check:loc`, strict TypeScript, and `npm run build` passed; build generated 1,061 routes.
- Desktop/mobile QA passed on `/testimonial-to` and `/uptime` before the privacy recut.
- Autoreview could not complete because its review bundle rejects the 948-record catalog and prompt-like descriptions as secret-like content; this limitation must be reported, not bypassed by publishing sensitive material.

## Next actions

1. Run the sanitized catalog scan, lint, LOC, strict typecheck, build, and diff check.
2. Run autoreview on the code/documentation diff if the bundle permits; otherwise record the size limitation.
3. Amend the local commit so its history contains only public-safe data.
4. Authenticate to the intended GitHub account without exposing the token, push, and verify the remote SHA.
5. Confirm the public remote contains no prompt fields or prompt text.

## Security

- No environment files, API keys, GitHub tokens, private keys, or deployment credentials belong in this repository.
- Any credential pasted into chat should be rotated by the owner after use.