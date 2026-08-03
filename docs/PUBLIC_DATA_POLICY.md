# Public Data Policy

## Purpose

Keep the public LetsVibeCodeit repository useful without publishing the private material that makes the catalog valuable.

## Public

The public build may contain product name, domain, category, pricing context, build-time estimate, verdict, confidence, tagline, moat labels, trade-offs, alternatives, FAQ copy, replacement counts, page structure, ad placement behavior, and public aggregate analytics.

## Private

The following must remain outside GitHub and outside the public page:

- complete build prompts and prompt variants;
- raw Markdown source from `D:\Work\vibelist\apps` when it contains prompt sections;
- private research notes, unpublished app pages, credentials, access tokens, environment files, private keys, and deployment secrets.

The public catalog must not include a `prompt` or `promptCurated` field. A page may explain that its build prompt is protected, but it must not include a copy button, agent deep link, prompt text, character count, prompt-derived analytics, or prompt content hidden in HTML, JSON-LD, JavaScript, or build artifacts.

## Import rule

`scripts/sync-vibelist.mjs` can read the private source to derive safe descriptive fields and loss notes. Its output is public metadata only. Before staging an import, verify that the output contains no prompt fields and no prompt text.

## Release check

Before any push, scan tracked and staged files for prompt fields and secret patterns, confirm the public catalog count and six additional slugs, run lint/LOC/typecheck/build/diff checks, and review the remote and staged diff.