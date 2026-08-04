const tags = [
  { label: 'Games', className: 'left-[7%] top-[10%] -rotate-6' },
  { label: 'Art', className: 'right-[7%] top-[18%] rotate-6' },
  { label: 'SaaS', className: 'left-[12%] bottom-[23%] rotate-3' },
  { label: 'Tools', className: 'right-[13%] bottom-[11%] -rotate-3' },
  { label: 'Anything', className: 'right-[1%] top-[49%] rotate-2' },
];

export function HeroVibeTags() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {tags.map(tag => <span key={tag.label} className={`absolute rounded-full border border-primary/30 bg-[var(--surface)]/75 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-primary shadow-[0_0_18px_var(--primary-glow)] backdrop-blur-sm ${tag.className}`}><span className="mr-1.5 text-primary">✓</span>{tag.label}</span>)}
    </div>
  );
}
