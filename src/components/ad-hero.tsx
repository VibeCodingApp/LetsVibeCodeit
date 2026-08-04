'use client';

import { useEffect, useState } from 'react';
import type { SponsorPlacement } from '@/lib/sponsors';
import { SponsorPurchaseButton } from './sponsor-purchase-button';
import { SPONSOR_ROTATION_MS, rotatingSponsorForSlot } from '@/lib/sponsor-rotation';
import { trackSponsorEvent } from '@/lib/sponsor-events';

export function AdSlotHero({ side }: { side: 'left' | 'right' }) {
  const [sponsors, setSponsors] = useState<SponsorPlacement[]>([]);
  const [rotationTick, setRotationTick] = useState(0);
  useEffect(() => {
    fetch('/api/sponsors/active', { cache: 'no-store' }).then(response => response.ok ? response.json() : []).then((items: SponsorPlacement[]) => setSponsors(items.filter(item => item.plan === 'hero'))).catch(() => undefined);
    const timer = window.setInterval(() => setRotationTick(value => value + 1), SPONSOR_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, []);
  const sponsor = rotatingSponsorForSlot(sponsors, `hero-${side}`, rotationTick, 2) || undefined;
  useEffect(() => {
    if (sponsor) trackSponsorEvent(sponsor.sessionId, 'impression', `hero:${side}`);
  }, [sponsor, side]);
  return (
    <aside className={`hero-ad ${side === 'left' ? 'hero-ad-left' : 'hero-ad-right'}`} aria-label="Hero advertisement">
      <div className="w-full">
        {sponsor ? <a href={sponsor.website} target="_blank" rel="sponsored noopener noreferrer" onClick={() => trackSponsorEvent(sponsor.sessionId, 'click', `hero:${side}`)} className={`relative flex h-[360px] w-full flex-col rounded-xl border border-primary/40 bg-[var(--surface)]/80 p-4 no-underline hover:border-primary ${sponsor.creativeMode === 'banner' ? 'justify-end overflow-hidden' : 'items-start justify-start gap-3'}`}>
          {sponsor.creativeMode === 'banner' ? <img src={sponsor.bannerUrl} alt={sponsor.name} className="absolute inset-0 h-full w-full object-cover" /> : <><img src={sponsor.iconUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" /><span className="font-display text-lg font-bold text-fg">{sponsor.name}</span><span className="text-[13px] leading-snug text-muted">{sponsor.description}</span><span className="font-mono text-[10px] uppercase tracking-[0.08em] text-warning">Sponsored</span></>}
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
