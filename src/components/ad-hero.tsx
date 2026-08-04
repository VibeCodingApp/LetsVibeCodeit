'use client';

import { useEffect, useState } from 'react';
import type { SponsorPlacement } from '@/lib/sponsors';

export function AdSlotHero({ side }: { side: 'left' | 'right' }) {
  const [sponsor, setSponsor] = useState<SponsorPlacement>();
  useEffect(() => {
    fetch('/api/sponsors/active', { cache: 'no-store' }).then(response => response.ok ? response.json() : []).then((items: SponsorPlacement[]) => setSponsor(items.find(item => item.plan === 'hero' && item.slotId === `hero-${side}`))).catch(() => undefined);
  }, [side]);
  return (
    <aside className={`hero-ad ${side === 'left' ? 'hero-ad-left' : 'hero-ad-right'}`} aria-label="Hero advertisement">
      <div className="w-full">
        {sponsor ? <a href={sponsor.website} target="_blank" rel="sponsored noopener noreferrer" className="flex h-[360px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-primary/40 bg-[var(--surface)]/80 p-4 text-center no-underline hover:border-primary">
          <img src={sponsor.iconUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" />
          <span className="font-display text-lg font-bold text-fg">{sponsor.name}</span>
          <span className="text-[13px] leading-snug text-muted">{sponsor.description}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-warning">Sponsored</span>
        </a> : <div className="flex h-[360px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--border-2)] bg-[var(--surface)]/30 p-4 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-2">Ad</span>
          <span className="font-mono text-[13px] leading-snug text-muted">promote your product here</span>
          <span className="font-display text-xl font-bold text-primary">$49</span>
          <span className="font-mono text-[11px] text-muted-2">/30 days</span>
        </div>}
      </div>
    </aside>
  );
}
