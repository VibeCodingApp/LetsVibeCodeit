'use client';

import { useEffect, useState } from 'react';
import type { SponsorPlacement } from '@/lib/sponsors';
import { SponsorPurchaseButton } from './sponsor-purchase-button';
import { trackSponsorEvent } from '@/lib/sponsor-events';

function Slot({ n, side, sponsor }: { n: number; side: 'left' | 'right'; sponsor?: SponsorPlacement }) {
  const slotId = `${side}-${n}`;
  useEffect(() => {
    if (sponsor) trackSponsorEvent(sponsor.sessionId, 'impression', `rail:${slotId}`);
  }, [sponsor, slotId]);
  if (sponsor?.slotId === slotId) {
    return (
      <a href={sponsor.website} target="_blank" rel="sponsored noopener noreferrer" onClick={() => trackSponsorEvent(sponsor.sessionId, 'click', `rail:${slotId}`)} aria-label={`${sponsor.name} sponsored placement`} className={`relative overflow-hidden border border-primary/40 rounded px-3 py-2.5 text-center bg-[var(--surface)]/80 hover:border-primary transition-colors duration-200 flex flex-col ${sponsor.creativeMode === 'banner' ? 'justify-end' : 'items-start justify-start'} gap-1 no-underline`} style={{ height: 'calc((100vh - var(--rail-gap) * 8) / 7)' }}>
        {sponsor.creativeMode === 'banner' ? <img src={sponsor.bannerUrl} alt={sponsor.name} className="absolute inset-0 h-full w-full object-cover" /> : <><img src={sponsor.iconUrl} alt="" className="h-8 w-8 rounded-lg object-cover" /><span className="text-left text-[12px] font-display font-bold text-fg">{sponsor.name}</span><span className="line-clamp-2 text-left text-[10px] text-muted-2 font-mono leading-tight">{sponsor.description}</span><span className="text-[9px] font-mono uppercase tracking-[0.08em] text-warning">Sponsored</span></>}
      </a>
    );
  }
  return (
    <SponsorPurchaseButton plan="rail" slotId={slotId} ariaLabel={`Buy fixed rail slot ${side === 'left' ? 'L' : 'R'}${n}`} className="border border-dashed border-[var(--border-2)] rounded px-3 py-2.5 text-center bg-[var(--surface)]/65 backdrop-blur-sm hover:border-primary/30 transition-colors duration-200 flex flex-col justify-center gap-0.5 no-underline"
      style={{ height: 'calc((100vh - var(--rail-gap) * 8) / 7)' }}>
      <span className="text-[11px] font-mono text-muted-2 uppercase tracking-[0.06em] leading-none">{side === 'left' ? 'L' : 'R'}{n}</span>
      <span className="text-[10px] text-muted-2 font-mono leading-tight">{slotId === 'left-1' ? 'free test slot' : 'promote your product here'}</span>
      <span className="text-primary font-display font-bold text-[17px] leading-tight">{slotId === 'left-1' ? '$0' : '$199'}</span>
      <span className="text-[9px] text-muted-2 font-mono leading-tight">{slotId === 'left-1' ? 'no payment' : '/30 days'}</span>
    </SponsorPurchaseButton>
  );
}

export function SponsorRails() {
  const [active, setActive] = useState<SponsorPlacement[]>([]);
  useEffect(() => {
    fetch('/api/sponsors/active').then(response => response.ok ? response.json() : []).then(setActive).catch(() => undefined);
  }, []);
  return (
    <>
      <style>{`:root{--rail-gap:0.375rem}`}</style>
      <div className="hidden 2xl:flex fixed top-0 bottom-0 left-0 z-40 w-[240px] px-3 pointer-events-none"
        style={{ paddingTop: 'var(--rail-gap)', paddingBottom: 'var(--rail-gap)' }}>
        <div className="flex flex-col pointer-events-auto w-full" style={{ gap: 'var(--rail-gap)' }}>
            {Array.from({ length: 7 }, (_, i) => (
              <Slot key={`l${i}`} n={i + 1} side="left" sponsor={active.find(sponsor => sponsor.slotId === `left-${i + 1}`)} />
          ))}
        </div>
      </div>
      <div className="hidden 2xl:flex fixed top-0 bottom-0 right-0 z-40 w-[240px] px-3 pointer-events-none"
        style={{ paddingTop: 'var(--rail-gap)', paddingBottom: 'var(--rail-gap)' }}>
        <div className="flex flex-col pointer-events-auto w-full" style={{ gap: 'var(--rail-gap)' }}>
            {Array.from({ length: 7 }, (_, i) => (
              <Slot key={`r${i}`} n={i + 1} side="right" sponsor={active.find(sponsor => sponsor.slotId === `right-${i + 1}`)} />
          ))}
        </div>
      </div>
    </>
  );
}
