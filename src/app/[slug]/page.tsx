import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAppBySlug, getRelatedApps, getAllApps } from '@/lib/apps';
import { VerdictBadge } from '@/components/verdict-badge';
import { PromptBox } from '@/components/prompt-box';
import { WhatYouLose } from '@/components/what-you-lose';
import { PriorArt } from '@/components/prior-art';
import { RelatedApps } from '@/components/related-apps';
import { VoteButton } from '@/components/vote-button';
import { FAQ } from '@/components/faq';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return getAllApps().map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const app = getAppBySlug(params.slug);
  if (!app) return { title: 'Not Found · LetsVibeCodeit.com' };
  return {
    title: `Can I vibecode ${app.name}? · LetsVibeCodeit.com`,
    description: app.verdictSummary,
    openGraph: { title: `Can I vibecode ${app.name}?`, description: app.verdictSummary },
  };
}

export default function AppDetailPage({ params }: { params: { slug: string } }) {
  const app = getAppBySlug(params.slug);
  if (!app) notFound();

  const related = getRelatedApps(params.slug, 6);
  const price = app.priceMonthly === null ? '—' : app.priceMonthly === 0 ? 'Free' : `$${app.priceMonthly}/mo`;
  const shareUrl = `https://letsvibecodeit.com/${params.slug}`;
  const shareText = `Can you vibecode ${app.name}? ${app.verdict.toUpperCase()} — ${app.verdictSummary.split('.')[0]}.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    description: app.verdictSummary,
    applicationCategory: app.category,
    offers: app.priceMonthly ? { '@type': 'Offer', price: app.priceMonthly, priceCurrency: 'USD' } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-main py-10 md:py-12">
        <div className="mb-6">
          <a href="/" className="text-xs text-muted hover:text-fg no-underline font-mono transition-colors">← the death list</a>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
          <img src={`https://www.google.com/s2/favicons?domain=${app.domain}&sz=64`} alt="" width={40} height={40} className="w-10 h-10 rounded-lg shrink-0" style={{ imageRendering: 'auto' }} />
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{app.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted font-mono mb-3">
              <span>{app.category}</span><span>·</span><span>{price}</span><span>·</span><VerdictBadge verdict={app.verdict} />
            </div>
            <p className="text-muted text-sm leading-relaxed max-w-[640px]">{app.verdictSummary}</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="font-display text-lg font-bold mb-3">The Prompt</h3>
          {app.prompt ? <PromptBox prompt={app.prompt} appName={app.name} /> : <div className="bg-surface-2 border border-[var(--border)] rounded-xl p-5 text-sm text-muted">Prompt content withheld from the public repository.</div>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 mb-10">
          <WhatYouLose items={app.whatYouLose} />
          <div className="space-y-6">
            <PriorArt items={app.priorArt} />
            {app.moatTags.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-bold mb-2">Moats</h3>
                <div className="flex flex-wrap gap-1.5">
                  {app.moatTags.map(t => <span key={t} className="px-2.5 py-1 rounded-full font-mono text-[11px] font-medium bg-surface-3 text-muted border border-[var(--border)]">{t}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-10"><RelatedApps apps={related} /></div>

        <div className="flex flex-wrap items-center gap-4 mb-10 p-4 rounded-xl border border-[var(--border)] bg-surface-2">
          <VoteButton slug={params.slug} />
          <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono text-xs font-semibold border border-[var(--border)] bg-surface-3 text-fg-2 hover:text-fg hover:border-[var(--border-2)] transition-all no-underline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share on X
          </a>
          <span className="text-xs text-muted-2">Community votes determine the leaderboard</span>
        </div>

        <div className="mb-10">
          <FAQ items={[
            { q: 'What does this verdict mean?', a: app.verdict === 'yes' ? 'YES means you can vibecode a personal replacement in one sitting. The app does one thing well, and that thing is reproducible by an AI coding agent.' : app.verdict === 'kinda' ? 'KINDA means you can build a working version in a weekend, but real gaps remain — lost integrations, polish, or scale features.' : 'NOT REALLY means the value of the product is the network, the data, or the infrastructure. You cannot one-shot a replacement.' },
            { q: 'Is the prompt really free?', a: 'Yes. Every prompt on this site is free forever. Paywalling the prompts would be brand poison. The whole site is MIT licensed.' },
            { q: "Why would people still pay for this?", a: app.whyPeopleStillPay || 'For the convenience, integrations, and ecosystem that a DIY build cannot replicate.' },
          ]} />
        </div>
      </div>
    </>
  );
}
