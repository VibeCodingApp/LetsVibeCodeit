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

export function MobileAdMarquee({ position }: { position: 'top' | 'bottom' }) {
  const style = { '--ticker-duration': '60s' } as CSSProperties;
  const isTop = position === 'top';
  const trackClass = isTop ? 'animate-ticker' : 'animate-ticker-rev';
  const sectionClass = isTop
    ? 'sticky top-[54px] z-40 border-b border-[var(--border)] bg-[var(--surface)]'
    : 'sticky bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]';
  return (
    <section aria-label="Advertisement" className={`${sectionClass} lg:hidden overflow-hidden`}>
      <div className={`flex w-max ${trackClass} motion-reduce:animate-none py-2`} style={style}>
        {Array.from({ length: 14 }, (_, i) => <Card key={i} labelled={i === 0} />)}
      </div>
    </section>
  );
}
