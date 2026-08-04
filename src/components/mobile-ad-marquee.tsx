'use client';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { SponsorPlacement } from '@/lib/sponsors';
import { SponsorPurchaseButton } from './sponsor-purchase-button';
import { trackSponsorEvent } from '@/lib/sponsor-events';

function Card({ labelled, slotId, sponsor }: { labelled: boolean; slotId: string; sponsor?: SponsorPlacement }) {
  const href = sponsor?.website || '/sponsor';
  useEffect(() => {
    if (sponsor) trackSponsorEvent(sponsor.sessionId, 'impression', `marquee:${slotId}`);
  }, [sponsor, slotId]);
  if (!sponsor) return <SponsorPurchaseButton plan="rail" slotId={slotId} labelled={labelled} ariaLabel={slotId === 'left-1' ? 'Open free test slot L1' : `Buy fixed rail slot ${slotId}`} className="mx-2 inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)]/80 px-4 py-1.5 font-normal backdrop-blur-sm transition-colors hover:border-[var(--border-2)]"><span className="rounded-full border border-[var(--border)] bg-[var(--surface-3)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">{slotId === 'left-1' ? 'Test' : 'Ad'}</span><span className="whitespace-nowrap font-mono text-[12px] text-fg-2">{slotId === 'left-1' ? 'free test slot' : 'promote your product here'}</span><span className="whitespace-nowrap font-mono text-[12px] font-bold text-primary">{slotId === 'left-1' ? '$0' : '$199'}</span><span className="whitespace-nowrap font-mono text-[11px] text-muted-2">{slotId === 'left-1' ? 'no payment' : '/30 days'}</span></SponsorPurchaseButton>;
  return (
    <a href={href} target={sponsor ? '_blank' : undefined} rel={sponsor ? 'sponsored noopener noreferrer' : undefined} onClick={() => sponsor && trackSponsorEvent(sponsor.sessionId, 'click', `marquee:${slotId}`)} aria-hidden={!labelled} tabIndex={labelled ? 0 : -1} className={`mx-2 inline-flex shrink-0 items-center gap-2.5 rounded-full border bg-[var(--surface-2)] px-4 py-1.5 no-underline transition-colors ${sponsor ? 'border-warning/80 shadow-[0_0_12px_var(--warning-dim)]' : 'border-[var(--border)] hover:border-[var(--border-2)]'}`}>
      {sponsor ? <img src={sponsor.marqueeIconUrl} alt="" className="h-5 w-8 rounded-md object-cover" /> : <span className="rounded-full border border-[var(--border)] bg-[var(--surface-3)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">Ad</span>}
      <span className="whitespace-nowrap font-mono text-[12px] text-fg-2">{sponsor ? sponsor.marqueeText : 'promote your product here'}</span>
      {sponsor ? null : <><span className="whitespace-nowrap font-mono text-[12px] font-bold text-primary">$199</span><span className="whitespace-nowrap font-mono text-[11px] text-muted-2">/30 days</span></>}
    </a>
  );
}

export function MobileAdMarquee({ position }: { position: 'top' | 'bottom' }) {
  const [active, setActive] = useState<SponsorPlacement[]>([]);
  useEffect(() => {
    fetch('/api/sponsors/active').then(response => response.ok ? response.json() : []).then(setActive).catch(() => undefined);
  }, []);
  const side = isTopPosition(position) ? 'left' : 'right';
  const slotIds = Array.from({ length: 7 }, (_, index) => `${side}-${index + 1}`);
  const sideSponsors = active.filter(sponsor => sponsor.plan === 'rail' && sponsor.slotId.startsWith(`${side}-`));
  const sponsorsFirst = sideSponsors.slice(0, 7).map((sponsor, index) => ({ slotId: `${side}-sponsor-${index}`, sponsor }));
  const emptySlots = sideSponsors.length < 7 ? [{ slotId: slotIds.find(slotId => !sideSponsors.some(sponsor => sponsor.slotId === slotId)) || `${side}-empty`, sponsor: undefined }] : [];
  const sequence = [...sponsorsFirst, ...emptySlots];
  const cards = [...sequence, ...sequence];
  const duration = sideSponsors.length ? Math.max(45, sequence.length * 14) : 75;
  const style = { '--ticker-duration': `${duration}s` } as CSSProperties;
  const isTop = position === 'top';
  const trackClass = isTop ? 'animate-ticker' : 'animate-ticker-rev';
  const sectionClass = isTop
    ? 'sticky top-[54px] z-40 border-b border-[var(--border)] bg-[var(--surface)]'
    : 'sticky bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]';
  return (
    <section aria-label="Advertisement" className={`${sectionClass} lg:hidden overflow-hidden`}>
      <div className={`flex w-max ${trackClass} motion-reduce:animate-none py-2`} style={style}>
         {cards.map((card, index) => <Card key={index} slotId={card.slotId} labelled={index === 0} sponsor={card.sponsor} />)}
      </div>
    </section>
  );
}

function isTopPosition(position: 'top' | 'bottom'): boolean {
  return position === 'top';
}
