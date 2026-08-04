import type { CSSProperties } from 'react';

function Card({ labelled }: { labelled: boolean }) {
  return (
    <a href="/sponsor" aria-hidden={!labelled} tabIndex={labelled ? 0 : -1} className="mx-2 inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-1.5 no-underline transition-colors hover:border-[var(--border-2)]">
      <span className="rounded-full border border-[var(--border)] bg-[var(--surface-3)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">Ad</span>
      <span className="whitespace-nowrap font-mono text-[12px] text-fg-2">promote your product here</span>
      <span className="whitespace-nowrap font-mono text-[12px] font-bold text-primary">$49</span>
      <span className="whitespace-nowrap font-mono text-[11px] text-muted-2">/30 days</span>
    </a>
  );
}

function Track({ direction, labelled }: { direction: 'fwd' | 'rev'; labelled: boolean }) {
  const style = { '--ticker-duration': '60s' } as CSSProperties;
  return (
    <div
      className={`flex w-max ${direction === 'fwd' ? 'animate-ticker' : 'animate-ticker-rev'} motion-reduce:animate-none py-2`}
      style={style}
      aria-hidden={!labelled}
    >
      {Array.from({ length: 14 }, (_, i) => <Card key={i} labelled={labelled && i === 0} />)}
    </div>
  );
}

export function MobileAdMarquee() {
  return (
    <section aria-label="Advertisement" className="lg:hidden overflow-hidden border-y border-[var(--border)] bg-[var(--surface)]">
      <Track direction="fwd" labelled />
      <Track direction="rev" labelled={false} />
    </section>
  );
}
