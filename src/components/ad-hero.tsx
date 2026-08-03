export function AdSlotHero({ side }: { side: 'left' | 'right' }) {
  return (
    <aside className={`hero-ad ${side === 'left' ? 'hero-ad-left' : 'hero-ad-right'}`} aria-label="Hero advertisement">
      <div className="w-full">
        <div className="w-full h-[360px] border border-dashed border-[var(--border-2)] rounded-xl flex flex-col items-center justify-center text-center p-4 bg-[var(--surface)]/30 gap-4">
          <span className="text-[11px] uppercase tracking-[0.08em] text-muted-2 font-mono">Ad</span>
          <span className="text-[13px] text-muted font-mono leading-snug">promote your product here</span>
          <span className="text-primary font-display font-bold text-xl">$49</span>
          <span className="text-[11px] text-muted-2 font-mono">/30 days</span>
        </div>
      </div>
    </aside>
  );
}
