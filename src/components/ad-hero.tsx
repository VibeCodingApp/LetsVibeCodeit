export function AdSlotHero({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className="hidden 2xl:block absolute top-0"
      style={side === 'left'
        ? { right: 'calc(50% + 480px + 16px)' }
        : { left: 'calc(50% + 480px + 16px)' }
      }
    >
      <div className="w-[200px]">
        <div className="w-full h-[360px] border border-dashed border-[var(--border-2)] rounded-xl flex flex-col items-center justify-center text-center p-4 bg-[var(--surface)]/30 gap-4">
          <span className="text-[11px] uppercase tracking-[0.08em] text-muted-2 font-mono">Ad</span>
          <span className="text-[13px] text-muted font-mono leading-snug">promote your product here</span>
          <span className="text-primary font-display font-bold text-xl">$99</span>
          <span className="text-[11px] text-muted-2 font-mono">/30 days</span>
        </div>
      </div>
    </div>
  );
}
