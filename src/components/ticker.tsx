import type { AppRow } from '@/lib/types';

export function Ticker({ apps }: { apps: AppRow[] }) {
  const priced = apps.filter(a => (a.priceMonthly ?? 0) > 0);
  if (!priced.length) return null;
  const track = [...priced, ...priced].map(a => `<span class="flex items-center gap-1.5 px-5 whitespace-nowrap font-mono text-[13px] text-fg-2 border-r border-[var(--border)]"><span class="font-medium text-fg">${a.name}</span><span class="text-danger line-through opacity-70">$${a.priceMonthly}/mo</span></span>`).join('');
  return (
    <div className="overflow-hidden border-y border-[var(--border)] my-0 py-3">
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]" dangerouslySetInnerHTML={{ __html: track }} />
    </div>
  );
}
