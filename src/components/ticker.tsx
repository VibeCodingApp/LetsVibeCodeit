import type { AppRow } from '@/lib/types';
import type { CSSProperties } from 'react';

export function Ticker({ apps }: { apps: AppRow[] }) {
  const priced = apps.filter(a => (a.priceMonthly ?? 0) > 0);
  if (!priced.length) return null;
  const MAX_ITEMS = 48;
  const sample = priced.length <= MAX_ITEMS
    ? priced
    : priced.filter((_, i) => i % Math.ceil(priced.length / MAX_ITEMS) === 0).slice(0, MAX_ITEMS);
  const track = [...sample, ...sample].map(a => `<span class="flex items-center gap-1.5 px-5 whitespace-nowrap font-mono text-[13px] text-fg-2 border-r border-[var(--border)]"><span class="font-medium text-fg">${a.name}</span><span class="text-danger line-through">$${a.priceMonthly}/mo</span></span>`).join('');
  const durationSeconds = Math.max(180, Math.round(sample.length * 3.5));
  const tickerStyle = { '--ticker-duration': `${durationSeconds}s` } as CSSProperties;
  return (
    <div className="overflow-hidden border-y border-[var(--border)] my-0 py-3">
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]" style={tickerStyle} dangerouslySetInnerHTML={{ __html: track }} />
    </div>
  );
}
