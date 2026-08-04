import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAppBySlug, getRelatedApps, getAllApps } from '@/lib/apps';
import { AdSlotHero } from '@/components/ad-hero';
import { AppIcon } from '@/components/app-icon';
import { DetailAdBreak } from '@/components/detail-ad-break';
import { FAQ } from '@/components/faq';
import { PriorArt } from '@/components/prior-art';
import { RelatedApps } from '@/components/related-apps';
import { ReplaceButton } from '@/components/replace-button';
import { PromptViewer } from '@/components/prompt-viewer';
import { VerdictBadge } from '@/components/verdict-badge';
import { WhatYouLose } from '@/components/what-you-lose';
import { getAppFaq } from '@/lib/app-faq';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return getAllApps().map(app => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const app = getAppBySlug(params.slug);
  if (!app) return { title: 'Not Found' };
  return {
    title: `Can I vibecode ${app.name}?`,
    description: app.verdictSummary,
    alternates: { canonical: `/${app.slug}` },
    openGraph: {
      type: 'website',
      url: `https://letsvibecodeit.com/${app.slug}`,
      siteName: 'LetsVibeCodeit.com',
      locale: 'en_US',
      title: `Can I vibecode ${app.name}?`,
      description: app.verdictSummary,
    },
  };
}

function AppMeta({ app }: { app: NonNullable<ReturnType<typeof getAppBySlug>> }) {
  const price = app.priceMonthly === null ? 'varies' : app.priceMonthly === 0 ? 'Free' : `$${app.priceMonthly}/mo`;
  const savings = app.priceMonthly ? `$${app.priceMonthly * 12}/yr` : 'no subscription';
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted">
      <span><strong className="text-fg">price</strong> {price}</span>
      <span><strong className="text-fg">you&apos;d save</strong> <span className="text-primary">{savings}</span></span>
      <span><strong className="text-fg">build time</strong> {app.diyTimeEstimate}</span>
      <span><strong className="text-fg">category</strong> {app.category}</span>
      <span><strong className="text-fg">replaced by</strong> {app.reportedReplacements || 0} people</span>
    </div>
  );
}

export default function AppDetailPage({ params }: { params: { slug: string } }) {
  const app = getAppBySlug(params.slug);
  if (!app) notFound();

  const related = getRelatedApps(params.slug, 6);
  const shareUrl = `https://letsvibecodeit.com/${params.slug}`;
  const shareText = `I just replaced ${app.name} with a focused build`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    description: app.verdictSummary,
    applicationCategory: app.category,
    url: `https://${app.domain}`,
    offers: app.priceMonthly ? { '@type': 'Offer', price: app.priceMonthly, priceCurrency: 'USD' } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative py-8 md:py-10">
        <AdSlotHero side="left" />
        <AdSlotHero side="right" />
        <div className="container-main">
          <div className="detail-stack">
            <div className="font-mono text-xs text-muted">
              <a href="/" className="no-underline transition-colors hover:text-fg">the vibecoded list</a>
              <span className="px-2">/</span>
              <a href={`/category/${encodeURIComponent(app.category)}`} className="no-underline transition-colors hover:text-fg">{app.category}</a>
              <span className="px-2">/</span><span className="text-fg">{app.slug}</span>
            </div>

            <section>
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <AppIcon name={app.name} className="mt-1 h-14 w-14 rounded-2xl text-2xl" />
                  <div className="min-w-0">
                    <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">Can I vibecode {app.name}?</h1>
                    <div className="mt-5"><AppMeta app={app} /></div>
                  </div>
                </div>
                <div className="shrink-0 pt-1"><VerdictBadge verdict={app.verdict} /></div>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
                <span className="uppercase tracking-[0.08em] text-muted-2">MOAT</span>
                {app.moatTags.length ? app.moatTags.map(tag => <span key={tag} className="rounded-full border border-[var(--border)] bg-surface-2 px-3 py-1 text-fg-2">{tag.replace(/-/g, ' ')}</span>) : <span className="rounded-full border border-[var(--border)] bg-surface-2 px-3 py-1">execution polish</span>}
              </div>
              <p className="mt-7 max-w-[760px] text-base leading-relaxed text-muted md:text-lg">{app.tagline}</p>
            </section>

            <DetailAdBreak slot={`detail-hero-${app.slug}`} />

            <section>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em] text-muted">The Build Prompt</h2>
                <span className="font-mono text-[11px] text-muted-2">copy it and go build</span>
              </div>
              {app.prompt ? <PromptViewer slug={app.slug} prompt={app.prompt} /> : <div className="rounded-xl border border-[var(--border)] bg-surface-2 p-5"><p className="font-mono text-sm leading-relaxed text-muted">No public prompt available for {app.name} yet.</p></div>}
            </section>

            <DetailAdBreak slot={`detail-middle-${app.slug}`} />

            <section className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
              <WhatYouLose items={app.whatYouLose} />
              <div className="space-y-8">
                <PriorArt items={app.priorArt} />
                {app.moatNotes && <div><h2 className="mb-3 font-display text-lg font-bold">Why it still works</h2><p className="text-sm leading-relaxed text-muted">{app.moatNotes}</p></div>}
              </div>
            </section>

            <DetailAdBreak slot={`detail-lower-${app.slug}`} />

            <section>
              <RelatedApps apps={related} />
            </section>

            <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-surface-2 p-4">
              <ReplaceButton slug={app.slug} appName={app.name} initialVotes={app.reportedReplacements} />
              <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-surface-3 px-4 py-2 font-mono text-xs font-semibold text-fg-2 no-underline transition-colors hover:border-[var(--border-2)] hover:text-fg">Share on X -&gt;</a>
              <span className="text-xs text-muted-2">Your vote helps rank the vibecoded list.</span>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between"><h2 className="font-mono text-xs uppercase tracking-[0.1em] text-muted-2">Questions</h2><span className="font-mono text-xs text-muted-2">{getAppFaq(app).length} answers</span></div>
              <FAQ items={getAppFaq(app)} />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
