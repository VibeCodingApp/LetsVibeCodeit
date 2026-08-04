'use client';

import { useEffect, useState } from 'react';
import type { SponsorPlacement } from '@/lib/sponsors';
import { SponsorPurchaseButton } from './sponsor-purchase-button';

export function AdSlotHero({ side }: { side: 'left' | 'right' }) {
  const [sponsor, setSponsor] = useState<SponsorPlacement>();
  useEffect(() => {
    fetch('/api/sponsors/active', { cache: 'no-store' }).then(response => response.ok ? response.json() : []).then((items: SponsorPlacement[]) => setSponsor(items.find(item => item.plan === 'hero' && item.slotId === `hero-${side}`))).catch(() => undefined);
  }, [side]);
  return (
    <aside className={`hero-ad ${side === 'left' ? 'hero-ad-left' : 'hero-ad-right'}`} aria-label="Hero advertisement">
      <div className="w-full">
        {sponsor ? <a href={sponsor.website} target="_blank" rel="sponsored noopener noreferrer" className={`relative flex h-[360px] w-full flex-col rounded-xl border border-primary/40 bg-[var(--surface)]/80 p-4 no-underline hover:border-primary ${sponsor.creativeMode === 'banner' ? 'justify-end overflow-hidden' : 'items-start justify-start gap-3'}`}>
          {sponsor.creativeMode === 'banner' ? <><img src={sponsor.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-1 font-mono text-[9px] uppercase text-white">Sponsored</span><span className="relative rounded bg-black/70 px-2 py-1 font-display text-sm font-bold text-white">{sponsor.name}</span></> : <><img src={sponsor.iconUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" /><span className="font-display text-lg font-bold text-fg">{sponsor.name}</span><span className="text-[13px] leading-snug text-muted">{sponsor.description}</span><span className="font-mono text-[10px] uppercase tracking-[0.08em] text-warning">Sponsored</span></>}
        </a> : <SponsorPurchaseButton plan="hero" slotId={`hero-${side}`} ariaLabel={`Buy hero ${side} slot`} className="flex h-[360px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--border-2)] bg-[var(--surface)]/30 p-4 text-center hover:border-primary/30">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-2">Ad</span>
          <span className="font-mono text-[13px] leading-snug text-muted">promote your product here</span>
          <span className="font-display text-xl font-bold text-primary">$49</span>
          <span className="font-mono text-[11px] text-muted-2">/30 days</span>
        </SponsorPurchaseButton>}
      </div>
    </aside>
  );
}
