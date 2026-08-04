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
              {appCount} apps. One question each: can AI replace it, or does a real moat keep it alive?
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
        <div className="container-main border-y border-[var(--border)] py-5">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="text-[12px] text-muted-2 font-mono uppercase tracking-[0.08em]">Collective MRR Destroyed</span>
              <Odometer target={mrr} />
              <span className="text-muted text-sm font-mono">/mo</span>
            </div>
            <p className="text-[11px] text-muted-2 font-mono mt-1">{pricedCount} apps with listed prices counted</p>
          </div>
        </div>
      </section>

      <StatsStrip />

      <AppTable initialRows={rows.slice(0, 60)} categories={categories} />

      <DigestCard />
    </>
  );
}
