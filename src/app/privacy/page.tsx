import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How LetsVibeCodeit handles analytics, newsletter signups, sponsor submissions, and payments.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <article className="container-main py-12 md:py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Privacy</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">No selling. No snooping.</h1>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-muted">LetsVibeCodeit does not sell, rent, or trade personal information. We do not read your files, messages, device contents, or private browsing activity. We only process information that you intentionally submit or the limited metrics needed to understand how this public site is used.</p>

      <div className="detail-stack mt-12 max-w-[820px]">
        <section><h2 className="font-display text-2xl font-bold">What we receive</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted"><li>Newsletter emails that visitors voluntarily submit to the weekly digest.</li><li>Sponsor information voluntarily submitted after checkout: product name, creative assets, destination URL, description, and placement details.</li><li>Payment and checkout information processed by Stripe. We do not receive or store full card numbers.</li></ul></section>
        <section><h2 className="font-display text-2xl font-bold">Analytics</h2><p className="mt-3 text-sm leading-relaxed text-muted">We use PostHog for our own public-interest metrics: unique visits, page views, searches, votes, and interactions. This helps us publish aggregate site activity and understand which parts of the catalog are useful. We do not use this data to sell audiences or target ads, and sponsor placements do not receive private visitor identities.</p></section>
        <section><h2 className="font-display text-2xl font-bold">Storage and providers</h2><p className="mt-3 text-sm leading-relaxed text-muted">Newsletter contacts are managed by Resend. Sponsor placement data and compressed creative assets are stored in our Neon Postgres database so the selected slot can render and expire correctly. Stripe handles payment checkout. These providers process data under their own terms and security practices.</p></section>
        <section><h2 className="font-display text-2xl font-bold">Your choices</h2><p className="mt-3 text-sm leading-relaxed text-muted">You can unsubscribe from the digest using its unsubscribe link. You can request correction or deletion of a sponsor submission by contacting the project owner through the repository. We do not require accounts for catalog browsing.</p></section>
        <section><h2 className="font-display text-2xl font-bold">Changes</h2><p className="mt-3 text-sm leading-relaxed text-muted">We may update this policy when the site or its providers change. The effective version is the one published on this page.</p></section>
      </div>
    </article>
  );
}
