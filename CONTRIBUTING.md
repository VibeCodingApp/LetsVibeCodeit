# Contributing Apps

LetsVibeCodeit is a public catalog. A contribution is one JSON file in `data/apps/<slug>.json`.

## Add An App

1. Create a lowercase, hyphenated slug. The filename must match `slug`.
2. Add every field in the shape below. Use `null` for unavailable prose and `[]` for empty lists.
3. Keep the verdict honest: `yes`, `kinda`, or `no`.
4. Include pricing provenance and a real source URL.
5. Add a runnable, opinionated `prompt` with explicit scope and non-goals.
6. Do not include secrets, tokens, credentials, private URLs, or private research.

```json
{
  "slug": "example-app",
  "name": "Example App",
  "domain": "example.com",
  "category": "dev-tools",
  "subcategory": null,
  "tagline": "One sentence describing the core workflow.",
  "priceMonthly": 19,
  "pricing": {
    "plan": "Pro",
    "basis": "monthly",
    "unit": "flat",
    "source": "https://example.com/pricing",
    "checkedOn": "2026-08-04",
    "confidence": "high",
    "notes": null,
    "native": "$19/mo"
  },
  "verdict": "kinda",
  "verdictConfidence": "medium",
  "verdictSummary": "Honest reasoning for the verdict.",
  "coreLoopDIY": "The focused workflow a personal build can cover.",
  "diyTimeEstimate": "one sitting",
  "requirements": [],
  "whatYouLose": [],
  "moatTags": ["execution-polish"],
  "moatNotes": null,
  "whyPeopleStillPay": "Why the original remains useful.",
  "priorArt": [],
  "relatedSlugs": [],
  "pagePriority": 2,
  "verifiedOneShot": false,
  "notes": "Short editorial note.",
  "prompt": "Build a focused personal replacement with a fixed stack, explicit scope, tests, and non-goals."
}
```

## Checks

Run these before opening a pull request:

```text
npm run lint
npm run check:loc
\.\node_modules\.bin\tsc.cmd --noEmit
npm run build
```

One app per pull request keeps review clear. Sponsorship never changes a verdict, ranking, or vote count. The six-hour catalog sync also watches approved upstream listings and imports only records that pass the same validation.
