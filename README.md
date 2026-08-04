# LetsVibeCodeit

LetsVibeCodeit is a practical guide to deciding whether a SaaS subscription can be replaced by a focused personal build.

Each product page helps you answer four questions:

- Can the core workflow be rebuilt responsibly?
- What would you lose by leaving the original service?
- Which alternatives are worth looking at first?
- Why might people still pay for the original product?

## How to read a verdict

- **YES**: a focused personal replacement is realistic. It will not reproduce every hosted feature or guarantee.
- **KINDA**: the visible core is buildable, but the original still has meaningful advantages such as integrations, polish, data, scale, or support.
- **NOT REALLY**: the value depends heavily on a network, proprietary data, regulated infrastructure, a mature ecosystem, or another hard-to-recreate advantage.

The verdict is about a practical replacement for one person or a small team, not a claim that the original product is obsolete.

## How the pages work

Product pages show the price context, build time, category, verdict, moat notes, what you lose, prior art, related products, a replacement vote, sharing, and FAQs. The home page aggregates the total MRR of every listed subscription, and lets you search, filter, and sort the catalog.

Votes are stored locally in the browser, so your "I replaced this" and verdict votes survive reloads and instantly update counts and ranking for you. They are not aggregated across visitors.

Ads are labeled so they are easy to distinguish from editorial content:

- Hero ads appear around the main introduction.
- L and R sponsor slots are fixed on wide screens beside the page.
- On mobile the same sponsor slots become sticky marquee bands below the header and above the footer.
- In-list ads appear between content sections. Only one can become sticky below the header at a time; it changes as you scroll and uses blur so content passing underneath stays readable.

## Sponsorships and digest

Sponsors choose an available placement and pay a one-time 30-day Stripe Checkout session. After Stripe confirms payment, they upload a PNG/WebP icon, product name, optional website, and a description of up to 70 characters. The placement is stored with its expiration date, appears in the selected slot, and becomes available again automatically when the 30 days end. Sponsorships do not auto-renew.

The weekly digest is sent by a protected Vercel Cron route through Resend. It includes apps recorded as newly added in the catalog history and only sponsors who purchased the Weekly digest placement. Production email delivery requires a verified Resend sender configured as `RESEND_FROM_EMAIL`.

## Public repository

[github.com/VibeCodingApp/LetsVibeCodeit](https://github.com/VibeCodingApp/LetsVibeCodeit)

This repository does not contain passwords, API keys, GitHub tokens, private keys, environment files, or deployment credentials. It does contain the public catalog: product metadata, verdicts, trade-offs, alternatives, categories, pricing context, and — by explicit owner decision — the full build prompt for every product. Source research notes are maintained privately outside this repository.

## Run locally

```text
npm install
npm run dev
```

Open `http://localhost:8095`.

## Commands

- `npm run lint` — ESLint
- `npm run check:loc` — 400-line guard
- `npm run build` — production build
- `npm run sync:vibelist` — rebuild public-safe metadata from the private source

## Server environment

Keep server-only values in `.env.local` or the deployment provider, never in Git:

- `STRIPE_SECRET_KEY` — Stripe Checkout and sponsorship file metadata
- `RESEND_API_KEY` — digest audience, confirmations, and weekly sends
- `RESEND_FROM_EMAIL` — verified sender used by Resend
- `CRON_SECRET` — authorization for the weekly digest cron
