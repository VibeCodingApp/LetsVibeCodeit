function Slot({ n, side }: { n: number; side: 'left' | 'right' }) {
  return (
    <div className="border border-dashed border-[var(--border-2)] rounded px-3 py-2.5 text-center bg-[var(--surface)]/30 hover:border-primary/30 transition-colors duration-200 cursor-default flex flex-col justify-center gap-0.5"
      style={{ height: 'calc((100vh - var(--rail-gap) * 8) / 7)' }}>
      <span className="text-[11px] font-mono text-muted-2 uppercase tracking-[0.06em] leading-none opacity-70">{side === 'left' ? 'L' : 'R'}{n}</span>
      <span className="text-[10px] text-muted-2 font-mono leading-tight">promote your product here</span>
      <span className="text-primary font-display font-bold text-[17px] leading-tight">$199</span>
      <span className="text-[9px] text-muted-2 font-mono leading-tight">/30 days</span>
    </div>
  );
}

export function SponsorRails() {
  return (
    <>
      <style>{`:root{--rail-gap:0.375rem}`}</style>
      <div className="hidden 2xl:flex fixed top-0 bottom-0 left-0 z-40 w-[240px] px-3 pointer-events-none"
        style={{ paddingTop: 'var(--rail-gap)', paddingBottom: 'var(--rail-gap)' }}>
        <div className="flex flex-col pointer-events-auto w-full" style={{ gap: 'var(--rail-gap)' }}>
          {Array.from({ length: 7 }, (_, i) => (
            <Slot key={`l${i}`} n={i + 1} side="left" />
          ))}
        </div>
      </div>
      <div className="hidden 2xl:flex fixed top-0 bottom-0 right-0 z-40 w-[240px] px-3 pointer-events-none"
        style={{ paddingTop: 'var(--rail-gap)', paddingBottom: 'var(--rail-gap)' }}>
        <div className="flex flex-col pointer-events-auto w-full" style={{ gap: 'var(--rail-gap)' }}>
          {Array.from({ length: 7 }, (_, i) => (
            <Slot key={`r${i}`} n={i + 1} side="right" />
          ))}
        </div>
      </div>
    </>
  );
}
