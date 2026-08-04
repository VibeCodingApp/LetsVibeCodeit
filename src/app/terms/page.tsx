import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms for using LetsVibeCodeit and purchasing labeled sponsorship placements.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <article className="container-main py-12 md:py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Terms</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">Clear terms for a clear site.</h1>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-muted">By using LetsVibeCodeit or purchasing a sponsorship, you agree to these simple rules.</p>

      <div className="detail-stack mt-12 max-w-[820px]">
        <section><h2 className="font-display text-2xl font-bold">Catalog content</h2><p className="mt-3 text-sm leading-relaxed text-muted">Verdicts, pricing context, comparisons, and build-time estimates are editorial guidance, not financial, legal, security, or product advice. Pricing and product capabilities can change. The catalog does not promise feature parity or a particular replacement outcome.</p></section>
        <section><h2 className="font-display text-2xl font-bold">Sponsorships</h2><p className="mt-3 text-sm leading-relaxed text-muted">A sponsorship is a labeled placement reserved for 30 days after successful payment and claim approval. It does not renew automatically. Fixed L/R rail placements stay in their selected desktop position and become the corresponding mobile marquee inventory. Hero and in-list placements rotate through their eligible pool across the site.</p></section>
        <section><h2 className="font-display text-2xl font-bold">Creative and links</h2><p className="mt-3 text-sm leading-relaxed text-muted">You must own or have permission to use every banner, icon, description, name, and destination URL you submit. You are responsible for the destination site and its content. We may reject or remove deceptive, unlawful, malicious, infringing, unsafe, or misleading creative without mixing it into editorial verdicts.</p></section>
        <section><h2 className="font-display text-2xl font-bold">Payments and expiration</h2><p className="mt-3 text-sm leading-relaxed text-muted">Stripe processes payments. LetsVibeCodeit does not store card numbers. Each paid placement is a single 30-day reservation and expires without automatic renewal. Abandoned checkouts do not permanently reserve a slot.</p></section>
        <section><h2 className="font-display text-2xl font-bold">Availability and liability</h2><p className="mt-3 text-sm leading-relaxed text-muted">We do not guarantee traffic, impressions, clicks, rankings, conversions, uninterrupted availability, or a specific number of views. The site is provided as-is. To the extent allowed by law, LetsVibeCodeit is not liable for indirect losses caused by catalog decisions, sponsor creative, destination links, provider outages, or changes to third-party products.</p></section>
      </div>
    </article>
  );
}
