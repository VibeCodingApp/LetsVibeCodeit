# Local Codex system

This folder contains the project-scoped operating layer for Codex. It is intentionally
small so the repository remains easy to audit and does not depend on copying an entire
external skills library.

## Workflow

1. Read the root `AGENTS.md`, `PROJECT_INDEX.md`, and `CODEX_STATE.md`.
2. Read the smallest relevant skill under `.agents/skills/` before editing.
3. Keep changes scoped, validate with the package scripts, and inspect the diff.
4. Run `autoreview` before handoff after non-trivial code changes.

## Installed project skills

- `token-efficient-codex-run` — bounded intake and minimal reading.
- `frontend-production-ui` — production React/Tailwind UI changes.
- `pixel-perfect-qa` — responsive and visual QA.
- `verification-before-completion` — evidence before completion claims.
- `autoreview` — final structured source review.

This curated set uses the already installed local skill guidance; it does not copy an
entire external library or overwrite project-adapted instructions.
