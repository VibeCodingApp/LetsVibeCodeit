import { getAppRows, getAppCount, getAllApps } from '@/lib/apps';
import { computeMRR, getTopCategories } from '@/lib/filter-apps';
import { SearchBar } from '@/components/search-bar';
import { Ticker } from '@/components/ticker';
import { Odometer } from '@/components/odometer';
import { StatsStrip } from '@/components/stats-strip';
import { AppTable } from '@/components/app-table';
import { DigestCard } from '@/components/digest-card';
import { AdSlotHero } from '@/components/ad-hero';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://letsvibecodeit.com',
    siteName: 'LetsVibeCodeit.com',
    locale: 'en_US',
    title: 'Subscriptions one prompt away from free',
    description: 'The leaderboard of SaaS apps you can replace with a focused build, with honest verdicts and the trade-offs of leaving.',
  },
  twitter: { card: 'summary_large_image', title: 'Subscriptions one prompt away from free' },
};

export default function HomePage() {
  const allApps = getAllApps();
  const rows = getAppRows();
  const appCount = getAppCount();
  const mrr = computeMRR(allApps);
  const pricedCount = allApps.filter(a => !!a.priceMonthly && a.priceMonthly > 0).length;
  const categories = getTopCategories(allApps, 13);

  return (
    <>
      <section className="pt-16 pb-10 md:pt-24 md:pb-14">
        <div className="container-main hero-frame">
          <AdSlotHero side="left" />
          <div className="flex-1 max-w-[600px] text-center mx-auto">
            <h1 className="font-display font-bold text-[clamp(44px,7vw,80px)] leading-tight mb-3">
              Lets{' '}
              <span className="relative inline-block text-primary">
                VibeCode it
              </span>{' '}!
            </h1>
            <p className="text-muted text-base md:text-lg mx-auto mb-10">
              {appCount} SaaS subscriptions. Honest verdicts, real moats, and the exact AI prompt to build your own. Search yours &rarr;
            </p>
            <SearchBar />
          </div>
          <AdSlotHero side="right" />
        </div>
      </section>

      <div className="container-main">
        <Ticker apps={rows} />
      </div>

      <section className="py-6">
        <div className="container-main relative overflow-hidden border-y border-[var(--border)] py-8 md:py-10">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_140%_at_50%_0%,var(--primary-glow),transparent)]" />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border-2)] bg-surface-2/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2 animate-pulse-glow">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" aria-hidden />
              Collective MRR Destroyed
            </span>
            <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
              <Odometer target={mrr} />
              <span className="font-mono text-sm text-muted">/mo</span>
              <span className="rounded-full border border-[var(--border)] bg-surface-2 px-3 py-1 font-mono text-[11px] text-primary">≈ ${(mrr * 12).toLocaleString()}/yr</span>
            </div>
            <p className="font-mono text-[11px] text-muted-2">{pricedCount} apps with listed prices counted</p>
          </div>
        </div>
      </section>

      <StatsStrip />

      <AppTable initialRows={rows.slice(0, 60)} categories={categories} />

      <DigestCard />
    </>
  );
}
