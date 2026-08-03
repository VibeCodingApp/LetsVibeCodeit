export function SponsorBanner({ name, url, description, tier }: {
  name: string; url: string; description: string; tier: 'gold' | 'silver';
}) {
  const isGold = tier === 'gold';
  return (
    <a href={url} target="_blank" rel="noopener noreferrer sponsored"
      className="block text-center no-underline group py-1.5">
      <div className="flex items-center justify-center gap-1.5">
        <span className="font-display font-semibold text-fg group-hover:text-primary transition-colors text-sm">{name}</span>
        {isGold && <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1 py-0.5 rounded text-black bg-warning leading-none">SPONSOR</span>}
      </div>
      <p className="text-xs text-muted-2 mt-0.5 leading-snug max-w-[260px] mx-auto">{description}</p>
    </a>
  );
}
