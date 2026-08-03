# Local Codex system

This folder contains the project-scoped operating layer for Codex. It is intentionally
small and curated for this repository.

## Workflow

1. Read AGENTS.md, PROJECT_INDEX.md, and CODEX_STATE.md.
2. Read the smallest relevant skill under .agents/skills/ before editing.
3. Keep changes scoped, validate with package scripts, and inspect the changed files.
4. Run autoreview before handoff after non-trivial code changes when Git metadata is available.

## Installed project skills

- token-efficient-codex-run — bounded intake and minimal reading.
- frontend-production-ui — production React/Tailwind UI changes.
- pixel-perfect-qa — responsive and visual QA.
- verification-before-completion — evidence before completion claims.
- autoreview — final structured source review.

The project-local set is intentionally smaller than a full external library and does not
overwrite project-adapted instructions.
