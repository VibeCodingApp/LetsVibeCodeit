'use client';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { SponsorPlacement } from '@/lib/sponsors';

function Card({ labelled, sponsor }: { labelled: boolean; sponsor?: SponsorPlacement }) {
  const href = sponsor?.website || '/sponsor';
  return (
    <a href={href} target={sponsor ? '_blank' : undefined} rel={sponsor ? 'sponsored noopener noreferrer' : undefined} aria-hidden={!labelled} tabIndex={labelled ? 0 : -1} className="mx-2 inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-1.5 no-underline transition-colors hover:border-[var(--border-2)]">
      {sponsor ? <img src={sponsor.iconUrl} alt="" className="h-5 w-5 rounded-md object-cover" /> : <span className="rounded-full border border-[var(--border)] bg-[var(--surface-3)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">Ad</span>}
      <span className="whitespace-nowrap font-mono text-[12px] text-fg-2">{sponsor ? sponsor.name : 'promote your product here'}</span>
      {sponsor ? <span className="whitespace-nowrap font-mono text-[11px] text-warning">Sponsored</span> : <><span className="whitespace-nowrap font-mono text-[12px] font-bold text-primary">$199</span><span className="whitespace-nowrap font-mono text-[11px] text-muted-2">/30 days</span></>}
    </a>
  );
}

export function MobileAdMarquee({ position }: { position: 'top' | 'bottom' }) {
  const [active, setActive] = useState<SponsorPlacement[]>([]);
  useEffect(() => {
    fetch('/api/sponsors/active', { cache: 'no-store' }).then(response => response.ok ? response.json() : []).then(setActive).catch(() => undefined);
  }, []);
  const sponsors = active.filter(sponsor => sponsor.plan === 'rail');
  const cards = Array.from({ length: 14 }, (_, index) => sponsors[index % (sponsors.length || 1)]);
  const style = { '--ticker-duration': '60s' } as CSSProperties;
  const isTop = position === 'top';
  const trackClass = isTop ? 'animate-ticker' : 'animate-ticker-rev';
  const sectionClass = isTop
    ? 'sticky top-[54px] z-40 border-b border-[var(--border)] bg-[var(--surface)]'
    : 'sticky bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]';
  return (
    <section aria-label="Advertisement" className={`${sectionClass} lg:hidden overflow-hidden`}>
      <div className={`flex w-max ${trackClass} motion-reduce:animate-none py-2`} style={style}>
         {cards.map((sponsor, index) => <Card key={index} labelled={index === 0} sponsor={sponsor} />)}
      </div>
    </section>
  );
}
